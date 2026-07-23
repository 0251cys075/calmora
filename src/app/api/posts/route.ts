import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

let postsStore: any[] = []

async function getAuthUser(): Promise<any | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("calmora_token")?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch {
    return null
  }
}

export async function GET() {
  return NextResponse.json({ posts: postsStore })
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    const data = await req.json()

    if (!data.content || !data.content.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 })
    }

    const newPost = {
      _id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      author: {
        _id: authUser?.userId || "user_guest",
        username: authUser?.name || "Guest Explorer",
        displayName: authUser?.name || "Guest Explorer",
        name: authUser?.name || "Guest Explorer",
        avatar: "",
        level: 8,
        xp: 1200,
        isVerified: false,
      },
      content: data.content.trim(),
      media: data.media || [],
      tags: data.tags || [],
      mentions: [],
      hashtags: data.tags?.map((t: string) => t.toLowerCase()) || [],
      likes: [],
      likeCount: 0,
      reposts: [],
      repostCount: 0,
      saves: [],
      saveCount: 0,
      commentCount: 0,
      shareCount: 0,
      isEdited: false,
      isPinned: false,
      isModerated: false,
      moderationAction: "approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    postsStore.unshift(newPost)
    return NextResponse.json({ post: newPost, moderated: false })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
