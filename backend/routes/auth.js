const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ error: "Email already in use" })
    }
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, calmScore: user.calmScore, xp: user.xp, level: user.level },
    })
  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ error: "Server error during registration" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" })
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, calmScore: user.calmScore, xp: user.xp, level: user.level },
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: "Server error during login" })
  }
})

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" })
    }
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json({ user })
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" })
    }
    console.error("Auth error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
