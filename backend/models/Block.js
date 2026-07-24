/**
 * @file Block.js
 * @description Mongoose database model representing user blocks.
 * Maps blocker-blocked relationships to restrict communication, social visibility, and followings.
 */

const mongoose = require("mongoose")

const blockSchema = new mongoose.Schema({
  // User who initiates the block
  blocker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // User who is blocked
  blocked: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true })

// Unique composite index to avoid redundant duplicate block records
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true })

module.exports = mongoose.model("Block", blockSchema)
