/**
 * @file route.ts
 * @description Next.js API route handler for mock daily mood storage.
 * Reads user identity from JWT session cookies and stores entries locally in memory.
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
 * @route GET /api/moods
 * @desc Retrieves all cached mood entries belonging to the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userMoods = moodEntries[userId] || []
    return NextResponse.json({ moods: userMoods })
  } catch (error) {
    console.error("Get moods error:", error)
    return NextResponse.json({ error: "Failed to fetch moods" }, { status: 500 })
  }
}

/**
 * @route POST /api/moods
 * @desc Creates a new mood entry and unshifts it into the user's mock list.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()

    if (!data.mood || data.mood < 1 || data.mood > 5) {
      return NextResponse.json({ error: "Valid mood rating (1-5) is required" }, { status: 400 })
    }

    const newEntry = {
      _id: `mood_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mood: data.mood,
      note: data.note || "",
      tags: data.tags || [],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    if (!moodEntries[userId]) {
      moodEntries[userId] = []
    }
    moodEntries[userId].unshift(newEntry)

    return NextResponse.json({ entry: newEntry })
  } catch (error) {
    console.error("Create mood entry error:", error)
    return NextResponse.json({ error: "Failed to create mood entry" }, { status: 500 })
  }
}
