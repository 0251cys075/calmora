const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 2000 },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  depth: { type: Number, default: 0, max: 3 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isEdited: { type: Boolean, default: false },
  isModerated: { type: Boolean, default: false },
}, { timestamps: true })

commentSchema.index({ post: 1, createdAt: 1 })
commentSchema.index({ author: 1 })

module.exports = mongoose.model("Comment", commentSchema)
