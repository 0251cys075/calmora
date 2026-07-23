const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const mongoose = require("mongoose")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(morgan("dev"))
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Calmora API is running" })
})

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

app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || "Something went wrong!" })
})

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/calmora")
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Calmora API running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

module.exports = app
