import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// In production, use a real database
let habits: Record<string, any[]> = {}

async function getUserId(req: NextRequest): Promise<string | null> {
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
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userHabits = habits[userId] || []
    return NextResponse.json({ habits: userHabits })
  } catch (error) {
    console.error("Get habits error:", error)
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()

    if (!data.name) {
      return NextResponse.json({ error: "Habit name is required" }, { status: 400 })
    }

    const newHabit = {
      _id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: data.name,
      icon: data.icon,
      color: data.color,
      completed: false,
      streak: 0,
      logs: [],
      totalCompletions: 0,
      createdAt: new Date().toISOString(),
    }

    if (!habits[userId]) {
      habits[userId] = []
    }
    habits[userId].push(newHabit)

    return NextResponse.json({ habit: newHabit })
  } catch (error) {
    console.error("Create habit error:", error)
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 })
  }
}
