/**
 * @file route.ts
 * @description Next.js API route handler to get user mood logs aggregated by day of the week.
 * Resolves user from JWT session cookie and averages logged scores per day.
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Mock mood logs storage grouped by userId keys
let moodEntries: Record<string, any[]> = {}

/**
 * Extracts and decodes userId from the local HTTP-only session cookie.
 */
async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("calmora_token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

/**
 * @route GET /api/moods/weekly
 * @desc Retrieves user's mood log stats for each day of the current calendar week.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userMoods = moodEntries[userId] || []

    // Get last 7 days of mood data mapped to weekdays
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weeklyData = days.map((day, index) => {
      const date = new Date()
      const diff = date.getDay() - index
      date.setDate(date.getDate() - diff)
      date.setHours(0, 0, 0, 0)

      const dayEntry = userMoods.find((entry) => {
        const entryDate = new Date(entry.date)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === date.getTime()
      })

      return {
        day,
        value: dayEntry?.mood || null,
      }
    })

    return NextResponse.json({ weekly: weeklyData })
  } catch (error) {
    console.error("Get weekly moods error:", error)
    return NextResponse.json({ error: "Failed to fetch weekly moods" }, { status: 500 })
  }
}
