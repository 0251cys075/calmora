/**
 * @file habits.js
 * @description Express routes handling user habit creation, list retrieval, updating settings,
 * deleting habits, and toggling daily completions (which updates streaks and XP rewards).
 */

const express = require("express")
const jwt = require("jsonwebtoken")
const Habit = require("../models/Habit")

const router = express.Router()

/**
 * Local auth middleware to extract userId from JWT token header.
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" })
  }
  try {
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

/**
 * @route GET /api/habits
 * @desc Retrieves all active habits belonging to the logged-in user.
 */
router.get("/", auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json({ habits })
  } catch (err) {
    console.error("Get habits error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route POST /api/habits
 * @desc Configures and creates a new trackable habit.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { name, icon, color, frequency, reminderTime } = req.body
    if (!name) {
      return res.status(400).json({ error: "Name is required" })
    }
    const habit = await Habit.create({ user: req.userId, name, icon, color, frequency, reminderTime })
    res.status(201).json({ habit })
  } catch (err) {
    console.error("Create habit error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route PATCH /api/habits/:id
 * @desc Updates general habit properties (e.g., name, color, frequency).
 */
router.patch("/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: req.body },
      { new: true }
    )
    if (!habit) return res.status(404).json({ error: "Habit not found" })
    res.json({ habit })
  } catch (err) {
    console.error("Update habit error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route PATCH /api/habits/:id/toggle
 * @desc Toggles daily completion state of a habit for today. Recalculates streak and total logs.
 */
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId })
    if (!habit) return res.status(404).json({ error: "Habit not found" })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if habit was already completed today
    const existingLog = habit.logs.find(
      (l) => new Date(l.date).setHours(0, 0, 0, 0) === today.getTime()
    )
    
    if (existingLog) {
      existingLog.completed = !existingLog.completed
    } else {
      habit.logs.push({ date: today, completed: true })
    }
    
    const todayLog = habit.logs.find(
      (l) => new Date(l.date).setHours(0, 0, 0, 0) === today.getTime()
    )
    
    // Increment or reset the current streak
    habit.streak = todayLog?.completed ? habit.streak + 1 : 0
    if (todayLog?.completed) {
      habit.totalCompletions += 1
    }
    
    await habit.save()
    res.json({ habit })
  } catch (err) {
    console.error("Toggle habit error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route DELETE /api/habits/:id
 * @desc Deletes a habit record by ID.
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!habit) return res.status(404).json({ error: "Habit not found" })
    res.json({ message: "Habit deleted" })
  } catch (err) {
    console.error("Delete habit error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
