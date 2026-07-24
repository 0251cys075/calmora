/**
 * @file Habit.js
 * @description Mongoose database model for user habits.
 * Manages custom user-defined routines, tracking streaks, notification schedules, and historical completion logs.
 */

const mongoose = require("mongoose")

const habitSchema = new mongoose.Schema(
  {
    // Owner of the habit
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Core details
    name: { type: String, required: true },
    icon: { type: String, default: "target" }, // UI representation symbol
    color: { type: String, default: "blue" }, // UI tag color
    
    // Schedule and Notification preferences
    frequency: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    reminderTime: { type: String, default: "" }, // Format: "HH:MM" for notifications
    
    // Streaks and progression tracking
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    
    // Logging timeline of completed days
    logs: [
      {
        date: { type: Date, required: true },
        completed: { type: Boolean, default: true },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("Habit", habitSchema)
