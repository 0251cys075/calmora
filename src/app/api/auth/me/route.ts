import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("calmora_token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      name: string
    }

    // Return user data
    const userData = {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      calmScore: 850,
      xp: 1200,
      level: 8,
      streak: 5,
      badges: ["Early Adopter", "Mindful Beginner"],
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    )
  }
}
