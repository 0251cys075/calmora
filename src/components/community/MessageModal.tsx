"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Send, X, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { communityApi } from "@/lib/community-api"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import type { ConversationData, MessageData } from "@/lib/community-api"

interface MessageModalProps {
  open: boolean
  onClose: () => void
  initialUserId?: string
}

export function MessageModal({ open, onClose, initialUserId }: MessageModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [activeUserId, setActiveUserId] = useState<string | null>(initialUserId || null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) loadConversations()
  }, [open])

  useEffect(() => {
    if (activeUserId) loadMessages(activeUserId)
  }, [activeUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const res = await communityApi.getConversations()
      setConversations(res.conversations)
      if (initialUserId && !activeUserId) setActiveUserId(initialUserId)
    } catch {}
    setLoading(false)
  }

  const loadMessages = async (userId: string) => {
    try {
      const res = await communityApi.getMessages(userId)
      setMessages(res.messages)
    } catch {}
  }

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !activeUserId) return
    setSending(true)
    try {
      const res = await communityApi.sendMessage(activeUserId, newMessage.trim())
      setMessages((prev) => [...prev, res.message])
      setNewMessage("")
      loadConversations()
    } catch {}
    setSending(false)
  }, [newMessage, activeUserId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeUser = conversations.find((c) => c.user?._id === activeUserId)?.user

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="absolute bottom-0 right-4 w-full max-w-md h-[600px] rounded-t-2xl border border-white/10 bg-[#0a0f1e] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">
                  {activeUser ? activeUser.displayName || activeUser.name : "Messages"}
                </h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeUser ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => {
                    const isMe = m.sender?._id === user?.id
                    return (
                      <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] ${isMe ? "order-1" : "order-1"}`}>
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              isMe
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md"
                                : "bg-white/10 text-white rounded-bl-md"
                            }`}
                          >
                            {m.content}
                          </div>
                          <p className={`text-[10px] text-white/20 mt-0.5 ${isMe ? "text-right" : "text-left"}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {isMe && m.read && <span className="ml-1 text-blue-400">Read</span>}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
                    />
                    <Button variant="primary" size="sm" icon={<Send className="w-4 h-4" />} onClick={handleSend} loading={sending} disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 text-white/30 text-sm">No conversations yet</div>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.user?._id}
                      onClick={() => setActiveUserId(c.user?._id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
                    >
                      <Avatar src={c.user?.avatar} name={c.user?.displayName || c.user?.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{c.user?.displayName || c.user?.name}</span>
                          {c.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-medium">{c.unreadCount}</span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 truncate">{c.lastMessage?.content}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
