const express = require("express")
const router = express.Router()
const Report = require("../models/Report")
const Post = require("../models/Post")
const Comment = require("../models/Comment")
const User = require("../models/User")
const { adminAuth } = require("../middleware/auth")

router.get("/reports", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const status = req.query.status || "pending"

    const reports = await Report.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reporter", "username displayName name email")
      .lean()

    const total = await Report.countDocuments({ status })

    for (const report of reports) {
      if (report.targetType === "post") {
        report.targetData = await Post.findById(report.target)
          .populate("author", "username displayName name")
      } else if (report.targetType === "comment") {
        report.targetData = await Comment.findById(report.target)
          .populate("author", "username displayName name")
      } else if (report.targetType === "user") {
        report.targetData = await User.findById(report.target)
          .select("username displayName name email avatar bio")
      }
    }

    const counts = {
      pending: await Report.countDocuments({ status: "pending" }),
      reviewed: await Report.countDocuments({ status: "reviewed" }),
      dismissed: await Report.countDocuments({ status: "dismissed" }),
      action_taken: await Report.countDocuments({ status: "action_taken" }),
    }

    res.json({
      reports,
      counts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + reports.length < total },
    })
  } catch (err) {
    console.error("Admin reports error:", err)
    res.status(500).json({ error: "Failed to load reports" })
  }
})

router.patch("/reports/:id", adminAuth, async (req, res) => {
  try {
    const { status, action } = req.body
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ error: "Report not found" })

    report.status = status || report.status
    report.reviewedBy = req.user._id
    report.reviewedAt = new Date()
    if (action) report.action = action
    await report.save()

    if (status === "action_taken") {
      if (report.targetType === "post") {
        await Post.findByIdAndUpdate(report.target, {
          moderationAction: "removed",
          isModerated: true,
          moderationReason: action || "Removed by moderator",
        })
      } else if (report.targetType === "comment") {
        await Comment.findByIdAndUpdate(report.target, { isModerated: true })
      } else if (report.targetType === "user") {
        await User.findByIdAndUpdate(report.target, { isBanned: true, banReason: action })
      }
    }

    res.json({ report })
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" })
  }
})

router.get("/flagged-posts", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const posts = await Post.find({
      moderationAction: { $in: ["flagged", "spam"] },
      isModerated: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username displayName name email")

    const total = await Post.countDocuments({
      moderationAction: { $in: ["flagged", "spam"] },
      isModerated: true,
    })

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + posts.length < total },
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to load flagged posts" })
  }
})

router.patch("/posts/:id/moderate", adminAuth, async (req, res) => {
  try {
    const { action } = req.body
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })

    if (action === "approve") {
      post.moderationAction = "approved"
      post.isModerated = false
      post.moderationReason = undefined
    } else if (action === "remove") {
      post.moderationAction = "removed"
      post.isModerated = true
      post.moderationReason = "Removed by moderator"
    }

    await post.save()
    res.json({ post })
  } catch (err) {
    res.status(500).json({ error: "Failed to moderate post" })
  }
})

router.get("/users", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password")

    const total = await User.countDocuments()
    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + users.length < total },
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to load users" })
  }
})

router.patch("/users/:id", adminAuth, async (req, res) => {
  try {
    const { isBanned, banReason, isAdmin, isModerator, isVerified } = req.body
    const update = {}
    if (isBanned !== undefined) update.isBanned = isBanned
    if (banReason !== undefined) update.banReason = banReason
    if (isAdmin !== undefined) update.isAdmin = isAdmin
    if (isModerator !== undefined) update.isModerator = isModerator
    if (isVerified !== undefined) update.isVerified = isVerified

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password")
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" })
  }
})

router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [userCount, postCount, commentCount, reportCount, flaggedCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Post.countDocuments({ moderationAction: { $in: ["flagged", "spam"] }, isModerated: true }),
    ])
    res.json({ stats: { userCount, postCount, commentCount, pendingReports: reportCount, flaggedPosts: flaggedCount } })
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" })
  }
})

module.exports = router
