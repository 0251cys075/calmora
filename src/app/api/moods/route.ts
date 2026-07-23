import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// In production, use a real database
let moodEntries: Record<string, any[]> = {}

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
