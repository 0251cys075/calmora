const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 5000 },
  media: [{
    type: { type: String, enum: ["image", "voice"], required: true },
    url: { type: String, required: true },
  }],
  read: { type: Boolean, default: false },
  readAt: Date,
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true })

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 })

module.exports = mongoose.model("Message", messageSchema)
