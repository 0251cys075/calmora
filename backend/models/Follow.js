/**
 * @file Follow.js
 * @description Mongoose database model representing user follower graphs.
 * Maps follower-following pairs and indexes them uniquely to prevent duplicate connections.
 */

const mongoose = require("mongoose")

const followSchema = new mongoose.Schema({
  // User who initiates the follow action
  follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // User who is being followed
  following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true })

// Index constraints to support checks and list follow relations efficiently
followSchema.index({ follower: 1, following: 1 }, { unique: true }) // Unique composite key
followSchema.index({ following: 1 })

module.exports = mongoose.model("Follow", followSchema)
