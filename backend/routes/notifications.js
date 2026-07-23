const express = require("express")
const router = express.Router()
const Notification = require("../models/Notification")
const { auth } = require("../middleware/auth")

router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 30
    const skip = (page - 1) * limit

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

router.post("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ message: "All notifications marked as read" })
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications as read" })
  }
})

router.post("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ message: "Notification marked as read" })
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
})

module.exports = router
