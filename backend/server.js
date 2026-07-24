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
const http = require("http")
const dns = require("dns")
const { Server } = require("socket.io")

// Load environment variables from .env file
dotenv.config()

// Fix DNS resolution on Windows — Node.js may use 127.0.0.1 which doesn't support SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"])

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

// Create HTTP server and attach Socket.IO for Safe Circle real-time features
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
})

// Register Safe Circle Socket.IO handlers
require("./safe-circle")(io)

// Start HTTP server immediately (Safe Circle doesn't need MongoDB)
server.listen(PORT, () => {
  console.log(`Calmora API running on port ${PORT}`)
})

// Connect to MongoDB — non-blocking, log errors but don't crash
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/calmora")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.warn("MongoDB unavailable — API routes requiring DB will fail:", err.message))

module.exports = { app, server, io }
