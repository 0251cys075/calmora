const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  displayName: { type: String, trim: true },
  bio: { type: String, default: "", maxlength: 500 },
  avatar: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  location: { type: String, default: "", maxlength: 100 },
  website: { type: String, default: "" },
  interests: [{ type: String, trim: true }],
  wellnessGoals: [{ type: String, trim: true }],
  isPrivate: { type: Boolean, default: false },
  showRealName: { type: Boolean, default: false },
  calmScore: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  reputation: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  calmCoins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  badges: [{
    name: String,
    icon: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  achievements: [{
    name: String,
    description: String,
    progress: { type: Number, default: 0 },
    maxProgress: { type: Number, default: 100 },
    icon: String,
    earned: { type: Boolean, default: false },
    earnedAt: Date,
  }],
  completedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
  activeChallenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", default: null },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  isModerator: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: String,
  lastActive: { type: Date, default: Date.now },
  preferences: {
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
    anonymousMode: { type: Boolean, default: false },
  },
}, { timestamps: true })

userSchema.index({ name: "text", displayName: "text", bio: "text", interests: "text" })
userSchema.index({ xp: -1 })
userSchema.index({ reputation: -1 })

module.exports = mongoose.model("User", userSchema)
