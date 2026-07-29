/**
 * @file PostCard.tsx
 * @description React component rendering a single community feed post.
 * Includes interactive social functions (likes, saves, pins, edits, deletes, reports, share dialogs)
 * and rich media support (image grids, video players, and audio clips).
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, MessageCircle, Repeat2, Bookmark, Share2,
  Edit3, Trash2, Flag, Pin, Link2, MoreHorizontal,
  ChevronDown, Check, X, Send,
} from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { PostData } from "@/lib/community-api"
import { communityApi } from "@/lib/community-api"
import { CommentSection } from "./CommentSection"
import { useAuth } from "@/lib/hooks/useAuth"

interface PostCardProps {
  post: PostData
  onUpdate?: (post: PostData) => void
  onDelete?: (id: string) => void
}

export function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  // UI toggles and local counter states
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id || "") || false)
  const [isSaved, setIsSaved] = useState(post.saves?.includes(user?.id || "") || false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [pinned, setPinned] = useState(post.isPinned)
  const [loading, setLoading] = useState("")
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const isAuthor = user?.id === post.author?._id

  // Reset media loader parameters when post ID updates
  useEffect(() => {
    setVideoError(false)
    setVideoLoaded(false)
  }, [post._id])

  /**
   * Toggles the post like state.
   */
  const handleLike = useCallback(async () => {
    if (loading === "like") return
    setLoading("like")
    try {
      const res = await communityApi.likePost(post._id)
      setIsLiked(res.liked)
      setLikeCount(res.likeCount)
    } catch {}
    finally {
      setLoading("")
    }
  }, [post._id, loading])

  /**
   * Toggles the bookmark save state.
   */
  const handleSave = useCallback(async () => {
    if (loading === "save") return
    try {
      const res = await communityApi.savePost(post._id)
      setIsSaved(res.saved)
    } catch {} finally {
    }
  }, [post._id, loading])

  /**
   * Toggles the pinned profile state.
   */
  const handlePin = useCallback(async () => {
    if (loading === "pin") return
    try {
      const res = await communityApi.pinPost(post._id)
      setPinned(res.pinned)
    } catch {} finally {
    }
  }, [post._id, loading])

  /**
   * Triggers community API post removal.
   */
  const handleDelete = useCallback(async () => {
    if (!confirm("Delete this post?")) return
    if (loading === "delete") return
    try {
      setLoading("delete")
      await communityApi.deletePost(post._id)
      onDelete?.(post._id)
    } catch {} finally {
      setLoading("")
    }
  }, [post._id, onDelete, loading])

  /**
   * Updates body text of the current post.
   */
  const handleEdit = useCallback(async () => {
    if (!editContent.trim()) return
    setLoading("edit")
    try {
      const res = await communityApi.updatePost(post._id, { content: editContent.trim() })
      onUpdate?.(res.post)
      setIsEditing(false)
    } catch {} finally {
      setLoading("")
    }
  }, [post._id, editContent, onUpdate])

  /**
   * Flags post for review with a moderation reason.
   */
  const handleReport = useCallback(async () => {
    if (!reportReason) return
    try {
      await communityApi.reportPost(post._id, reportReason)
      setShowReport(false)
      setReportReason("")
      alert("Report submitted. Thank you for helping keep our community safe.")
    } catch {}
  }, [post._id, reportReason])

  /**
   * Copies post URL directly to the user's clipboard.
   */
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/community?post=${post._id}`)
    setShowMenu(false)
  }, [post._id])

  /**
   * Opens native system sharing dialogues (or falls back to copy link).
   */
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Calmora Community Post",
          text: post.content.slice(0, 100),
          url: `${window.location.origin}/community?post=${post._id}`,
        })
        return
      } catch {}
    }
    handleCopyLink()
  }, [post._id, post.content, handleCopyLink])

  /**
   * Formats static ISO timestamps into human-readable relative durations.
   */
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  const authorName = post.author?.displayName || post.author?.username || post.author?.name || "Unknown"
  const authorInitial = authorName[0]?.toUpperCase() || "U"

  return (
    <GlassCard className={pinned ? "ring-1 ring-amber-500/30" : ""}>
      {/* Pin badge */}
      {pinned && (
        <div className="flex items-center gap-1 mb-2 text-amber-400/70 text-xs">
          <Pin className="w-3 h-3" /> Pinned post
        </div>
      )}

      {/* Moderated notice */}
      {post.isModerated && post.moderationAction === "flagged" && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          This post has been flagged for review
        </div>
      )}

      {/* Author header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push(`/profile/${post.author?.username || post.author?._id}`)} className="flex-shrink-0">
          <Avatar src={post.author?.avatar} name={authorName} size="md" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/profile/${post.author?.username || post.author?._id}`)}
              className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate"
            >
              {authorName}
            </button>
            {post.author?.isVerified && (
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
            {post.isEdited && (
              <span className="text-[10px] text-white/30 italic">Edited</span>
            )}
            <span className="text-xs text-white/30 ml-auto flex-shrink-0">{timeAgo(post.createdAt)}</span>
          </div>
          <p className="text-xs text-white/40">
            @{post.author?.username || "user"} · Level {post.author?.level || 1}
          </p>
        </div>

        {/* More menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 z-50 w-48 py-1 rounded-xl bg-[#0a0f1e] border border-white/10 shadow-xl backdrop-blur-2xl"
              >
                {isAuthor && (
                  <>
                    <button onClick={() => { setIsEditing(true); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">
                      <Edit3 className="w-4 h-4" /> Edit post
                    </button>
                    <button onClick={() => { handlePin(); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">
                      <Pin className="w-4 h-4" /> {pinned ? "Unpin post" : "Pin post"}
                    </button>
                    <hr className="border-white/10 my-1" />
                    <button onClick={() => { handleDelete(); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-white/5">
                      <Trash2 className="w-4 h-4" /> Delete post
                    </button>
                  </>
                )}
                {!isAuthor && (
                  <>
                    <button onClick={() => { setShowReport(true); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-white/5">
                      <Flag className="w-4 h-4" /> Report post
                    </button>
                  </>
                )}
                <button onClick={handleCopyLink} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">
                  <Link2 className="w-4 h-4" /> Copy link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <Button variant="primary" size="sm" loading={loading === "edit"} onClick={handleEdit}>
              <Check className="w-4 h-4" /> Save
            </Button>
            <Button variant="glass" size="sm" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/80 mt-3 whitespace-pre-wrap break-words">{post.content}</p>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={`mt-3 grid gap-2 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media.map((m, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-white/5">
              {m.type === "image" || m.type === "gif" ? (
                <img src={m.url} alt="" className="w-full h-48 object-cover" loading="lazy" />
              ) : m.type === "video" ? (
                <div className="relative w-full h-48 bg-black/50">
                  {videoError ? (
                    <div className="w-full h-48 flex items-center justify-center text-white/40 text-xs">
                      Failed to load video
                    </div>
                  ) : (
                    <video 
                      src={m.url} 
                      controls 
                      className="w-full h-48 object-cover"
                      preload="metadata"
                      onError={() => setVideoError(true)}
                      onLoadedData={() => setVideoLoaded(true)}
                    />
                  )}
                </div>
              ) : m.type === "voice" ? (
                <div className="w-full p-3">
                  <audio src={m.url} controls className="w-full" preload="metadata" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Tags / Hashtags */}
      {(post.tags?.length > 0 || post.hashtags?.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags?.map((tag) => (
            <span key={tag} className="text-xs text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
          {post.hashtags?.map((tag) => (
            <span key={tag} className="text-xs text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/10">
        <button
          onClick={handleLike}
          disabled={loading === "like"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            isLiked ? "text-rose-400 bg-rose-500/10" : "text-white/40 hover:text-rose-400 hover:bg-white/5"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          {likeCount > 0 && likeCount}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          {commentCount > 0 && commentCount}
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            isSaved ? "text-amber-400 bg-amber-500/10" : "text-white/40 hover:text-amber-400 hover:bg-white/5"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {}} // Repost
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-emerald-400 hover:bg-white/5 transition-all ml-auto"
        >
          <Repeat2 className="w-4 h-4" />
          {post.repostCount > 0 && post.repostCount}
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CommentSection
              postId={post._id}
              onCommentCountChange={setCommentCount}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0f1e] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Report Post</h3>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
              >
                <option value="">Select a reason...</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="abuse">Abuse</option>
                <option value="hate_speech">Hate speech</option>
                <option value="violence">Violence</option>
                <option value="self_harm">Self-harm</option>
                <option value="misinformation">Misinformation</option>
                <option value="inappropriate">Inappropriate content</option>
              </select>
              <div className="flex gap-2 mt-4">
                <Button variant="glass" size="sm" className="flex-1" onClick={() => setShowReport(false)}>Cancel</Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={handleReport} disabled={!reportReason}>Submit Report</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
