/**
 * @file route.ts
 * @description Next.js API route handler for local email/password login authentication.
 * Signs JWT tokens and returns persistent secure HttpOnly session cookies.
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Mock user store fallback if not running against the live database
const users: Record<string, { name: string; email: string; password: string; id: string }> = {}

/**
 * @route POST /api/auth/login
 * @desc Authenticates email credentials and sets the session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Form schema validation checks
    if (!email?.includes("@") || !password?.length) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Search profile in local memory list
    const user = users[normalizedEmail]
    if (!user) {
      return NextResponse.json(
        { error: "No account found with that email. Please sign up first." },
        { status: 401 }
      )
    }

    // Verify salted password hashes match
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      )
    }

    // Sign session token with 7 days expiration duration
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Store JWT securely as an HTTP-only browser cookie
    const cookieStore = await cookies()
    cookieStore.set("calmora_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Profile details projection (excluding secure password fields)
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
