const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: {
    type: String,
    enum: ["post", "comment", "user", "message"],
    required: true,
  },
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: {
    type: String,
    enum: [
      "spam", "harassment", "abuse", "hate_speech",
      "violence", "self_harm", "misinformation",
      "inappropriate", "copyright", "other",
    ],
    required: true,
  },
  description: { type: String, maxlength: 1000 },
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed", "action_taken"],
    default: "pending",
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  action: String,
}, { timestamps: true })

reportSchema.index({ status: 1, createdAt: -1 })
reportSchema.index({ targetType: 1, target: 1 })

module.exports = mongoose.model("Report", reportSchema)
