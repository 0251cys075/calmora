/**
 * @file Comment.js
 * @description Mongoose database model for post comments.
 * Supports nested replies (threaded comments up to a depth of 3), likes, and user mentions.
 */

const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  // Post target reference
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  
  // Comment author reference
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Text body content
  content: { type: String, required: true, maxlength: 2000 },
  
  // Support for nested comment trees
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  depth: { type: Number, default: 0, max: 3 }, // Maximum allowed reply nesting depth
  
  // Interactions
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Status states
  isEdited: { type: Boolean, default: false },
  isModerated: { type: Boolean, default: false },
}, { timestamps: true })

// Indexes for fast comment listing per post and user queries
commentSchema.index({ post: 1, createdAt: 1 })
commentSchema.index({ author: 1 })

module.exports = mongoose.model("Comment", commentSchema)
