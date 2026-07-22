"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import {
  Bot, Send, Heart, Brain, Sparkles,
  MessageCircle, Headphones, BookOpen,
  Target, GraduationCap, Lightbulb, User,
  ChevronRight, Mic, StopCircle, Volume2,
  Activity, Wind
} from "lucide-react"

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
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: "user", content: input }])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const modeObj = modes.find((m) => m.id === activeMode)
      const responses: Record<string, string> = {
        listener: "I hear you. It sounds like you're going through something real. Take a deep breath with me. You're not alone in this. What specifically has been weighing on your mind?",
        coach: "Great question! Let's break this down into actionable steps. First, identify one small thing you can do right now. Progress starts with a single step. What's the smallest action you can take?",
        motivation: "Remember why you started. You have strength you haven't even discovered yet. Every day is a new opportunity to become the best version of yourself. You've got this!",
        cbt: "Let's apply some CBT techniques. Can you identify the automatic thought that came up? What evidence supports it, and what evidence challenges it? Let's work through this together.",
        meditation: "Let's take a moment to breathe together. Find a comfortable position. Breathe in slowly through your nose for 4 counts, hold for 4, and exhale for 6. Feel the calm spreading through your body.",
        productivity: "Let's optimize your workflow. Have you tried time-blocking? Set aside specific periods for focused work. Break tasks into 25-minute Pomodoro sessions. What's your biggest productivity challenge?",
        student: "As your student mentor, I understand the academic pressure. Let's create a study plan that works for you. What subject are you focusing on, and when is your next deadline?",
      }
      const response = responses[activeMode] || responses.listener
      setMessages((prev) => [...prev, { role: "assistant", content: response, emotion: "caring" }])
      setIsTyping(false)
    }, 1500)
  }

  const activeModeData = modes.find((m) => m.id === activeMode)
  const Icon = activeModeData?.icon || Bot

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">AI Companion</h1>
        <p className="text-white/50 mt-1">Your personal wellness assistant</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {modes.map((mode) => {
            const ModeIcon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 border ${
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-[600px] flex flex-col">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeModeData?.gradient} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
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
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/20"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <p className="text-sm text-white/90">{msg.content}</p>
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
                    onClick={() => { setInput(s); handleSend() }}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                />
                <Button onClick={handleSend} icon={<Send className="w-4 h-4" />}>
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
              {[
                { emotion: "Stress", level: 65, color: "from-rose-500 to-pink-500" },
                { emotion: "Anxiety", level: 40, color: "from-amber-500 to-orange-500" },
                { emotion: "Happiness", level: 75, color: "from-emerald-500 to-teal-500" },
                { emotion: "Energy", level: 55, color: "from-blue-500 to-cyan-500" },
              ].map((e) => (
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
