/**
 * @file notifications.js
 * @description Express routes handling user notification feed retrieval,
 * marking all notifications as read, and marking individual notifications as read.
 */

const express = require("express")
const router = express.Router()
const Notification = require("../models/Notification")
const { auth } = require("../middleware/auth")

/**
 * @route GET /api/notifications
 * @desc Retrieves paginated social/system notifications and the total count of unread notifications.
 */
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 30
    const skip = (page - 1) * limit

    // Find notifications sent to the current user
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actor", "username displayName name avatar")
      .lean()

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false })
    const total = await Notification.countDocuments({ recipient: req.user._id })

    res.json({
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + notifications.length < total },
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to load notifications" })
  }
})

/**
 * @route POST /api/notifications/read-all
 * @desc Marks all unread notifications of the logged-in user as read.
 */
router.post("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ message: "All notifications marked as read" })
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications as read" })
  }
})

/**
 * @route POST /api/notifications/:id/read
 * @desc Marks a single notification as read by ID.
 */
router.post("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ message: "Notification marked as read" })
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
})

module.exports = router
