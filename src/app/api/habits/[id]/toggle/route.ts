import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// In production, use a real database
let habits: Record<string, any[]> = {}

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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const habitId = params.id
    const userHabits = habits[userId] || []
    const habitIndex = userHabits.findIndex((h) => h._id === habitId)

    if (habitIndex === -1) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const habit = userHabits[habitIndex]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()

    const existingLog = habit.logs?.find((l: any) => {
      const logDate = new Date(l.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === todayTime
    })

    const newCompleted = !(existingLog?.completed ?? false)

    if (existingLog) {
      existingLog.completed = newCompleted
    } else {
      habit.logs = habit.logs || []
      habit.logs.push({ date: today.toISOString(), completed: true })
    }

    habit.streak = newCompleted ? (habit.streak || 0) + 1 : Math.max(0, (habit.streak || 0) - 1)
    habit.totalCompletions = (habit.totalCompletions || 0) + (newCompleted ? 1 : -1)

    habits[userId][habitIndex] = habit

    return NextResponse.json({ habit })
  } catch (error) {
    console.error("Toggle habit error:", error)
    return NextResponse.json({ error: "Failed to toggle habit" }, { status: 500 })
  }
}
