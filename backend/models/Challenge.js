const mongoose = require("mongoose")

const challengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    challengeId: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    completedDays: [{ type: Number }],
    isCompleted: { type: Boolean, default: false },
    reflections: [
      {
        day: Number,
        content: String,
        date: { type: Date, default: Date.now },
      },
    ],
    xpEarned: { type: Number, default: 0 },
    coinEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("ChallengeProgress", challengeSchema)
