const express = require("express")
const router = express.Router()
const Message = require("../models/Message")
const Notification = require("../models/Notification")
const Block = require("../models/Block")
const { auth } = require("../middleware/auth")

router.get("/conversations", auth, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: null,
          conversations: {
            $push: {
              $cond: [
                { $eq: ["$sender", req.user._id] },
                { userId: "$receiver", message: "$$ROOT" },
                { userId: "$sender", message: "$$ROOT" },
              ],
            },
          },
        },
      },
      { $unwind: "$conversations" },
      {
        $group: {
          _id: "$conversations.userId",
          lastMessage: { $first: "$conversations.message" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$conversations.message.receiver", req.user._id] },
                    { $eq: ["$conversations.message.read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    const userIds = messages.map((m) => m._id)
    const users = await require("../models/User").find({ _id: { $in: userIds } })
      .select("username displayName name avatar isVerified")

    const conversations = messages.map((m) => ({
      user: users.find((u) => u._id.toString() === m._id.toString()),
      lastMessage: m.lastMessage,
      unreadCount: m.unreadCount,
    }))

    res.json({ conversations })
  } catch (err) {
    console.error("Conversations error:", err)
    res.status(500).json({ error: "Failed to load conversations" })
  }
})

router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username displayName name avatar")
      .populate("receiver", "username displayName name avatar")

    await Message.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true, readAt: new Date() },
    )

    res.json({ messages: messages.reverse() })
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" })
  }
})

router.post("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params
    const { content, media } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content is required" })
    }

    const blocked = await Block.findOne({
      $or: [
        { blocker: userId, blocked: req.user._id },
        { blocker: req.user._id, blocked: userId },
      ],
    })
    if (blocked) {
      return res.status(403).json({ error: "Cannot send message to this user" })
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: userId,
      content: content.trim(),
      media: media || [],
    })

    const populated = await Message.findById(message._id)
      .populate("sender", "username displayName name avatar")
      .populate("receiver", "username displayName name avatar")

    await Notification.create({
      recipient: userId,
      actor: req.user._id,
      type: "message",
      message: message._id,
    })

    res.status(201).json({ message: populated })
  } catch (err) {
    console.error("Send message error:", err)
    res.status(500).json({ error: "Failed to send message" })
  }
})

module.exports = router
