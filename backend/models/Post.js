/**
 * @file Post.js
 * @description Mongoose database model for Calmora community posts.
 * Supports content strings, custom attachments (images, video, voice), tags, likes, reposts, 
 * bookmark saves, moderation action histories, and handles full-text indexes for feed searching.
 */

const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
  // Core Post Properties
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 5000 },
  
  // Media Attachments
  media: [{
    type: { type: String, enum: ["image", "video", "gif", "voice"], required: true },
    url: { type: String, required: true },
    thumbnail: String,
    duration: Number,
  }],
  
  // Metadata & Categorization
  tags: [{ type: String, lowercase: true, trim: true, maxlength: 50 }],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  hashtags: [{ type: String, lowercase: true, trim: true }],

  // Interaction Counters & Arrays
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },

  reposts: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    thought: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
  repostCount: { type: Number, default: 0 },

  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  saveCount: { type: Number, default: 0 },

  commentCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },

  // UI & Lifecycle States
  isEdited: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },

  // Content Moderation Fields
  isModerated: { type: Boolean, default: false },
  moderationReason: { type: String },
  moderationAction: { type: String, enum: ["approved", "flagged", "removed", "spam"], default: "approved" },

  // Backend Rewards & Flags
  xpReward: { type: Number, default: 10 }, // XP awarded to the user upon posting
  reportCount: { type: Number, default: 0 }, // Number of times flagged by community
}, { timestamps: true })

// Indexing configurations for fast querying and feeds
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ hashtags: 1 })
postSchema.index({ tags: 1 })
postSchema.index({ createdAt: -1 })

// Full-text search index for keyword queries on post content and tags
postSchema.index({ content: "text", "tags": "text" })

module.exports = mongoose.model("Post", postSchema)
