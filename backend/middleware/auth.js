const jwt = require("jsonwebtoken")
const User = require("../models/User")

async function auth(req, res, next) {
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
    req.user = user
    next()
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" })
    }
    console.error("Auth middleware error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId).select("-password")
      if (user) req.user = user
    }
    next()
  } catch {
    next()
  }
}

async function adminAuth(req, res, next) {
  await auth(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" })
    }
    next()
  })
}

module.exports = { auth, optionalAuth, adminAuth }
