const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: [
      "like", "comment", "reply", "follow", "mention",
      "repost", "share", "badge", "achievement",
      "level_up", "challenge_complete", "message",
      "report_resolved", "moderation",
    ],
    required: true,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  read: { type: Boolean, default: false },
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, read: 1 })

module.exports = mongoose.model("Notification", notificationSchema)
