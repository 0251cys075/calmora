/**
 * @file Challenge.js
 * @description Mongoose database model tracking individual user progress in wellness challenges.
 * Stores information about started/completed days, daily reflections, and rewards (XP, CalmCoins) earned.
 */

const mongoose = require("mongoose")

const challengeSchema = new mongoose.Schema(
  {
    // Owner of the challenge progress record
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Identifier mapping to hardcoded static challenge configurations (e.g. "mindfulness_7day")
    challengeId: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    
    // Tracks completed days (e.g. [1, 2, 3])
    completedDays: [{ type: Number }],
    isCompleted: { type: Boolean, default: false },
    
    // Reflections submitted by the user on completion of specific challenge days
    reflections: [
      {
        day: Number,
        content: String,
        date: { type: Date, default: Date.now },
      },
    ],
    
    // Progression rewards logged upon completion
    xpEarned: { type: Number, default: 0 },
    coinEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("ChallengeProgress", challengeSchema)
