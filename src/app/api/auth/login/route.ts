import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// In production, use a real database
const users: Record<string, { name: string; email: string; password: string; id: string }> = {}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validation
    if (!email?.includes("@") || !password?.length) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check if user exists
    const user = users[normalizedEmail]
    if (!user) {
      return NextResponse.json(
        { error: "No account found with that email. Please sign up first." },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("calmora_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      calmScore: 850,
      xp: 1200,
      level: 8,
      streak: 5,
      badges: ["Early Adopter", "Mindful Beginner"],
    }

    return NextResponse.json({ user: userData, token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    )
  }
}
