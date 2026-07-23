"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, Heart, MessageCircle, Repeat2, UserPlus, AtSign, Trophy, MessageSquare, CheckCheck, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { communityApi } from "@/lib/community-api"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { NotificationData } from "@/lib/community-api"

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

const notifIcons: Record<string, React.ElementType> = {
  like: Heart,
  comment: MessageCircle,
  reply: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  repost: Repeat2,
  badge: Trophy,
  achievement: Trophy,
  level_up: Trophy,
  message: MessageSquare,
}

const notifColors: Record<string, string> = {
  like: "text-rose-400",
  comment: "text-blue-400",
  reply: "text-blue-400",
  follow: "text-emerald-400",
  mention: "text-purple-400",
  repost: "text-emerald-400",
  badge: "text-amber-400",
  achievement: "text-amber-400",
  level_up: "text-amber-400",
  message: "text-cyan-400",
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) loadNotifications()
  }, [open])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await communityApi.getNotifications()
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount)
    } catch {}
    setLoading(false)
  }

  const handleMarkAllRead = useCallback(async () => {
    try {
      await communityApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }, [])

  const handleClick = async (notif: NotificationData) => {
    if (!notif.read) {
      try {
        await communityApi.markRead(notif._id)
        setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, read: true } : n))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {}
    }
    if (notif.type === "message" || notif.type === "follow") {
      router.push(`/profile/${notif.actor?.username || notif.actor?._id}`)
    } else {
      router.push("/community")
    }
    onClose()
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "now"
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString()
  }

  const getLabel = (n: NotificationData) => {
    const name = n.actor?.name || n.actor?.username || "Someone"
    switch (n.type) {
      case "like": return `${name} liked your post`
      case "comment": return `${name} commented on your post`
      case "reply": return `${name} replied to your comment`
      case "follow": return `${name} started following you`
      case "mention": return `${name} mentioned you`
      case "repost": return `${name} reposted your post`
      case "message": return `${name} sent you a message`
      case "badge": return `You earned a new badge!`
      case "achievement": return `Achievement unlocked!`
      case "level_up": return `You leveled up!`
      default: return `New notification from ${name}`
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0f1e] border-l border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-medium">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm">No notifications yet</div>
              ) : (
                notifications.map((n) => {
                  const Icon = notifIcons[n.type] || Bell
                  const color = notifColors[n.type] || "text-white"
                  return (
                    <button
                      key={n._id}
                      onClick={() => handleClick(n)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 ${
                        !n.read ? "bg-blue-500/5 border-l-2 border-blue-500" : ""
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80">{getLabel(n)}</p>
                        <p className="text-xs text-white/30 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
