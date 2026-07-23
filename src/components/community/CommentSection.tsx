"use client"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Reply, Edit3, Trash2, Send, ChevronDown } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { communityApi } from "@/lib/community-api"
import { useAuth } from "@/lib/hooks/useAuth"
import type { CommentData } from "@/lib/community-api"

interface CommentSectionProps {
  postId: string
  onCommentCountChange?: (count: number) => void
}

export function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadComments()
    return () => {
      setComments([])
      setNewComment("")
      setReplyTo(null)
      setReplyContent("")
      setEditingId(null)
      setEditContent("")
      setShowReplies({})
    }
  }, [postId])

  const loadComments = async () => {
    try {
      const res = await communityApi.getComments(postId)
      setComments(res.comments)
    } catch {} finally {
      setLoading(false)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim()) return
    try {
      const res = await communityApi.createComment(postId, newComment.trim())
      setComments((prev) => [res.comment, ...prev])
      setNewComment("")
      onCommentCountChange?.(comments.length + 1)
    } catch {}
  }, [postId, newComment, onCommentCountChange, comments.length])

  const handleReply = useCallback(async (parentId: string) => {
    if (!replyContent.trim()) return
    try {
      const res = await communityApi.createComment(postId, replyContent.trim(), parentId)
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), res.comment], replyCount: c.replyCount + 1 }
            : c
        )
      )
      setReplyTo(null)
      setReplyContent("")
    } catch {}
  }, [postId, replyContent])

  const handleLike = useCallback(async (commentId: string) => {
    try {
      const res = await communityApi.likeComment(commentId)
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) return { ...c, likeCount: res.likeCount }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r._id === commentId ? { ...r, likeCount: res.likeCount } : r
              ),
            }
          }
          return c
        })
      )
    } catch {}
  }, [])

  const handleDelete = useCallback(async (commentId: string) => {
    if (!confirm("Delete this comment?")) return
    try {
      await communityApi.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c._id !== commentId))
      onCommentCountChange?.(Math.max(0, comments.length - 1))
    } catch {}
  }, [onCommentCountChange, comments.length])

  const handleEdit = useCallback(async (commentId: string) => {
    if (!editContent.trim()) return
    try {
      const res = await communityApi.updateComment(commentId, editContent.trim())
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: res.comment.content, isEdited: true } : c))
      )
      setEditingId(null)
    } catch {}
  }, [editContent])

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-white/10 rounded w-24 mb-1" />
              <div className="h-3 bg-white/10 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      {/* Comment input */}
      <div className="flex gap-2 mb-4">
        <Avatar name={user?.name || "U"} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-xs"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment._id}>
            <div className="flex gap-2">
              <button onClick={() => router.push(`/profile/${comment.author?.username || comment.author?._id}`)} className="flex-shrink-0">
                <Avatar src={comment.author?.avatar} name={comment.author?.name || "U"} size="sm" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/profile/${comment.author?.username || comment.author?._id}`)}
                    className="text-xs font-medium text-white hover:text-blue-400"
                  >
                    {comment.author?.name || "User"}
                  </button>
                  {comment.isEdited && (
                    <span className="text-[10px] text-white/20 italic">edited</span>
                  )}
                  <span className="text-[10px] text-white/30 ml-auto">{timeAgo(comment.createdAt)}</span>
                </div>

                {editingId === comment._id ? (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50"
                    />
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => handleEdit(comment._id)} className="text-xs text-blue-400">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-white/40">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/70 mt-0.5">{comment.content}</p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => handleLike(comment._id)} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-rose-400 transition-colors">
                    <Heart className="w-3 h-3" />{comment.likeCount > 0 && comment.likeCount}
                  </button>
                  <button onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-blue-400">
                    <Reply className="w-3 h-3" /> Reply
                  </button>
                  {user?.id === comment.author?._id && (
                    <>
                      <button onClick={() => { setEditingId(comment._id); setEditContent(comment.content) }} className="text-[10px] text-white/30 hover:text-white">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(comment._id)} className="text-[10px] text-white/30 hover:text-rose-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                {/* Reply input */}
                {replyTo === comment._id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleReply(comment._id) }}
                      placeholder="Write a reply..."
                      className="flex-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-xs"
                    />
                    <button onClick={() => handleReply(comment._id)} className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">Reply</button>
                  </div>
                )}

                {/* Toggle replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <button
                    onClick={() => setShowReplies((p) => ({ ...p, [comment._id]: !p[comment._id] }))}
                    className="flex items-center gap-1 mt-1 text-[10px] text-blue-400/70 hover:text-blue-400"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${showReplies[comment._id] ? "rotate-180" : ""}`} />
                    {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                  </button>
                )}
              </div>
            </div>

            {/* Nested replies */}
            <AnimatePresence>
              {showReplies[comment._id] && comment.replies && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-8 mt-2 space-y-2 pl-3 border-l border-white/10"
                >
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-2">
                      <button onClick={() => router.push(`/profile/${reply.author?.username || reply.author?._id}`)} className="flex-shrink-0">
                        <Avatar src={reply.author?.avatar} name={reply.author?.name || "U"} size="sm" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">{reply.author?.name || "User"}</span>
                          {reply.isEdited && <span className="text-[10px] text-white/20 italic">edited</span>}
                          <span className="text-[10px] text-white/30 ml-auto">{timeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="text-xs text-white/70 mt-0.5">{reply.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => handleLike(reply._id)} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-rose-400">
                            <Heart className="w-3 h-3" />{reply.likeCount > 0 && reply.likeCount}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-white/30 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  )
}
