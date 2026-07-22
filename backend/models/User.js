const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    calmScore: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    calmCoins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    badges: [{ type: String }],
    completedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
    activeChallenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", default: null },
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      notifications: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)
