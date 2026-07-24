/**
 * @file follows.js
 * @description Express routes handling user following networks.
 * Handles toggling follow state on other users (updating follower counts, XP incentives, social notifications),
 * checking if the current user follows a target, and retrieving lists of followers/following.
 */

const express = require("express")
const router = express.Router()
const Follow = require("../models/Follow")
const User = require("../models/User")
const Notification = require("../models/Notification")
const Block = require("../models/Block")
const { auth } = require("../middleware/auth")

/**
 * @route POST /api/follows/:userId
 * @desc Toggles following relationship status (follow/unfollow) with another user.
 * Increments/decrements follower counts and awards XP for engagement.
 */
router.post("/:userId", auth, async (req, res) => {
  try {
    const targetId = req.params.userId
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot follow yourself" })
    }

    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ error: "User not found" })

    // Validate that the target has not blocked the current user
    const blocked = await Block.findOne({ blocker: targetId, blocked: req.user._id })
    if (blocked) return res.status(403).json({ error: "You cannot follow this user" })

    const existing = await Follow.findOne({ follower: req.user._id, following: targetId })
    if (existing) {
      // Unfollow action
      await Follow.findByIdAndDelete(existing._id)
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } })
      await User.findByIdAndUpdate(targetId, { $inc: { followerCount: -1 } })
      return res.json({ following: false, followerCount: Math.max(0, target.followerCount - 1) })
    }

    // Follow action
    await Follow.create({ follower: req.user._id, following: targetId })
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } })
    await User.findByIdAndUpdate(targetId, { $inc: { followerCount: 1, xp: 2, reputation: 1 } })

    // Create system notification for target user
    await Notification.create({
      recipient: targetId,
      actor: req.user._id,
      type: "follow",
    })

    const updatedTarget = await User.findById(targetId)
    res.json({ following: true, followerCount: updatedTarget.followerCount })
  } catch (err) {
    console.error("Follow error:", err)
    res.status(500).json({ error: "Failed to toggle follow" })
  }
})

/**
 * @route GET /api/follows/:userId/status
 * @desc Checks if the logged-in user follows a specific target user.
 */
router.get("/:userId/status", auth, async (req, res) => {
  try {
    const following = await Follow.findOne({ follower: req.user._id, following: req.params.userId })
    res.json({ following: !!following })
  } catch (err) {
    res.status(500).json({ error: "Failed to check follow status" })
  }
})

/**
 * @route GET /api/follows/:userId/followers
 * @desc Retrieves a paginated list of users following the target user.
 */
router.get("/:userId/followers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const follows = await Follow.find({ following: req.params.userId })
      .skip(skip).limit(limit)
      .populate("follower", "username displayName name avatar badge level xp isVerified")

    const total = await Follow.countDocuments({ following: req.params.userId })
    res.json({
      users: follows.map((f) => f.follower),
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + follows.length < total },
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to load followers" })
  }
})

/**
 * @route GET /api/follows/:userId/following
 * @desc Retrieves a paginated list of users followed by the target user.
 */
router.get("/:userId/following", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const follows = await Follow.find({ follower: req.params.userId })
      .skip(skip).limit(limit)
      .populate("following", "username displayName name avatar badge level xp isVerified")

    const total = await Follow.countDocuments({ follower: req.params.userId })
    res.json({
      users: follows.map((f) => f.following),
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + follows.length < total },
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to load following" })
  }
})

module.exports = router
