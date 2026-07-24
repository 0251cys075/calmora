/**
 * @file Notification.js
 * @description Mongoose database model for user notifications.
 * Tracks social alerts (likes, replies, comments, follows, messages) and wellness milestones 
 * (level ups, badges, achievements). Includes indexing for unread counts.
 */

const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  // Target user who receives the alert
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // User actor who triggered the notification (e.g. liker, follower)
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Categorized alert trigger types
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
  
  // Referencing entities if applicable
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  
  // Read state status
  read: { type: Boolean, default: false },
  
  // Dynamic parameters for badges or rewards metadata details
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

// Indexes for high performance querying of user notifications feed
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, read: 1 }) // Fast fetching of unread counts

module.exports = mongoose.model("Notification", notificationSchema)
