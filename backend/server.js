/**
 * @file server.js
 * @description Main entry point for the Calmora backend API server.
 * Initializes the Express application, configures security/logging middlewares,
 * connects to MongoDB, and registers API routers for all user and community features.
 */

const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const mongoose = require("mongoose")

// Load environment variables from .env file
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

/* ==========================================================================
   GLOBAL MIDDLEWARES
   ========================================================================== */

// Helmet helps secure the app by setting various HTTP headers
app.use(helmet())

// Enable Cross-Origin Resource Sharing for the React frontend client
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true, // Allow cookies to be sent across origins
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

// HTTP request logger middleware
app.use(morgan("dev"))

// Body parsers with increased limits to support large media uploads (e.g. videos/base64 strings)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

/* ==========================================================================
   API ROUTE REGISTRATIONS
   ========================================================================== */

// Health check endpoint for uptime and container monitoring
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Calmora API is running" })
})

// Feature routes mapping
app.use("/api/auth", require("./routes/auth"))
app.use("/api/habits", require("./routes/habits"))
app.use("/api/journal", require("./routes/journal"))
app.use("/api/moods", require("./routes/moods"))
app.use("/api/posts", require("./routes/posts"))
app.use("/api/comments", require("./routes/comments"))
app.use("/api/follows", require("./routes/follows"))
app.use("/api/notifications", require("./routes/notifications"))
app.use("/api/messages", require("./routes/messages"))
app.use("/api/search", require("./routes/search"))
app.use("/api/reports", require("./routes/reports"))
app.use("/api/admin", require("./routes/admin"))

/* ==========================================================================
   GLOBAL ERROR BOUNDARY
   ========================================================================== */

// Catches all unhandled middleware/endpoint errors and sends standard JSON error responses
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || "Something went wrong!" })
})

/* ==========================================================================
   DATABASE CONNECTION & PORT LISTENER
   ========================================================================== */

// Connect to MongoDB and start the API server on connection success
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/calmora")
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Calmora API running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1) // Terminate process on connection failure
  })

module.exports = app
