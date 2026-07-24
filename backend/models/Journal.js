/**
 * @file Journal.js
 * @description Mongoose database model for private journal entries.
 * Stores text reflections, related tags, custom mood ratings, gratitude flags, 
 * and placeholder fields for AI-generated summaries and sentiment logs.
 */

const mongoose = require("mongoose")

const journalSchema = new mongoose.Schema(
  {
    // Owner of the private journal entry
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Journal text contents
    title: { type: String, default: "" },
    content: { type: String, required: true },
    
    // Wellness metrics and tags associated with the day
    mood: { type: Number, min: 1, max: 5 }, // 1-5 mood score
    tags: [{ type: String }],
    isGratitude: { type: Boolean, default: false }, // Highlights gratitude entries
    
    // Automated analysis helpers
    aiSummary: { type: String, default: "" }, // Brief summary of the entry
    aiSentiment: { type: String, default: "" }, // Sentiment classification (positive, neutral, negative)
    
    // Explicit entry date (allowing back-dating)
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Journal", journalSchema)
