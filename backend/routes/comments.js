/**
 * @file comments.js
 * @description Express routes handling comment submission, retrieval, updates, 
 * deletions, and liking within community posts. Manages nested comment hierarchies (replies).
 */

const express = require("express")
const router = express.Router()
const Comment = require("../models/Comment")
const Post = require("../models/Post")
const Notification = require("../models/Notification")
const { auth } = require("../middleware/auth")

/**
 * @route GET /api/comments/post/:postId
 * @desc Retrieves paginated comments for a post. Populates top-level comments and their immediate replies.
 */
router.get("/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Find top-level comments only (parentComment = null)
    const comments = await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username displayName name avatar badge isVerified")

    const total = await Comment.countDocuments({ post: postId, parentComment: null })

    // Populate immediate nested replies for each comment
    for (const comment of comments) {
      comment._doc.replies = await Comment.find({ parentComment: comment._id })
        .sort({ createdAt: 1 })
        .populate("author", "username displayName name avatar badge isVerified")
    }

    res.json({
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + comments.length < total },
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to load comments" })
  }
})

/**
 * @route POST /api/comments/post/:postId
 * @desc Submits a new comment or a reply to an existing comment. Updates counts and creates notifications.
 */
router.post("/post/:postId", auth, async (req, res) => {
  try {
    const { postId } = req.params
    const { content, parentCommentId } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" })
    }

    let depth = 0
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId)
      if (!parent) return res.status(404).json({ error: "Parent comment not found" })
      
      depth = parent.depth + 1
      if (depth > 3) return res.status(400).json({ error: "Reply depth limit reached" })
      
      // Increment reply counter on parent
      await Comment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: 1 } })
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentCommentId || null,
      depth,
    })

    const populated = await Comment.findById(comment._id)
      .populate("author", "username displayName name avatar badge isVerified")

    // Update comment counter on the referenced post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })

    // Notify post author if another user comments or replies
    const post = await Post.findById(postId).select("author")
    if (post && post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: parentCommentId ? "reply" : "comment",
        post: postId,
        comment: comment._id,
      })
    }

    // Clean up read notifications of the same type to avoid inbox flooding
    await Notification.deleteMany({ comment: parentCommentId, type: "reply", read: true })

    res.status(201).json({ comment: populated })
  } catch (err) {
    console.error("Create comment error:", err)
    res.status(500).json({ error: "Failed to create comment" })
  }
})

/**
 * @route PATCH /api/comments/:id
 * @desc Modifies an existing comment body if requested by the author.
 */
router.patch("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ error: "Comment not found" })
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only edit your own comments" })
    }
    
    comment.content = req.body.content.trim()
    comment.isEdited = true
    await comment.save()
    
    const populated = await Comment.findById(comment._id)
      .populate("author", "username displayName name avatar badge isVerified")
    res.json({ comment: populated })
  } catch (err) {
    res.status(500).json({ error: "Failed to update comment" })
  }
})

/**
 * @route DELETE /api/comments/:id
 * @desc Deletes a comment. Only authorized for comment author or admins.
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ error: "Comment not found" })
    if (comment.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" })
    }
    
    await Comment.findByIdAndDelete(req.params.id)
    
    // Decrement comment counter on post
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } })
    res.json({ message: "Comment deleted" })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" })
  }
})

/**
 * @route POST /api/comments/:id/like
 * @desc Toggles like state on a comment.
 */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ error: "Comment not found" })
    
    const userId = req.user._id
    const alreadyLiked = comment.likes.some((id) => id.toString() === userId.toString())
    
    if (alreadyLiked) {
      comment.likes.pull(userId)
      comment.likeCount = Math.max(0, comment.likeCount - 1)
    } else {
      comment.likes.push(userId)
      comment.likeCount += 1
    }
    
    await comment.save()
    res.json({ liked: !alreadyLiked, likeCount: comment.likeCount })
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like" })
  }
})

module.exports = router
