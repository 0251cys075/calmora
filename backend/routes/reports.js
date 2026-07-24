/**
 * @file reports.js
 * @description Express routes handling moderation report submissions, 
 * user blocking toggle logic (which blocks direct messaging and severs social graphs), 
 * and retrieving lists of currently blocked profiles.
 */

const express = require("express")
const router = express.Router()
const Report = require("../models/Report")
const Block = require("../models/Block")
const Post = require("../models/Post")
const Comment = require("../models/Comment")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

/**
 * @route POST /api/reports
 * @desc Submits a new moderation report flagging a specific post, comment, message, or user.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { targetType, target, reason, description } = req.body
    if (!targetType || !target || !reason) {
      return res.status(400).json({ error: "targetType, target, and reason are required" })
    }

    // Check if the user has already reported this target and it is still pending review
    const existingReport = await Report.findOne({
      reporter: req.user._id,
      targetType,
      target,
      status: "pending",
    })
    if (existingReport) {
      return res.status(409).json({ error: "You have already reported this" })
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      target,
      reason,
      description,
    })

    res.status(201).json({ report })
  } catch (err) {
    console.error("Report error:", err)
    res.status(500).json({ error: "Failed to submit report" })
  }
})

/**
 * @route POST /api/reports/block/:userId
 * @desc Toggles user block status. If blocking, removes mutual following relations.
 */
router.post("/block/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot block yourself" })
    }

    const existing = await Block.findOne({ blocker: req.user._id, blocked: userId })
    if (existing) {
      await Block.findByIdAndDelete(existing._id)
      return res.json({ blocked: false, message: "User unblocked" })
    }

    await Block.create({ blocker: req.user._id, blocked: userId })
    
    // Sever mutual follow relationships
    await Follow.deleteOne({ follower: req.user._id, following: userId })
    await Follow.deleteOne({ follower: userId, following: req.user._id })
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } })

    res.json({ blocked: true, message: "User blocked" })
  } catch (err) {
    console.error("Block error:", err)
    res.status(500).json({ error: "Failed to toggle block" })
  }
})

/**
 * @route GET /api/reports/blocked
 * @desc Retrieves all profiles blocked by the current authenticated user.
 */
router.get("/blocked", auth, async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user._id })
      .populate("blocked", "username displayName name avatar")
    res.json({ blockedUsers: blocks.map((b) => b.blocked) })
  } catch (err) {
    res.status(500).json({ error: "Failed to load blocked users" })
  }
})

module.exports = router

/**
 * @route POST /api/reports/report
 * @desc Alternative route for submitting a report without duplicate verification checks.
 */
router.post("/report", auth, async (req, res) => {
  try {
    const { targetType, target, reason, description } = req.body
    if (!targetType || !target || !reason) {
      return res.status(400).json({ error: "targetType, target, and reason are required" })
    }
    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      target,
      reason,
      description,
    })
    res.status(201).json({ report })
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" })
  }
})
