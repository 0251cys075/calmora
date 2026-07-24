/**
 * @file Report.js
 * @description Mongoose database model for content reports.
 * Allows users to flag posts, comments, messages, or other users for review.
 * Tracks review actions, assigned moderators, and current resolution statuses.
 */

const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
  // User filing the report
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Entity type of the target being reported
  targetType: {
    type: String,
    enum: ["post", "comment", "user", "message"],
    required: true,
  },
  
  // Dynamic ObjectId referencing the reported entity (ref is determined by targetType)
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // Categorized flag reasons
  reason: {
    type: String,
    enum: [
      "spam", "harassment", "abuse", "hate_speech",
      "violence", "self_harm", "misinformation",
      "inappropriate", "copyright", "other",
    ],
    required: true,
  },
  
  // Optional elaboration description detailing the violation
  description: { type: String, maxlength: 1000 },
  
  // Resolution workflow lifecycle state
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed", "action_taken"],
    default: "pending",
  },
  
  // Moderation audit history fields
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Moderator reference
  reviewedAt: Date,
  action: String, // Description of action taken (e.g. "Post deleted", "User warned")
}, { timestamps: true })

// Indexes for fast moderation dashboard lookups
reportSchema.index({ status: 1, createdAt: -1 })
reportSchema.index({ targetType: 1, target: 1 })

module.exports = mongoose.model("Report", reportSchema)
