const express = require("express")
const jwt = require("jsonwebtoken")
const Mood = require("../models/Mood")

const router = express.Router()

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

router.get("/", auth, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.userId }).sort({ date: -1 }).limit(30)
    res.json({ moods })
  } catch (err) {
    console.error("Get moods error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", auth, async (req, res) => {
  try {
    const { mood, note, tags } = req.body
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: "Mood value must be between 1 and 5" })
    }
    const entry = await Mood.create({ user: req.userId, mood, note, tags })
    res.status(201).json({ entry })
  } catch (err) {
    console.error("Create mood entry error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/weekly", auth, async (req, res) => {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const entries = await Mood.find({
      user: req.userId,
      date: { $gte: startOfWeek },
    }).sort({ date: 1 })

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weeklyData = days.map((_, i) => {
      const dayStart = new Date(startOfWeek)
      dayStart.setDate(startOfWeek.getDate() + i)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      const dayEntries = entries.filter((e) => {
        const d = new Date(e.date)
        return d >= dayStart && d <= dayEnd
      })
      const avg = dayEntries.length
        ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length
        : null
      return { day: days[i], value: avg ? Math.round(avg * 10) / 10 : null }
    })

    res.json({ weekly: weeklyData })
  } catch (err) {
    console.error("Weekly moods error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
