import { NextRequest, NextResponse } from "next/server"

const sampleFeedPosts = [
  {
    _id: "post_sample_1",
    author: {
      _id: "user_sample_1",
      username: "CalmSeeker42",
      displayName: "CalmSeeker42",
      name: "CalmSeeker42",
      avatar: "",
      level: 8,
      xp: 1200,
      isVerified: true,
    },
    content: "Completed my 21-day meditation challenge! It was tough but so worth it. Feeling more centered and peaceful than ever. Remember, consistency > perfection. You've got this! 🙏",
    media: [],
    tags: ["meditation", "challenge", "mindfulness"],
    mentions: [],
    hashtags: ["meditation", "challenge", "mindfulness"],
    likes: [],
    likeCount: 24,
    reposts: [],
    repostCount: 3,
    saves: [],
    saveCount: 5,
    commentCount: 8,
    shareCount: 2,
    isEdited: false,
    isPinned: true,
    isModerated: false,
    moderationAction: "approved",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: "post_sample_2",
    author: {
      _id: "user_sample_2",
      username: "MindfulMornings",
      displayName: "MindfulMornings",
      name: "MindfulMornings",
      avatar: "",
      level: 5,
      xp: 800,
      isVerified: false,
    },
    content: "Today's gratitude: Woke up to a beautiful sunrise, had a peaceful cup of tea, and my morning meditation felt deeper than usual. What are you grateful for today?",
    media: [],
    tags: ["gratitude", "mindfulness"],
    mentions: [],
    hashtags: ["gratitude", "mindfulness"],
    likes: [],
    likeCount: 18,
    reposts: [],
    repostCount: 1,
    saves: [],
    saveCount: 3,
    commentCount: 4,
    shareCount: 1,
    isEdited: false,
    isPinned: false,
    isModerated: false,
    moderationAction: "approved",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const tag = searchParams.get("tag")

    let posts = sampleFeedPosts
    if (tag) {
      posts = posts.filter(p => p.tags.includes(tag) || p.hashtags.includes(tag.toLowerCase()))
    }

    const start = (page - 1) * limit
    const paginated = posts.slice(start, start + limit)

    return NextResponse.json({
      posts: paginated,
      pagination: {
        page,
        limit,
        total: posts.length,
        pages: Math.ceil(posts.length / limit) || 1,
        hasMore: start + paginated.length < posts.length,
      },
    })
  } catch (error) {
    console.error("Get feed error:", error)
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 })
  }
}
