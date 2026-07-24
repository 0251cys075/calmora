/**
 * @file Message.js
 * @description Mongoose database model for private direct messages (DMs) between community members.
 * Supports text content, media sharing (images, voice notes), read receipts, and message replying.
 */

const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  // Transaction actors
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Message payloads
  content: { type: String, required: true, maxlength: 5000 },
  media: [{
    type: { type: String, enum: ["image", "voice"], required: true },
    url: { type: String, required: true },
  }],
  
  // Message statuses
  read: { type: Boolean, default: false },
  readAt: Date,
  
  // Thread reply reference
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true })

// Index to quickly fetch conversation history sorted by timestamp
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 })

module.exports = mongoose.model("Message", messageSchema)
