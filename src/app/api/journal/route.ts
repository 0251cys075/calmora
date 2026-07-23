import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// In production, use a real database
let journalEntries: Record<string, any[]> = {}

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

    const userEntries = journalEntries[userId] || []
    return NextResponse.json({ entries: userEntries })
  } catch (error) {
    console.error("Get journal entries error:", error)
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()

    if (!data.content || data.content.trim().length === 0) {
      return NextResponse.json({ error: "Journal content is required" }, { status: 400 })
    }

    const newEntry = {
      _id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: data.title || data.content.slice(0, 60),
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      isGratitude: data.isGratitude || false,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    if (!journalEntries[userId]) {
      journalEntries[userId] = []
    }
    journalEntries[userId].unshift(newEntry)

    return NextResponse.json({ entry: newEntry })
  } catch (error) {
    console.error("Create journal entry error:", error)
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 })
  }
}
