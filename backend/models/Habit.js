const mongoose = require("mongoose")

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "target" },
    color: { type: String, default: "blue" },
    frequency: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    reminderTime: { type: String, default: "" },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
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
