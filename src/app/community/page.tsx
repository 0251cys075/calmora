"use client"

import { motion } from "framer-motion"
import { Sparkles, Search, Bell, MessageSquare, Shield, TrendingUp, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/community/PostCard"
import { PostComposer } from "@/components/community/PostComposer"
import { Leaderboard } from "@/components/community/Leaderboard"
import { SearchModal } from "@/components/community/SearchModal"
import { NotificationPanel } from "@/components/community/NotificationPanel"
import { MessageModal } from "@/components/community/MessageModal"
import { ModerationPanel } from "@/components/community/ModerationPanel"
import { communityApi } from "@/lib/community-api"
import { useAuth } from "@/lib/hooks/useAuth"
import type { PostData } from "@/lib/community-api"

const prompts = [
  "What small win are you celebrating today?",
  "Share one thing you're grateful for",
  "What's your favorite calming activity?",
  "A piece of advice for your past self",
  "What self-care practice made a difference today?",
  "Share a quote that inspires your wellness journey",
]

const FILTER_TAGS = ["", "meditation", "gratitude", "anxiety", "mindfulness", "selfcare", "motivation", "challenge"]

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [tagFilter, setTagFilter] = useState("")

  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showModeration, setShowModeration] = useState(false)

  const isFetchingRef = useRef(false)
  const hasMoreRef = useRef(true)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch posts cleanly with ref guards to prevent overlapping requests
  const fetchPosts = useCallback(async (pageNum: number, tag: string, isAppend = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (pageNum === 1 && !isAppend) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const res = await communityApi.getFeed(pageNum, tag || undefined)
      const fetchedPosts = res?.posts || []
      const moreAvailable = Boolean(res?.pagination?.hasMore) && fetchedPosts.length > 0

      setHasMore(moreAvailable)
      hasMoreRef.current = moreAvailable

      if (isAppend) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id))
          const uniqueNew = fetchedPosts.filter((p) => !existingIds.has(p._id))
          return [...prev, ...uniqueNew]
        })
      } else {
        setPosts(fetchedPosts)
      }
    } catch (err) {
      console.error("Error loading community posts:", err)
      // Stop infinite retries on network/API failure
      setHasMore(false)
      hasMoreRef.current = false
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isFetchingRef.current = false
    }
  }, [])

  // Initial load and tag filter updates
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    hasMoreRef.current = true
    fetchPosts(1, tagFilter, false)
  }, [tagFilter, fetchPosts])

  // Infinite scroll IntersectionObserver setup
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && hasMoreRef.current) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1
            fetchPosts(nextPage, tagFilter, true)
            return nextPage
          })
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px",
      }
    )

    const targetNode = loadMoreRef.current
    if (targetNode) observer.observe(targetNode)

    return () => {
      if (targetNode) observer.unobserve(targetNode)
      observer.disconnect()
    }
  }, [hasMore, loading, loadingMore, tagFilter, fetchPosts])

  const handleSelectTag = useCallback((tag: string) => {
    if (tagFilter === tag) return
    setTagFilter(tag)
  }, [tagFilter])

  const handlePostCreated = useCallback((post: PostData) => {
    setPosts((prev) => [post, ...prev])
  }, [])

  const handlePostUpdated = useCallback((updatedPost: PostData) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)))
  }, [])

  const handlePostDeleted = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== id))
  }, [])

  const isAdmin = (user as any)?.isAdmin || false
  const todayPrompt = prompts[new Date().getDate() % prompts.length]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Community</h1>
            <p className="text-white/50 mt-1">Share, support, and grow together</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              type="button"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all relative"
              type="button"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMessages(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              type="button"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowModeration(true)}
                className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
                type="button"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Daily Prompt */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-white/50">Today's Prompt</p>
                <Badge variant="premium" size="sm">Daily</Badge>
              </div>
              <p className="text-white font-medium mt-0.5 truncate">{todayPrompt}</p>
            </div>
          </div>
          <PostComposer onPostCreated={handlePostCreated} compact />
        </GlassCard>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Feed Column */}
        <div className="lg:col-span-3 space-y-4 min-h-[500px]">
          {/* Tag filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSelectTag(tag)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  tagFilter === tag
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-white/5 text-white/50 border border-white/10 hover:text-white hover:bg-white/10"
                }`}
                type="button"
              >
                {tag ? `#${tag}` : "All Posts"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i}>
                  <div className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-1/4" />
                      <div className="h-3 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdate={handlePostUpdated}
                  onDelete={handlePostDeleted}
                />
              ))}

              {/* Infinite scroll loader trigger */}
              <div ref={loadMoreRef} className="py-4 text-center">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading more posts...
                  </div>
                )}
                {!hasMore && posts.length > 0 && (
                  <p className="text-white/30 text-sm">You've reached the end. Come back later for more!</p>
                )}
              </div>

              {posts.length === 0 && !loading && (
                <GlassCard>
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">No posts yet. Be the first to share something!</p>
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-4">
          <Leaderboard compact />

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">Trending Topics</h3>
            <div className="space-y-2">
              {[
                { tag: "meditation", posts: 234 },
                { tag: "gratitude", posts: 189 },
                { tag: "anxiety", posts: 156 },
                { tag: "mindfulness", posts: 142 },
                { tag: "selfcare", posts: 98 },
              ].map((t) => (
                <button
                  key={t.tag}
                  onClick={() => handleSelectTag(t.tag)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                  type="button"
                >
                  <span className="text-sm text-white/70">#{t.tag}</span>
                  <span className="text-xs text-white/30">{t.posts}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Modals */}
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
      <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} />
      <MessageModal open={showMessages} onClose={() => setShowMessages(false)} />
      <ModerationPanel open={showModeration} onClose={() => setShowModeration(false)} />
    </div>
  )
}

