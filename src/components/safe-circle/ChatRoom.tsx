"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Send, Flag, LogOut, AlertTriangle, Shield, Clock, Phone, PhoneOff, Video, VideoOff } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type ChatMessage, type Topic, filterBlockedContent, detectCrisisKeywords,
  HELPLINE_TEXT,
} from "@/lib/safe-circle-utils"
import { CrisisPopup } from "./CrisisPopup"

interface ChatRoomProps {
  sessionId: string
  username: string
  peerUsername: string
  topic: Topic
  onEndSession: () => void
  onSendMessage: (text: string) => void
  onTyping: () => void
  onReport: (keywords?: string[]) => void
  // Voice controls
  onVoiceAccept: () => void
  onVoiceDecline: () => void
  onVoiceEnd: () => void
  voiceCallActive: boolean
  voiceCallRequested: boolean
  voiceCallPeerRequested: boolean
  onRequestVoice: () => void
  // Video controls
  onVideoAccept: () => void
  onVideoDecline: () => void
  onVideoEnd: () => void
  videoCallActive: boolean
  videoCallRequested: boolean
  videoCallPeerRequested: boolean
  onRequestVideo: () => void
}

export function ChatRoom({
  sessionId, username, peerUsername, topic,
  onEndSession, onSendMessage, onTyping, onReport,
  onVoiceAccept, onVoiceDecline, onVoiceEnd,
  voiceCallActive, voiceCallRequested, voiceCallPeerRequested, onRequestVoice,
  onVideoAccept, onVideoDecline, onVideoEnd,
  videoCallActive, videoCallRequested, videoCallPeerRequested, onRequestVideo,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [blockWarnings, setBlockWarnings] = useState<string[]>([])
  const [showCrisisPopup, setShowCrisisPopup] = useState(false)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [showTimerWarning, setShowTimerWarning] = useState(false)
  const [showConfirmEnd, setShowConfirmEnd] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimer((prev) => {
        const next = prev + 1
        if (next === 2700) setShowTimerWarning(true)
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Called by parent when peer message arrives
  const addPeerMessage = useCallback((text: string, timestamp: number) => {
    const msg: ChatMessage = { id: `peer_${timestamp}`, sender: "peer", text, timestamp }
    setMessages((prev) => [...prev, msg])
  }, [])

  const addOwnMessage = useCallback((text: string) => {
    const msg: ChatMessage = { id: `self_${Date.now()}`, sender: "self", text, timestamp: Date.now() }
    setMessages((prev) => [...prev, msg])
  }, [])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return

    const { clean, warnings } = filterBlockedContent(text)
    if (!clean) {
      setBlockWarnings(warnings)
      setTimeout(() => setBlockWarnings([]), 4000)
      return
    }

    const crisisKeywords = detectCrisisKeywords(text)
    if (crisisKeywords.length > 0) {
      setShowCrisisPopup(true)
      onReport(crisisKeywords)
      addOwnMessage(text)
      onSendMessage(text)
      setInputText("")
      return
    }

    addOwnMessage(text)
    onSendMessage(text)
    setInputText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    onTyping()
  }

  const voiceIncoming = voiceCallPeerRequested && !voiceCallActive
  const videoIncoming = videoCallPeerRequested && !videoCallActive

  return (
    <>
      <GlassCard className="!p-0 flex flex-col h-[75vh]">
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-300">{peerUsername.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{peerUsername}</p>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">{topic}</Badge>
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(sessionTimer)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowReportDialog(true)}
              className="p-2 rounded-lg text-white/30 hover:text-amber-400 hover:bg-white/5 transition-all"
              title="Report"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowConfirmEnd(true)}
              className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-white/5 transition-all"
              title="End session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex-shrink-0">
          <div className="flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-300/80 leading-relaxed">{HELPLINE_TEXT}</p>
          </div>
        </div>

        {/* Voice/Video call bar */}
        <div className="px-4 py-2 border-b border-white/10 flex-shrink-0 flex items-center gap-2">
          {!voiceCallActive && !voiceCallRequested && !voiceCallPeerRequested && (
            <button onClick={onRequestVoice} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-blue-400 hover:border-blue-500/30 text-xs transition-all">
              <Phone className="w-3.5 h-3.5" /> Voice call
            </button>
          )}
          {voiceCallRequested && !voiceCallActive && (
            <span className="text-xs text-amber-400/80 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 animate-pulse" /> Waiting for peer to accept...
            </span>
          )}
          {voiceCallActive && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Voice active
              </span>
              <button onClick={onVoiceEnd} className="p-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all">
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {voiceIncoming && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 animate-pulse flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Incoming voice call...
              </span>
              <button onClick={onVoiceAccept} className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">Accept</button>
              <button onClick={onVoiceDecline} className="px-2 py-0.5 rounded text-xs bg-rose-500/20 border border-rose-500/30 text-rose-400">Decline</button>
            </div>
          )}

          {!videoCallActive && !videoCallRequested && !videoCallPeerRequested && (
            <button onClick={onRequestVideo} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-purple-400 hover:border-purple-500/30 text-xs transition-all">
              <Video className="w-3.5 h-3.5" /> Video call
            </button>
          )}
          {videoCallRequested && !videoCallActive && (
            <span className="text-xs text-amber-400/80 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 animate-pulse" /> Waiting for peer...
            </span>
          )}
          {videoCallActive && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> Video active
              </span>
              <button onClick={onVideoEnd} className="p-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all">
                <VideoOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {videoIncoming && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 animate-pulse flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> Incoming video call...
              </span>
              <button onClick={onVideoAccept} className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">Accept</button>
              <button onClick={onVideoDecline} className="px-2 py-0.5 rounded text-xs bg-rose-500/20 border border-rose-500/30 text-rose-400">Decline</button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-white/30">You've been matched with {peerUsername}. Say hello!</p>
            </div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.sender === "self" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
                  msg.sender === "self"
                    ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/20 text-white"
                    : "bg-white/5 border border-white/10 text-white/80"
                )}
              >
                <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                <p className="text-[10px] text-white/20 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}

          {peerTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-sm text-white/50">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {blockWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                {blockWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-rose-300">{w}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <Button size="sm" icon={<Send className="w-4 h-4" />} onClick={handleSend} disabled={!inputText.trim()}>
              Send
            </Button>
          </div>
        </div>
      </GlassCard>

      {showTimerWarning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <GlassCard className="!p-4 max-w-xs border-amber-500/30">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white mb-1">Still doing okay?</p>
                <p className="text-xs text-white/50 mb-3">You've been in session for 45 minutes. Take a break anytime.</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowTimerWarning(false)}>
                    I'm fine, continue
                  </Button>
                  <Button size="sm" variant="glass" onClick={onEndSession}>
                    End session
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {showConfirmEnd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowConfirmEnd(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <GlassCard className="max-w-sm w-full">
              <h3 className="text-lg font-semibold text-white mb-2">End this conversation?</h3>
              <p className="text-sm text-white/50 mb-4">No explanation needed. You'll return to the start. You can always come back and start a new session.</p>
              <div className="flex gap-2">
                <Button variant="glass" className="flex-1" onClick={() => setShowConfirmEnd(false)}>
                  Stay
                </Button>
                <Button variant="danger" className="flex-1" onClick={onEndSession}>
                  End session
                </Button>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {showReportDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowReportDialog(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <GlassCard className="max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/30 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Report this session?</h3>
                  <p className="text-sm text-white/50">Reporting flags this conversation for review. Your identity stays anonymous.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="glass" className="flex-1" onClick={() => setShowReportDialog(false)}>
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => { onReport(); setShowReportDialog(false); onEndSession(); }}>
                  Report & end
                </Button>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      <CrisisPopup open={showCrisisPopup} onClose={() => setShowCrisisPopup(false)} />
    </>
  )
}

// Exposed for parent to call imperatively
export type ChatRoomHandle = {
  addPeerMessage: (text: string, timestamp: number) => void
  setPeerTyping: (typing: boolean) => void
}
