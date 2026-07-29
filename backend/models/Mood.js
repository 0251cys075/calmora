/**
 * @file Mood.js
 * @description Mongoose database model for user mood logs.
 * Records daily quantitative mood score check-ins along with contextual notes and tags.
 */

const mongoose = require("mongoose")

const moodSchema = new mongoose.Schema(
  {
    // Owner of this mood log entry
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Numeric value representing mood scale (1 = Very Low, 5 = Excellent)
    mood: { type: Number, required: true, min: 1, max: 5 },
    
    // Short optional log text
    note: { type: String, default: "" },
    
    // Associated keywords (e.g. "stressed", "excited")
    tags: [{ type: String }],
    
    // Day of registration (allows logging historical entries)
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Mood", moodSchema)
