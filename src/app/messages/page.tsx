/**
 * @file page.tsx
 * @description React page component for direct messaging.
 * Renders conversation sidebars containing unread counters, chat details,
 * and text bubbles. Handles enter submission bindings and auto-scrolling focus offsets.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { MessageSquare, Send, ArrowLeft, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { communityApi } from "@/lib/community-api"
import { useAuth } from "@/lib/hooks/useAuth"
import type { ConversationData, MessageData } from "@/lib/community-api"

export default function MessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadConversations() }, [])

  // Refetch message histories when changing active conversations
  useEffect(() => {
    if (activeUserId) {
      communityApi.getMessages(activeUserId).then((res) => setMessages(res.messages)).catch(() => {})
    }
  }, [activeUserId])

  // Scroll to bottom of message lists on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /**
   * Loads recent chat threads from server.
   */
  const loadConversations = async () => {
    try {
      const res = await communityApi.getConversations()
      setConversations(res.conversations)
    } catch {} finally { setLoading(false) }
  }

  /**
   * Submits a message to the active conversation user and updates state.
   */
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

  const activeUser = conversations.find((c) => c.user?._id === activeUserId)?.user

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
        <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/10">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-semibold text-white">Messages</h1>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Conversations sidebar list */}
            <div className="w-72 border-r border-white/10 overflow-y-auto flex-shrink-0">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm px-4">No conversations yet</div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.user?._id}
                    onClick={() => setActiveUserId(c.user?._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                      activeUserId === c.user?._id ? "bg-blue-500/10" : "hover:bg-white/5"
                    }`}
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

            {/* Conversation active viewpane */}
            {activeUser ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
                  <button className="lg:hidden" onClick={() => setActiveUserId(null)}>
                    <ArrowLeft className="w-5 h-5 text-white/60" />
                  </button>
                  <Avatar src={activeUser.avatar} name={activeUser.displayName || activeUser.name} size="sm" />
                  <span className="text-sm font-medium text-white">{activeUser.displayName || activeUser.name}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => {
                    const isMe = m.sender?._id === user?.id
                    return (
                      <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] ${isMe ? "order-1" : "order-1"}`}>
                          <div className={`px-3 py-2 rounded-2xl text-sm ${
                            isMe
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md"
                              : "bg-white/10 text-white rounded-bl-md"
                          }`}>
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

                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
                    />
                    <Button variant="primary" size="sm" icon={<Send className="w-4 h-4" />} onClick={handleSend} loading={sending} disabled={!newMessage.trim()}>Send</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
