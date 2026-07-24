/**
 * @file journal.js
 * @description Express routes handling private journal entry CRUD workflows 
 * and analytical summaries (metrics for average mood, gratitude entries count, top topic tags).
 */

const express = require("express")
const jwt = require("jsonwebtoken")
const Journal = require("../models/Journal")

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
 * @route GET /api/journal
 * @desc Retrieves the user's recent private journal entries (limit 20), sorted by date.
 */
router.get("/", auth, async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.userId }).sort({ date: -1 }).limit(20)
    res.json({ entries })
  } catch (err) {
    console.error("Get journal entries error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route POST /api/journal
 * @desc Saves a new private journal entry.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, mood, tags, isGratitude } = req.body
    if (!content) {
      return res.status(400).json({ error: "Content is required" })
    }
    const entry = await Journal.create({
      user: req.userId, title, content, mood, tags, isGratitude,
    })
    res.status(201).json({ entry })
  } catch (err) {
    console.error("Create journal entry error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route GET /api/journal/summary
 * @desc Compiles analytics on user's weekly journal logs (total logs, average mood score, top tag topic, gratitude logs count).
 */
router.get("/summary", auth, async (req, res) => {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const entries = await Journal.find({
      user: req.userId,
      date: { $gte: startOfWeek },
    }).sort({ date: -1 })

    const totalEntries = entries.length
    
    // Average mood rating from entries containing a score
    const entriesWithMood = entries.filter((e) => e.mood)
    const avgMood = entriesWithMood.length
      ? entriesWithMood.reduce((sum, e) => sum + e.mood, 0) / entriesWithMood.length
      : 1
      
    const gratitudeCount = entries.filter((e) => e.isGratitude).length
    
    // Extract and sort tags to find the most frequent keyword
    const allTags = entries.flatMap((e) => e.tags || [])
    const topTopic = allTags.length
      ? allTags.sort((a, b) => allTags.filter((t) => t === a).length - allTags.filter((t) => t === b).length).pop()
      : "None"

    res.json({
      summary: { totalEntries, avgMood: Math.round(avgMood * 10) / 10, topTopic, gratitudeCount },
    })
  } catch (err) {
    console.error("Journal summary error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route GET /api/journal/:id
 * @desc Fetches a single journal entry by ID.
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, user: req.userId })
    if (!entry) return res.status(404).json({ error: "Entry not found" })
    res.json({ entry })
  } catch (err) {
    console.error("Get journal entry error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

/**
 * @route DELETE /api/journal/:id
 * @desc Deletes a journal entry.
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!entry) return res.status(404).json({ error: "Entry not found" })
    res.json({ message: "Entry deleted" })
  } catch (err) {
    console.error("Delete journal entry error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
