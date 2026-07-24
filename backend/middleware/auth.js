/**
 * @file auth.js
 * @description JWT verification middlewares to secure backend API routes.
 * Provides mandatory token authentication, optional tracking authentication, and admin access control.
 */

const jwt = require("jsonwebtoken")
const User = require("../models/User")

/**
 * Strict authentication middleware. Validates JWT in authorization header.
 * Attaches the user instance (minus password) to req.user, or returns 401 Unauthorized.
 */
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

/**
 * Optional authentication middleware. Attempts to validate the JWT header if present.
 * If validation succeeds, attaches the user to req.user; otherwise, silently proceeds without failing.
 */
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

/**
 * Strict Administrator authentication middleware. Secures endpoints that require root admin access.
 * Performs standard JWT validation and checks if user.isAdmin is truthy.
 */
async function adminAuth(req, res, next) {
  await auth(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" })
    }
    next()
  })
}

module.exports = { auth, optionalAuth, adminAuth }
