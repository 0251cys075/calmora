const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 5000 },
  media: [{
    type: { type: String, enum: ["image", "video", "gif", "voice"], required: true },
    url: { type: String, required: true },
    thumbnail: String,
    duration: Number,
  }],
  tags: [{ type: String, lowercase: true, trim: true, maxlength: 50 }],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  hashtags: [{ type: String, lowercase: true, trim: true }],

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

  isEdited: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },

  isModerated: { type: Boolean, default: false },
  moderationReason: { type: String },
  moderationAction: { type: String, enum: ["approved", "flagged", "removed", "spam"], default: "approved" },

  xpReward: { type: Number, default: 10 },
  reportCount: { type: Number, default: 0 },
}, { timestamps: true })

postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ hashtags: 1 })
postSchema.index({ tags: 1 })
postSchema.index({ createdAt: -1 })
postSchema.index({ content: "text", "tags": "text" })

module.exports = mongoose.model("Post", postSchema)
