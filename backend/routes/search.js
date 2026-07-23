const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Post = require("../models/Post")
const { optionalAuth } = require("../middleware/auth")

router.get("/", optionalAuth, async (req, res) => {
  try {
    const { q, type, page, limit } = req.query
    if (!q || !q.trim()) {
      return res.status(400).json({ error: "Search query is required" })
    }

    const searchType = type || "all"
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 20
    const skip = (pageNum - 1) * limitNum

    const results = {}

    if (searchType === "all" || searchType === "users") {
      const userRegex = new RegExp(q.replace(/[@#]/g, ""), "i")
      const users = await User.find({
        $or: [
          { username: userRegex },
          { displayName: userRegex },
          { name: userRegex },
          { bio: userRegex },
          { interests: userRegex },
        ],
        isBanned: { $ne: true },
      })
        .select("username displayName name avatar bio badge level xp followerCount isVerified")
        .skip(skip)
        .limit(limitNum)
        .sort({ followerCount: -1 })

      results.users = users
      results.userCount = await User.countDocuments({
        $or: [
          { username: userRegex },
          { displayName: userRegex },
          { name: userRegex },
          { bio: userRegex },
          { interests: userRegex },
        ],
        isBanned: { $ne: true },
      })
    }

    if (searchType === "all" || searchType === "posts") {
      const searchRegex = new RegExp(q.replace(/[@#]/g, ""), "i")
      const postQuery = {
        $and: [
          {
            $or: [
              { content: searchRegex },
              { tags: { $regex: searchRegex } },
              { hashtags: { $regex: searchRegex } },
            ],
          },
          { isArchived: false },
          { moderationAction: { $ne: "removed" } },
        ],
      }

      if (q.startsWith("#")) {
        const tag = q.slice(1).toLowerCase()
        postQuery.$and[0].$or = [{ hashtags: tag }, { tags: tag }]
      }

      const posts = await Post.find(postQuery)
        .sort({ likeCount: -1, commentCount: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("author", "username displayName name avatar isVerified")

      results.posts = posts
      results.postCount = await Post.countDocuments(postQuery)
    }

    res.json(results)
  } catch (err) {
    console.error("Search error:", err)
    res.status(500).json({ error: "Search failed" })
  }
})

router.get("/leaderboard", async (req, res) => {
  try {
    const type = req.query.type || "xp"
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    let sortField = { xp: -1 }
    if (type === "reputation") sortField = { reputation: -1 }
    else if (type === "streak") sortField = { streak: -1 }

    const users = await User.find({ isBanned: { $ne: true } })
      .select("username displayName name avatar level xp reputation streak followerCount badges")
      .sort(sortField)
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments({ isBanned: { $ne: true } })
    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + users.length < total },
    })
  } catch (err) {
    console.error("Leaderboard error:", err)
    res.status(500).json({ error: "Failed to load leaderboard" })
  }
})

router.get("/user/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params
    let user = null
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier).select("-password")
    }
    if (!user) {
      user = await User.findOne({ username: identifier.toLowerCase() }).select("-password")
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json({ user })
  } catch (err) {
    console.error("User lookup error:", err)
    res.status(500).json({ error: "Failed to find user" })
  }
})

router.get("/suggestions", optionalAuth, async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 2) return res.json({ users: [], hashtags: [] })

    const regex = new RegExp(q, "i")
    const [users, hashtags] = await Promise.all([
      User.find({
        $or: [{ username: regex }, { displayName: regex }],
        isBanned: { $ne: true },
      })
        .select("username displayName name avatar")
        .limit(5)
        .sort({ followerCount: -1 }),
      Post.aggregate([
        { $match: { hashtags: { $regex: regex } } },
        { $unwind: "$hashtags" },
        { $group: { _id: "$hashtags", count: { $sum: 1 } } },
        { $match: { _id: { $regex: regex } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ])

    res.json({
      users,
      hashtags: hashtags.map((h) => ({ tag: h._id, count: h.count })),
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to get suggestions" })
  }
})

module.exports = router
