/**
 * @file User.js
 * @description Mongoose database model for Calmora users.
 * Stores account login details, user profiles, personalization preferences, gamification features 
 * (XP, leveling, streaks, badges), and permissions (moderators/admins). Includes text indexes for search.
 */

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  // Authentication & Security Details
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  
  // Profile Information
  displayName: { type: String, trim: true },
  bio: { type: String, default: "", maxlength: 500 },
  avatar: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  location: { type: String, default: "", maxlength: 100 },
  website: { type: String, default: "" },
  interests: [{ type: String, trim: true }],
  wellnessGoals: [{ type: String, trim: true }],
  
  // Privacy Preferences
  isPrivate: { type: Boolean, default: false },
  showRealName: { type: Boolean, default: false },
  
  // Gamification & Wellness Scoring
  calmScore: { type: Number, default: 0 },
  xp: { type: Number, default: 0 }, // Experience points for leveling up
  reputation: { type: Number, default: 0 }, // Reputation earned from community actions
  level: { type: Number, default: 1 },
  calmCoins: { type: Number, default: 0 }, // In-app currency awarded for wellness streaks
  streak: { type: Number, default: 0 }, // Consecutive days active
  longestStreak: { type: Number, default: 0 },
  
  // Earned Rewards
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
  
  // Social Counts
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  
  // Role Permissions & Account Status
  isAdmin: { type: Boolean, default: false },
  isModerator: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: String,
  lastActive: { type: Date, default: Date.now },
  
  // Notification & UI Customization Preferences
  preferences: {
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
    anonymousMode: { type: Boolean, default: false },
  },
}, { timestamps: true }) // Automatically adds createdAt and updatedAt dates

// Text indexes to support full-text search across user profile fields
userSchema.index({ name: "text", displayName: "text", bio: "text", interests: "text" })

// Leaderboard indexes sorted descending
userSchema.index({ xp: -1 })
userSchema.index({ reputation: -1 })

module.exports = mongoose.model("User", userSchema)
