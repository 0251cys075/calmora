"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Sparkles, Users, Send, Flame, Share2, X, Plus } from "lucide-react"
import { useState, useCallback } from "react"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

interface Post {
  id: number
  author: string
  badge: string
  time: string
  content: string
  likes: number
  comments: number
  tags: string[]
}

const defaultPosts: Post[] = [
  {
    id: 1,
    author: "CalmSeeker42",
    badge: "🌟 Veteran",
    time: "2h ago",
    content: "Completed my 21-day meditation challenge! It was tough but so worth it. Feeling more centered and peaceful than ever. Remember, consistency > perfection. You've got this! 🙏",
    likes: 24,
    comments: 8,
    tags: ["meditation", "21-day-challenge", "mindfulness"],
  },
  {
    id: 2,
    author: "MindfulMornings",
    badge: "🌱 Rising Star",
    time: "4h ago",
    content: "Today's gratitude: Woke up to a beautiful sunrise, had a peaceful cup of tea, and my morning meditation felt deeper than usual. What are you grateful for today?",
    likes: 18,
    comments: 12,
    tags: ["gratitude", "morning-routine"],
  },
  {
    id: 3,
    author: "BreathingEasy",
    badge: "💎 Champion",
    time: "6h ago",
    content: "For anyone struggling with anxiety right now: You are not alone. Take a deep breath with me. In for 4... hold for 4... out for 6. You are safe. This feeling will pass.",
    likes: 42,
    comments: 15,
    tags: ["anxiety", "support", "breathing"],
  },
  {
    id: 4,
    author: "GrowthJourney",
    badge: "🌟 Veteran",
    time: "8h ago",
    content: "Day 15 of my Dopamine Detox challenge. The first week was brutal but now I'm finding joy in simple things again. Reading a physical book, going for walks, having real conversations. Highly recommend!",
    likes: 31,
    comments: 9,
    tags: ["dopamine-detox", "challenge"],
  },
]

const randomBadges = ["🌱 Explorer", "🌟 Veteran", "💎 Champion", "🌊 Wave Rider", "🔥 Phoenix", "🌙 Moon Seeker"]
const randomNames = ["ZenMaster", "PeacefulSoul", "MindfulOne", "CalmVibes", "SerenityNow", "InnerPeace", "BreatheDeep", "StillWaters"]

const prompts = [
  "What small win are you celebrating today?",
  "Share one thing you're grateful for",
  "What's your favorite calming activity?",
  "A piece of advice for your past self",
]

export default function CommunityPage() {
  const [posts, setPosts] = useLocalStorage<Post[]>("calmora_community_posts", defaultPosts)
  const [liked, setLiked] = useState<number[]>([])
  const [openComments, setOpenComments] = useState<number[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [postComments, setPostComments] = useState<Record<number, { author: string; content: string; time: string }[]>>({})
  const [promptInput, setPromptInput] = useState("")
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTags, setNewPostTags] = useState("")

  const sharePrompt = useCallback(() => {
    const text = promptInput.trim()
    if (!text) return
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
    const randomBadge = randomBadges[Math.floor(Math.random() * randomBadges.length)]
    const newPost: Post = {
      id: Date.now(),
      author: "You",
      badge: randomBadge,
      time: "Just now",
      content: text,
      likes: 0,
      comments: 0,
      tags: ["daily-prompt"],
    }
    setPosts((prev) => [newPost, ...prev])
    setPromptInput("")
  }, [promptInput, setPosts])

  const createNewPost = useCallback(() => {
    const content = newPostContent.trim()
    if (!content) return
    const tags = newPostTags.split(",").map((t) => t.trim()).filter(Boolean)
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
    const randomBadge = randomBadges[Math.floor(Math.random() * randomBadges.length)]
    const newPost: Post = {
      id: Date.now(),
      author: randomName,
      badge: randomBadge,
      time: "Just now",
      content,
      likes: 0,
      comments: 0,
      tags,
    }
    setPosts((prev) => [newPost, ...prev])
    setNewPostContent("")
    setNewPostTags("")
    setShowNewPost(false)
  }, [newPostContent, newPostTags, setPosts])

  const toggleComments = (postId: number) => {
    setOpenComments((prev) => prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId])
  }

  const submitComment = (postId: number) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return
    const comment = {
      author: "You",
      content: text,
      time: "Just now",
    }
    setPostComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment],
    }))
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Community</h1>
            <p className="text-white/50 mt-1">Share, support, and grow together</p>
          </div>
          <Button variant="primary" icon={<Sparkles className="w-4 h-4" />} onClick={() => setShowNewPost(true)}>New Post</Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <p className="text-sm text-white/50">Today's Prompt</p>
              <p className="text-white font-medium">{prompts[new Date().getDate() % prompts.length]}</p>
            </div>
            <Badge variant="info">
              <Sparkles className="w-3 h-3" /> Daily Prompt
            </Badge>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sharePrompt() }}
              placeholder="Share your thoughts..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
            />
            <Button variant="primary" icon={<Send className="w-4 h-4" />} onClick={sharePrompt}>Share</Button>
          </div>
        </GlassCard>
      </motion.div>

      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + post.id * 0.05 }}
          >
            <GlassCard>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                  {post.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{post.author}</span>
                    <Badge variant="default" size="sm">{post.badge}</Badge>
                    <span className="text-xs text-white/30 ml-auto">{post.time}</span>
                  </div>
                  <p className="text-sm text-white/70 mt-2">{post.content}</p>
                  <div className="flex gap-2 mt-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setLiked((prev) => prev.includes(post.id) ? prev.filter((id) => id !== post.id) : [...prev, post.id])}
                      className={`flex items-center gap-1 text-sm transition-all ${
                        liked.includes(post.id) ? "text-rose-400" : "text-white/40 hover:text-rose-400"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked.includes(post.id) ? "fill-current" : ""}`} />
                      {post.likes + (liked.includes(post.id) ? 1 : 0)}
                    </button>
                    <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-all">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments + (postComments[post.id]?.length || 0)}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-all ml-auto">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                  {openComments.includes(post.id) && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                      {(postComments[post.id] || []).map((c, ci) => (
                        <div key={ci} className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0 mt-0.5">
                            {c.author[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-white">{c.author}</span>
                              <span className="text-[10px] text-white/30">{c.time}</span>
                            </div>
                            <p className="text-xs text-white/70 mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") submitComment(post.id) }}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-xs"
                        />
                        <button
                          onClick={() => submitComment(post.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="text-center py-4">
        <Button variant="glass">Load More Posts</Button>
      </div>

      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl bg-[#0a0f1e] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">New Post</h3>
                <button onClick={() => setShowNewPost(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm resize-none"
              />
              <input
                type="text"
                value={newPostTags}
                onChange={(e) => setNewPostTags(e.target.value)}
                placeholder="Tags (comma separated): meditation, gratitude"
                className="w-full mt-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="glass" onClick={() => setShowNewPost(false)}>Cancel</Button>
                <Button variant="primary" onClick={createNewPost}>Post</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
