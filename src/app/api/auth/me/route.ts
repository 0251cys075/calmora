/**
 * @file route.ts
 * @description Next.js API route handler to verify current user auth state.
 * Extracts the HttpOnly JWT cookie and returns authenticated profile info.
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

/**
 * @route GET /api/auth/me
 * @desc Inspects Calmora session cookies and decodes identity metadata.
 */
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

    // Verify validity of the parsed JWT token signature
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      name: string
    }

    // Return the authenticated session user details
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
