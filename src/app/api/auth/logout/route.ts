/**
 * @file route.ts
 * @description Next.js API route handler to clear user auth cookies and log them out.
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * @route POST /api/auth/logout
 * @desc Deletes the session cookie by setting maxAge to 0.
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.set("calmora_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Immediately expires the cookie
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
