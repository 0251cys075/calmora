const mongoose = require("mongoose")

const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "" },
    content: { type: String, required: true },
    mood: { type: Number, min: 1, max: 5 },
    tags: [{ type: String }],
    isGratitude: { type: Boolean, default: false },
    aiSummary: { type: String, default: "" },
    aiSentiment: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Journal", journalSchema)
