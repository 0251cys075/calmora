"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import {
  Image, Video, Music, Hash, X, Send, AlertTriangle,
} from "lucide-react"
import { useState, useCallback, useRef } from "react"
import { communityApi } from "@/lib/community-api"
import { useAuth } from "@/lib/hooks/useAuth"
import type { PostData } from "@/lib/community-api"

interface PostComposerProps {
  onPostCreated: (post: PostData) => void
  compact?: boolean
}

export function PostComposer({ onPostCreated, compact }: PostComposerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [expanded, setExpanded] = useState(!compact)
  const [loading, setLoading] = useState(false)
  const [moderated, setModerated] = useState(false)
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return
    setLoading(true)
    setModerated(false)
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await communityApi.createPost({
        content: content.trim(),
        tags: tagList,
      })
      setContent("")
      setTags("")
      setMediaPreviews([])
      if (res.moderated) setModerated(true)
      onPostCreated(res.post)
    } catch (err: any) {
      alert(err?.message || "Failed to create post")
    }
    setLoading(false)
  }, [content, tags, onPostCreated])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  const handleMediaSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newPreviews = Array.from(files).map((f) => URL.createObjectURL(f))
    setMediaPreviews((prev) => [...prev, ...newPreviews])
  }

  const authorName = user?.name || "You"

  return (
    <>
      <GlassCard>
        <div className="flex gap-3">
          <Avatar name={authorName} size={compact ? "sm" : "md"} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {!expanded && compact ? (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 text-sm hover:bg-white/10 transition-all"
              >
                What&apos;s on your mind?
              </button>
            ) : (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's on your mind?"
                  rows={3}
                  maxLength={5000}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm resize-none"
                />

                {/* Media previews */}
                {mediaPreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {mediaPreviews.map((url, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                        <button
                          onClick={() => setMediaPreviews((p) => p.filter((_, j) => j !== i))}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma separated): meditation, gratitude"
                  className="w-full mt-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
                />

                {/* Moderation warning */}
                {moderated && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Your post was flagged by our moderation system. It may be reviewed.
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1">
                    <button
                      onClick={handleMediaSelect}
                      className="p-2 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"
                      title="Add images"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg text-white/40 hover:text-purple-400 hover:bg-white/5 transition-all"
                      title="Add video"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-white/5 transition-all"
                      title="Record voice"
                    >
                      <Music className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">{content.length}/5000</span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Send className="w-4 h-4" />}
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={!content.trim()}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </>
  )
}
