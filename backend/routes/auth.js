/**
 * @file auth.js
 * @description Express routes handling user registration, login authentication,
 * and current session retrieval using JWT tokens and bcrypt password hashing.
 */

const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const router = express.Router()

/**
 * @route POST /api/auth/register
 * @desc Registers a new user account, hashes password, and issues JWT session token.
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }
    
    // Check if email already registered
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ error: "Email already in use" })
    }
    
    // Hash password with salt rounds = 12
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })
    
    // Sign session token expiring in 7 days
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

/**
 * @route POST /api/auth/login
 * @desc Authenticates existing user email/password credentials and issues a JWT token.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }
    
    // Find user record by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }
    
    // Verify password match
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" })
    }
    
    // Sign session token
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

/**
 * @route GET /api/auth/me
 * @desc Retrieves current authenticated user profile using token verification.
 */
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
