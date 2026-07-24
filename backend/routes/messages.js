/**
 * @file messages.js
 * @description Express routes handling user direct messaging (DMs) features.
 * Provides inbox listing with unread counts using Mongoose aggregations, chat history fetches, 
 * marking messages as read, and sending new messages with safety checks against blocked lists.
 */

const express = require("express")
const router = express.Router()
const Message = require("../models/Message")
const Notification = require("../models/Notification")
const Block = require("../models/Block")
const { auth } = require("../middleware/auth")

/**
 * @route GET /api/messages/conversations
 * @desc Retrieves all active chat threads/conversations for the logged-in user.
 * Runs a Mongoose aggregation pipeline to locate the latest message per thread and sum unread counts.
 */
router.get("/conversations", auth, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      // Stage 1: Filter messages involving the current user
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        },
      },
      // Stage 2: Sort descending to put newest messages first
      { $sort: { createdAt: -1 } },
      // Stage 3: Project the context fields onto conversation partner groups
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
      // Stage 4: Group by user ID, select the first message (newest) and count unread messages
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

    // Populate user profile details for each conversation partner
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

/**
 * @route GET /api/messages/:userId
 * @desc Fetches the message history with a specific user. Auto-marks received messages as read.
 */
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    // Find messages between the current user and target user
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

    // Mark unread incoming messages from the target user as read
    await Message.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true, readAt: new Date() },
    )

    // Reverse history to display in chronological ascending order
    res.json({ messages: messages.reverse() })
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" })
  }
})

/**
 * @route POST /api/messages/:userId
 * @desc Sends a private direct message to a user. Blocks transmission if blocked relations exist.
 */
router.post("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params
    const { content, media } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content is required" })
    }

    // Verify neither user has blocked the other
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

    // Trigger notification to receiver
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
