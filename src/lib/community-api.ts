"use client"

import { api } from "./api"

export interface UserProfile {
  _id: string
  username: string
  displayName: string
  name: string
  email: string
  bio: string
  avatar: string
  coverImage: string
  location: string
  website: string
  interests: string[]
  wellnessGoals: string[]
  isPrivate: boolean
  showRealName: boolean
  calmScore: number
  xp: number
  reputation: number
  level: number
  calmCoins: number
  streak: number
  longestStreak: number
  badges: Badge[]
  achievements: Achievement[]
  followerCount: number
  followingCount: number
  postCount: number
  isAdmin: boolean
  isModerator: boolean
  isVerified: boolean
  isBanned: boolean
  createdAt: string
}

export interface Badge {
  name: string
  icon: string
  description: string
  earnedAt: string
}

export interface Achievement {
  name: string
  description: string
  progress: number
  maxProgress: number
  icon: string
  earned: boolean
  earnedAt: string
}

export interface PostMedia {
  type: "image" | "video" | "gif" | "voice"
  url: string
  thumbnail?: string
  duration?: number
}

export interface PostData {
  _id: string
  author: UserProfile | { _id: string; username: string; displayName: string; name: string; avatar: string; level: number; xp: number; isVerified: boolean }
  content: string
  media: PostMedia[]
  tags: string[]
  mentions: string[]
  hashtags: string[]
  likes: string[]
  likeCount: number
  reposts: { user: string | UserProfile; thought: string; createdAt: string }[]
  repostCount: number
  saves: string[]
  saveCount: number
  commentCount: number
  shareCount: number
  isEdited: boolean
  isPinned: boolean
  isModerated: boolean
  moderationAction: string
  createdAt: string
  updatedAt: string
}

export interface CommentData {
  _id: string
  post: string
  author: { _id: string; username: string; displayName: string; name: string; avatar: string; isVerified: boolean }
  content: string
  parentComment: string | null
  depth: number
  likes: string[]
  likeCount: number
  replyCount: number
  isEdited: boolean
  createdAt: string
  replies?: CommentData[]
}

export interface NotificationData {
  _id: string
  recipient: string
  actor: { _id: string; username: string; displayName: string; name: string; avatar: string }
  type: string
  post?: string
  comment?: string
  message?: string
  read: boolean
  metadata: Record<string, unknown>
  createdAt: string
}

export interface ConversationData {
  user: UserProfile
  lastMessage: MessageData
  unreadCount: number
}

export interface MessageData {
  _id: string
  sender: { _id: string; username: string; displayName: string; name: string; avatar: string }
  receiver: { _id: string; username: string; displayName: string; name: string; avatar: string }
  content: string
  media: PostMedia[]
  read: boolean
  readAt: string
  createdAt: string
}

export interface ReportData {
  _id: string
  reporter: string | UserProfile
  targetType: "post" | "comment" | "user" | "message"
  target: string
  reason: string
  description: string
  status: "pending" | "reviewed" | "dismissed" | "action_taken"
  createdAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasMore: boolean
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("calmora_token")
  } catch {
    return null
  }
}

const headers = (): Record<string, string> => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getStoredPosts(): PostData[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("calmora_community_posts")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredPosts(posts: PostData[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("calmora_community_posts", JSON.stringify(posts))
  } catch {}
}

export const communityApi = {
  // Posts
  getFeed: async (page = 1, tag?: string) => {
    try {
      return await api<{ posts: PostData[]; pagination: Pagination }>(
        `/posts/feed?page=${page}&limit=20${tag ? `&tag=${tag}` : ""}`,
        { headers: headers() }
      )
    } catch {
      const stored = getStoredPosts()
      const filtered = tag
        ? stored.filter((p) => p.tags?.includes(tag) || p.hashtags?.includes(tag.toLowerCase()))
        : stored
      const limit = 20
      const start = (page - 1) * limit
      const paginated = filtered.slice(start, start + limit)
      return {
        posts: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          pages: Math.ceil(filtered.length / limit) || 1,
          hasMore: start + paginated.length < filtered.length,
        },
      }
    }
  },

  getPost: (id: string) =>
    api<{ post: PostData }>(`/posts/${id}`, { headers: headers() }),

  createPost: async (data: { content: string; media?: PostMedia[]; tags?: string[] }) => {
    try {
      const res = await api<{ post: PostData; moderated: boolean }>("/posts", {
        method: "POST",
        body: JSON.stringify(data),
        headers: headers(),
      })
      if (res?.post) {
        const stored = getStoredPosts()
        saveStoredPosts([res.post, ...stored])
      }
      return res
    } catch {
      // Local storage fallback when API returns 404 or fails
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("calmora_user") : null
      const userObj = userRaw ? JSON.parse(userRaw) : { name: "Guest Explorer", username: "guest" }

      const newPost: PostData = {
        _id: `post_local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        author: {
          _id: userObj.id || "guest_1",
          username: userObj.username || userObj.name || "Guest Explorer",
          displayName: userObj.name || "Guest Explorer",
          name: userObj.name || "Guest Explorer",
          avatar: userObj.avatar || "",
          level: userObj.level || 8,
          xp: userObj.xp || 1200,
          isVerified: false,
        },
        content: data.content,
        media: data.media || [],
        tags: data.tags || [],
        mentions: [],
        hashtags: data.tags?.map((t) => t.toLowerCase()) || [],
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

      const stored = getStoredPosts()
      const updated = [newPost, ...stored]
      saveStoredPosts(updated)
      return { post: newPost, moderated: false }
    }
  },

  updatePost: (id: string, data: { content?: string; media?: PostMedia[]; tags?: string[] }) =>
    api<{ post: PostData }>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: headers(),
    }),

  deletePost: async (id: string) => {
    try {
      const res = await api<{ message: string }>(`/posts/${id}`, { method: "DELETE", headers: headers() })
      const stored = getStoredPosts()
      saveStoredPosts(stored.filter((p) => p._id !== id))
      return res
    } catch {
      const stored = getStoredPosts()
      saveStoredPosts(stored.filter((p) => p._id !== id))
      return { message: "Deleted locally" }
    }
  },

  likePost: async (id: string) => {
    try {
      return await api<{ liked: boolean; likeCount: number }>(`/posts/${id}/like`, { method: "POST", headers: headers() })
    } catch {
      const stored = getStoredPosts()
      let liked = false
      let count = 0
      const updated = stored.map((p) => {
        if (p._id !== id) return p
        liked = !(p.likes || []).includes("current_user")
        const newLikes = liked ? [...(p.likes || []), "current_user"] : (p.likes || []).filter((u) => u !== "current_user")
        count = newLikes.length
        return { ...p, likes: newLikes, likeCount: count }
      })
      saveStoredPosts(updated)
      return { liked, likeCount: count }
    }
  },

  repostPost: (id: string, thought?: string) =>
    api<{ reposted: boolean; repostCount: number }>(`/posts/${id}/repost`, {
      method: "POST",
      body: JSON.stringify({ thought }),
      headers: headers(),
    }),

  savePost: (id: string) =>
    api<{ saved: boolean; saveCount: number }>(`/posts/${id}/save`, { method: "POST", headers: headers() }),

  pinPost: (id: string) =>
    api<{ pinned: boolean }>(`/posts/${id}/pin`, { method: "POST", headers: headers() }),

  reportPost: (id: string, reason: string, description?: string) =>
    api<{ message: string }>(`/posts/${id}/report`, {
      method: "POST",
      body: JSON.stringify({ reason, description }),
      headers: headers(),
    }),

  // Comments
  getComments: (postId: string, page = 1) =>
    api<{ comments: CommentData[]; pagination: Pagination }>(`/comments/post/${postId}?page=${page}`, { headers: headers() }),

  createComment: (postId: string, content: string, parentCommentId?: string) =>
    api<{ comment: CommentData }>(`/comments/post/${postId}`, {
      method: "POST",
      body: JSON.stringify({ content, parentCommentId }),
      headers: headers(),
    }),

  updateComment: (id: string, content: string) =>
    api<{ comment: CommentData }>(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
      headers: headers(),
    }),

  deleteComment: (id: string) =>
    api<{ message: string }>(`/comments/${id}`, { method: "DELETE", headers: headers() }),

  likeComment: (id: string) =>
    api<{ liked: boolean; likeCount: number }>(`/comments/${id}/like`, { method: "POST", headers: headers() }),

  // Follows
  toggleFollow: (userId: string) =>
    api<{ following: boolean; followerCount: number }>(`/follows/${userId}`, { method: "POST", headers: headers() }),

  checkFollow: (userId: string) =>
    api<{ following: boolean }>(`/follows/${userId}/status`, { headers: headers() }),

  getFollowers: (userId: string, page = 1) =>
    api<{ users: UserProfile[]; pagination: Pagination }>(`/follows/${userId}/followers?page=${page}`, { headers: headers() }),

  getFollowing: (userId: string, page = 1) =>
    api<{ users: UserProfile[]; pagination: Pagination }>(`/follows/${userId}/following?page=${page}`, { headers: headers() }),

  // Notifications
  getNotifications: (page = 1) =>
    api<{ notifications: NotificationData[]; unreadCount: number; pagination: Pagination }>(`/notifications?page=${page}`, { headers: headers() }),

  markAllRead: () =>
    api<{ message: string }>("/notifications/read-all", { method: "POST", headers: headers() }),

  markRead: (id: string) =>
    api<{ message: string }>(`/notifications/${id}/read`, { method: "POST", headers: headers() }),

  // Messages
  getConversations: () =>
    api<{ conversations: ConversationData[] }>("/messages/conversations", { headers: headers() }),

  getMessages: (userId: string, page = 1) =>
    api<{ messages: MessageData[] }>(`/messages/${userId}?page=${page}`, { headers: headers() }),

  sendMessage: (userId: string, content: string) =>
    api<{ message: MessageData }>(`/messages/${userId}`, {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: headers(),
    }),

  // Search
  search: (q: string, type?: string, page = 1) =>
    api<{ users?: UserProfile[]; posts?: PostData[]; userCount?: number; postCount?: number }>(
      `/search?q=${encodeURIComponent(q)}&page=${page}${type ? `&type=${type}` : ""}`,
      { headers: headers() }
    ),

  getSuggestions: (q: string) =>
    api<{ users: UserProfile[]; hashtags: { tag: string; count: number }[] }>(
      `/search/suggestions?q=${encodeURIComponent(q)}`,
      { headers: headers() }
    ),

  // Reports & Blocks
  submitReport: (targetType: string, target: string, reason: string, description?: string) =>
    api<{ report: ReportData }>("/reports", {
      method: "POST",
      body: JSON.stringify({ targetType, target, reason, description }),
      headers: headers(),
    }),

  toggleBlock: (userId: string) =>
    api<{ blocked: boolean; message: string }>(`/reports/block/${userId}`, { method: "POST", headers: headers() }),

  getBlockedUsers: () =>
    api<{ blockedUsers: UserProfile[] }>("/reports/blocked", { headers: headers() }),

  // Users / Profile
  getUserProfile: (identifier: string) =>
    api<{ user: UserProfile }>(`/search/user/${encodeURIComponent(identifier)}`, { headers: headers() }),

  getUserPosts: (userId: string, page = 1) =>
    api<{ posts: PostData[]; pagination: Pagination }>(`/posts/feed?author=${userId}&page=${page}`, { headers: headers() }),

  // Leaderboard
  getLeaderboard: (type = "xp", page = 1) =>
    api<{ users: UserProfile[]; pagination: Pagination }>(`/search/leaderboard?type=${type}&page=${page}`, { headers: headers() }),
}
