"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useRef, useEffect, useMemo } from "react"
import {
  Bot, Send, Heart, Brain, Sparkles,
  MessageCircle, Headphones, BookOpen,
  Target, GraduationCap, Lightbulb, User,
  ChevronRight, Activity, Wind, AlertCircle
} from "lucide-react"
import { isOnline } from "@/lib/api"

const modes = [
  { id: "listener", label: "Listener", icon: Heart, color: "text-rose-400", gradient: "from-rose-500 to-pink-500" },
  { id: "coach", label: "Coach", icon: Target, color: "text-emerald-400", gradient: "from-emerald-500 to-teal-500" },
  { id: "motivation", label: "Motivation", icon: Sparkles, color: "text-amber-400", gradient: "from-amber-500 to-orange-500" },
  { id: "cbt", label: "CBT", icon: Brain, color: "text-purple-400", gradient: "from-purple-500 to-indigo-500" },
  { id: "meditation", label: "Meditation", icon: Headphones, color: "text-indigo-400", gradient: "from-indigo-500 to-violet-500" },
  { id: "productivity", label: "Productivity", icon: Activity, color: "text-cyan-400", gradient: "from-cyan-500 to-blue-500" },
  { id: "student", label: "Student Mentor", icon: GraduationCap, color: "text-sky-400", gradient: "from-sky-500 to-blue-500" },
]

interface Message {
  role: "user" | "assistant"
  content: string
  emotion?: string
}

const suggestions = [
  "I've been feeling stressed about work lately",
  "Help me practice mindfulness",
  "I need motivation to start my day",
  "How can I improve my sleep?",
  "I'm feeling anxious about an upcoming event",
]

export default function AICompanionPage() {
  const [activeMode, setActiveMode] = useState("listener")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI companion. How are you feeling today?", emotion: "warm" },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setInput("")
    setIsTyping(true)
    setError(null)

    if (!isOnline()) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "I notice you're offline. I'll respond with what I can. How are you feeling right now?",
          emotion: "caring",
        }])
        setIsTyping(false)
      }, 800)
      return
    }

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, mode: activeMode, history }),
      })
      if (!res.ok) throw new Error("API request failed")
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, emotion: "caring" }])
    } catch {
      const fallbacks: Record<string, string> = {
        listener: "I'm here to listen. Tell me more about what's on your mind.",
        coach: "Let's work on this together. What's one small step you can take today?",
        motivation: "You have strength you haven't discovered yet. Keep going!",
        cbt: "Let's try a thought-challenging exercise. What automatic thought came up?",
        meditation: "Take a deep breath with me. Breathe in... hold... and release slowly.",
        productivity: "Let's find a sustainable approach. Have you tried time-blocking?",
        student: "I understand the academic pressure. Let's create a manageable plan.",
      }
      const reply = fallbacks[activeMode] || fallbacks.listener
      setMessages((prev) => [...prev, { role: "assistant", content: reply, emotion: "caring" }])
      setError("Couldn't reach AI service. Used offline fallback.")
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeModeData = modes.find((m) => m.id === activeMode)
  const Icon = activeModeData?.icon || Bot

  const emotionLevels = useMemo(() => {
    const userText = messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase()).join(" ")
    const keywords = {
      Stress: ["stress", "stressed", "overwhelmed", "burnout", "exhausted", "pressure", "tense"],
      Anxiety: ["anxious", "anxiety", "worry", "worried", "nervous", "panic", "fear", "scared", "dread"],
      Happiness: ["happy", "glad", "joy", "grateful", "thankful", "wonderful", "great", "amazing", "blessed", "peace"],
      Energy: ["energy", "energetic", "tired", "fatigue", "sleepy", "drained", "motivated", "active", "sluggish"],
    }
    const counts: Record<string, number> = { Stress: 0, Anxiety: 0, Happiness: 0, Energy: 0 }
    let total = 0
    for (const [emotion, words] of Object.entries(keywords)) {
      words.forEach((w) => {
        const regex = new RegExp(`\\b${w}\\b`, "gi")
        const matches = userText.match(regex)
        if (matches) {
          counts[emotion] += matches.length
          total += matches.length
        }
      })
    }
    if (total === 0) {
      return [
        { emotion: "Stress", level: 30, color: "from-rose-500 to-pink-500" },
        { emotion: "Anxiety", level: 25, color: "from-amber-500 to-orange-500" },
        { emotion: "Happiness", level: 70, color: "from-emerald-500 to-teal-500" },
        { emotion: "Energy", level: 50, color: "from-blue-500 to-cyan-500" },
      ]
    }
    const maxCount = Math.max(...Object.values(counts), 1)
    const clamp = (v: number) => Math.max(5, Math.min(100, v))
    return [
      { emotion: "Stress", level: clamp(Math.round((counts.Stress / maxCount) * 85)), color: "from-rose-500 to-pink-500" },
      { emotion: "Anxiety", level: clamp(Math.round((counts.Anxiety / maxCount) * 80)), color: "from-amber-500 to-orange-500" },
      { emotion: "Happiness", level: clamp(Math.round((counts.Happiness / maxCount) * 85) + 10), color: "from-emerald-500 to-teal-500" },
      { emotion: "Energy", level: clamp(Math.round((counts.Energy / maxCount) * 80) + 5), color: "from-blue-500 to-cyan-500" },
    ]
  }, [messages])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">AI Companion</h1>
        <p className="text-white/50 mt-1">Your personal wellness assistant</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4">
          {modes.map((mode) => {
            const ModeIcon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 border flex-shrink-0 ${
                  activeMode === mode.id
                    ? `bg-gradient-to-r ${mode.gradient} text-white border-transparent shadow-lg`
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                }`}
              >
                <ModeIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-[600px] flex flex-col">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeModeData?.gradient} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white capitalize">{activeModeData?.label || "Listener"}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400/80">Online</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/20"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <p className="text-sm text-white/90 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput((prev) => prev ? prev + " " + s : s); textareaRef.current?.focus() }}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
                  style={{ minHeight: "42px", maxHeight: "120px" }}
                />
                <Button onClick={handleSend} icon={<Send className="w-4 h-4" />} disabled={!input.trim() || isTyping}>
                  Send
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Emotion Detection</h3>
            <div className="space-y-3">
              {emotionLevels.map((e) => (
                <div key={e.emotion}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">{e.emotion}</span>
                    <span className="text-white/80">{e.level}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${e.color}`}
                      style={{ width: `${e.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
            <div className="space-y-2">
              {[
                { text: "5 min breathing exercise", icon: Wind, color: "text-blue-400" },
                { text: "Gratitude journaling", icon: BookOpen, color: "text-amber-400" },
                { text: "Progressive relaxation", icon: Headphones, color: "text-purple-400" },
              ].map((rec, i) => {
                const RecIcon = rec.icon
                return (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-sm text-white/70 hover:bg-white/10 cursor-pointer transition-all">
                    <RecIcon className={`w-4 h-4 ${rec.color}`} />
                    <span>{rec.text}</span>
                    <ChevronRight className="w-3 h-3 ml-auto text-white/30" />
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
