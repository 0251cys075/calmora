const express = require("express")
const router = express.Router()
const Post = require("../models/Post")
const User = require("../models/User")
const Notification = require("../models/Notification")
const Block = require("../models/Block")
const { auth, optionalAuth } = require("../middleware/auth")

function moderateContent(text) {
  const spamPatterns = [
    /\b(buy now|click here|free money|subscribe|follow me|check out my)\b/i,
    /(https?:\/\/[^\s]+){3,}/,
    /([!?.]){5,}/,
  ]
  const abusePatterns = [
    /\b(fuck|shit|ass|bitch|damn|dick|piss|bastard)\b/i,
    /\b(hate|kill|die|hurt|attack)\s+(you|yourself|everyone|people)\b/i,
    /\b(suicide|kill yourself|end it|self.harm)\b/i,
    /\b(spam|scam|fraud)\b/i,
  ]
  let flags = { isSpam: false, isAbusive: false, isHarassment: false, isHarmful: false }
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) { flags.isSpam = true; break }
  }
  for (const pattern of abusePatterns) {
    if (pattern.test(text)) { flags.isAbusive = true; break }
  }
  const harassmentWords = /\b(idiot|stupid|dumb|loser|worthless|ugly|fat|retard|crazy)\b/i
  if (harassmentWords.test(text)) flags.isHarassment = true
  if (flags.isAbusive && flags.isHarassment) flags.isHarmful = true
  return flags
}

router.get("/feed", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const tag = req.query.tag
    const hashtag = req.query.hashtag
    const author = req.query.author

    let query = { isArchived: false, moderationAction: { $ne: "removed" } }
    if (tag) query.tags = tag
    if (hashtag) query.hashtags = hashtag.toLowerCase()
    if (author) query.author = author

    if (req.user) {
      const blockedUsers = await Block.find({ blocker: req.user._id }).select("blocked")
      const blockedIds = blockedUsers.map((b) => b.blocked)
      if (blockedIds.length > 0) query.author = { $nin: blockedIds }
    }

    const posts = await Post.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username displayName name avatar badge level xp isVerified")
      .populate("reposts.user", "username displayName name avatar")

    const total = await Post.countDocuments(query)

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + posts.length < total },
    })
  } catch (err) {
    console.error("Feed error:", err)
    res.status(500).json({ error: "Failed to load feed" })
  }
})

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username displayName name avatar badge level xp isVerified")
      .populate("reposts.user", "username displayName name avatar")
    if (!post) return res.status(404).json({ error: "Post not found" })
    res.json({ post })
  } catch (err) {
    res.status(500).json({ error: "Failed to load post" })
  }
})

router.post("/", auth, async (req, res) => {
  try {
    const { content, media, tags, mentions } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Post content is required" })
    }

    const moderation = moderateContent(content)
    let moderationAction = "approved"
    if (moderation.isHarmful) moderationAction = "removed"
    else if (moderation.isAbusive) moderationAction = "flagged"
    else if (moderation.isSpam) moderationAction = "spam"

    const hashtags = [...new Set(content.match(/#[\w-]+/gi)?.map((h) => h.slice(1).toLowerCase()) || [])]
    const mentionNames = [...new Set(content.match(/@[\w-]+/gi)?.map((m) => m.slice(1).toLowerCase()) || [])]
    const mentionedUsers = mentionNames.length > 0
      ? await User.find({ username: { $in: mentionNames } }).select("_id")
      : []

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      media: media || [],
      tags: tags || [],
      mentions: mentionedUsers.map((u) => u._id),
      hashtags,
      moderationAction,
      isModerated: moderationAction !== "approved",
      moderationReason: moderation.isHarmful
        ? "Content removed for containing potentially harmful language"
        : moderation.isAbusive
          ? "Flagged for review: potentially abusive content"
          : moderation.isSpam ? "Flagged as spam" : undefined,
    })

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { postCount: 1, xp: 10, reputation: 2 },
    })

    for (const mentionedUser of mentionedUsers) {
      if (mentionedUser._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: mentionedUser._id,
          actor: req.user._id,
          type: "mention",
          post: post._id,
        })
      }
    }

    const populated = await Post.findById(post._id)
      .populate("author", "username displayName name avatar badge level xp isVerified")

    res.status(201).json({ post: populated, moderated: moderationAction !== "approved" })
  } catch (err) {
    console.error("Create post error:", err)
    res.status(500).json({ error: "Failed to create post" })
  }
})

router.patch("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only edit your own posts" })
    }

    const { content, media, tags } = req.body
    if (content !== undefined) {
      const moderation = moderateContent(content)
      post.content = content.trim()
      post.isEdited = true
      const hashtags = [...new Set(content.match(/#[\w-]+/gi)?.map((h) => h.slice(1).toLowerCase()) || [])]
      post.hashtags = hashtags
      if (moderation.isHarmful) {
        post.moderationAction = "removed"
        post.isModerated = true
        post.moderationReason = "Content removed for containing potentially harmful language"
      }
    }
    if (media !== undefined) post.media = media
    if (tags !== undefined) post.tags = tags

    await post.save()
    const populated = await Post.findById(post._id)
      .populate("author", "username displayName name avatar badge level xp isVerified")
    res.json({ post: populated })
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }
    await Post.findByIdAndDelete(req.params.id)
    await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: -1 } })
    res.json({ message: "Post deleted" })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" })
  }
})

router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })
    const userId = req.user._id
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString())
    if (alreadyLiked) {
      post.likes.pull(userId)
      post.likeCount = Math.max(0, post.likeCount - 1)
    } else {
      post.likes.push(userId)
      post.likeCount += 1
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          actor: userId,
          type: "like",
          post: post._id,
        })
      }
    }
    await post.save()
    res.json({ liked: !alreadyLiked, likeCount: post.likeCount })
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like" })
  }
})

router.post("/:id/repost", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })
    const userId = req.user._id
    const existing = post.reposts.find((r) => r.user.toString() === userId.toString())
    if (existing) {
      post.reposts.pull({ _id: existing._id })
      post.repostCount = Math.max(0, post.repostCount - 1)
      await post.save()
      return res.json({ reposted: false, repostCount: post.repostCount })
    }
    post.reposts.push({ user: userId, thought: req.body.thought || "" })
    post.repostCount += 1
    await post.save()
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.author,
        actor: userId,
        type: "repost",
        post: post._id,
      })
    }
    await User.findByIdAndUpdate(userId, { $inc: { xp: 5, reputation: 1 } })
    res.json({ reposted: true, repostCount: post.repostCount })
  } catch (err) {
    res.status(500).json({ error: "Failed to repost" })
  }
})

router.post("/:id/save", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })
    const userId = req.user._id
    const alreadySaved = post.saves.some((id) => id.toString() === userId.toString())
    if (alreadySaved) {
      post.saves.pull(userId)
      post.saveCount = Math.max(0, post.saveCount - 1)
    } else {
      post.saves.push(userId)
      post.saveCount += 1
    }
    await post.save()
    res.json({ saved: !alreadySaved, saveCount: post.saveCount })
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle save" })
  }
})

router.post("/:id/pin", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only pin your own posts" })
    }
    await Post.updateMany({ author: req.user._id }, { isPinned: false })
    post.isPinned = !post.isPinned
    await post.save()
    res.json({ pinned: post.isPinned })
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle pin" })
  }
})

router.post("/:id/report", auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { reportCount: 1 } })
    if (!post) return res.status(404).json({ error: "Post not found" })
    const Report = require("../models/Report")
    await Report.create({
      reporter: req.user._id,
      targetType: "post",
      target: post._id,
      reason: req.body.reason || "other",
      description: req.body.description,
    })
    res.json({ message: "Report submitted" })
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" })
  }
})

module.exports = router
