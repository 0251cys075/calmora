"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import {
  Image, Video, Music, Hash, X, Send, AlertTriangle,
} from "lucide-react"
import { useState, useCallback, useRef, useEffect } from "react"
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
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaErrors, setMediaErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      setMediaErrors(prev => [...prev, `${file.name} exceeds 100MB limit`])
      return false
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      setMediaErrors(prev => [...prev, `${file.name} is not a supported format (MP4, WebM, MOV, JPG, PNG, GIF)`])
      return false
    }

    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of Array.from(files)) {
      if (validateFile(file)) {
        validFiles.push(file)
      }
    }

    if (errors.length > 0) {
      setMediaErrors(prev => [...prev, ...errors])
    }

    const newPreviews = validFiles.map(f => URL.createObjectURL(f))
    setMediaPreviews(prev => [...prev, ...newPreviews])
    setMediaFiles(prev => [...prev, ...validFiles])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearMediaErrors = () => {
    setMediaErrors([])
  }

  const removeMedia = (index: number) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index))
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getMediaType = (previewUrl: string): "image" | "video" => {
    if (previewUrl.includes('.mp4') || previewUrl.includes('.mov') || previewUrl.includes('.webm')) {
      return 'video'
    }
    return 'image'
  }

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && mediaPreviews.length === 0) return

    setLoading(true)
    setModerated(false)
    clearMediaErrors()
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)

      const media: any[] = []
      for (let i = 0; i < mediaPreviews.length; i++) {
        const preview = mediaPreviews[i]
        const file = mediaFiles[i]
        const mediaType = file ? (file.type.includes('video') ? 'video' : 'image') : getMediaType(preview)

        media.push({
          type: mediaType,
          url: preview,
        })
      }

      const res = await communityApi.createPost({
        content: content.trim(),
        media: media.length > 0 ? media : undefined,
        tags: tagList,
      })

      setContent("")
      setTags("")
      setMediaPreviews([])
      setMediaFiles([])
      setMediaErrors([])
      if (res.moderated) setModerated(true)
      onPostCreated(res.post)
    } catch (err: any) {
      alert(err?.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }, [content, tags, mediaPreviews, mediaFiles, onPostCreated])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  const handleMediaSelect = () => {
    fileInputRef.current?.click()
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
                type="button"
              >
                What's on your mind?
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
                        {getMediaType(url) === 'video' ? (
                          <video
                            src={url}
                            className="w-20 h-20 rounded-lg object-cover"
                            preload="metadata"
                          />
                        ) : (
                          <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeMedia(i)
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center cursor-pointer"
                          type="button"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Media errors */}
                {mediaErrors.length > 0 && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {mediaErrors.map((error, i) => (
                      <div key={i}>• {error}</div>
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
                      type="button"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleMediaSelect}
                      className="p-2 rounded-lg text-white/40 hover:text-purple-400 hover:bg-white/5 transition-all"
                      title="Add video (MP4, WebM, MOV, max 100MB)"
                      type="button"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-white/5 transition-all"
                      title="Record voice"
                      type="button"
                    >
                      <Music className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,.mov,.mp4,.webm"
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
                      disabled={!content.trim() && mediaPreviews.length === 0}
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
