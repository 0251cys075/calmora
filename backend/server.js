const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Calmora API is running" })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Calmora API running on port ${PORT}`)
})
