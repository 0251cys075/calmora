/**
 * @file route.ts
 * @description Next.js API route handler for local email/password account registration.
 * Hashes passwords using bcrypt, generates session tokens, and places HttpOnly cookies.
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Mock user store fallback if not running against the live database
const users: Record<string, { name: string; email: string; password: string; id: string }> = {}

/**
 * @route POST /api/auth/register
 * @desc Registers a new user account, encrypts password, and sets session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Form schema validation checks
    if (!name?.trim() || !email?.includes("@") || password?.length < 6) {
      return NextResponse.json(
        { error: "Invalid input. Name required, valid email, and password must be at least 6 characters." },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    if (users[normalizedEmail]) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
    }

    // Hash the password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique user ID string
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    users[normalizedEmail] = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      id: userId,
    }

    // Sign session token with 7 days expiration duration
    const token = jwt.sign(
      { userId, email: normalizedEmail, name: name.trim() },
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
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      calmScore: 850,
      xp: 1200,
      level: 8,
      streak: 5,
      badges: ["Early Adopter", "Mindful Beginner"],
    }

    return NextResponse.json({ user: userData, token })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}
