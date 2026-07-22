"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  BookOpen, Sparkles, Heart, Target,
  Sun, Moon, Send, Brain, Lightbulb,
  Download, Clock, Quote
} from "lucide-react"

const prompts = [
  "What are three things you're grateful for today?",
  "Describe a moment that brought you peace today.",
  "What challenged you today, and how did you grow from it?",
  "If you could tell your future self one thing, what would it be?",
  "What emotion dominated your day, and why?",
]

const entries = [
  { date: "Today", title: "Finding Peace in the Morning", mood: "😊", preview: "Woke up early today and decided to watch the sunrise..." },
  { date: "Yesterday", title: "Overcoming Anxiety", mood: "🙂", preview: "Had a stressful meeting but used breathing techniques..." },
  { date: "2 days ago", title: "Gratitude Practice", mood: "😊", preview: "Started my gratitude journal and felt immediately..." },
]

export default function JournalPage() {
  const [activePrompt, setActivePrompt] = useState(0)
  const [journalEntry, setJournalEntry] = useState("")
  const [showPrompts, setShowPrompts] = useState(true)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Journal</h1>
            <p className="text-white/50 mt-1">Write, reflect, and grow with AI-powered guidance</p>
          </div>
          <Badge variant="info" size="md">
            <Sparkles className="w-3.5 h-3.5" />
            3 day streak
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Entry</h2>
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Lightbulb className="w-3 h-3" />
                {showPrompts ? "Hide prompts" : "Show prompts"}
              </button>
            </div>

            {showPrompts && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/70">AI Prompt Suggestion</span>
                </div>
                <p className="text-white/90 text-sm italic">&ldquo;{prompts[activePrompt]}&rdquo;</p>
                <div className="flex gap-2 mt-2">
                  {prompts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePrompt(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activePrompt ? "bg-blue-400 w-4" : "bg-white/20"
                      }`}
                    />
                  ))}
                  <button
                    onClick={() => setActivePrompt((prev) => (prev + 1) % prompts.length)}
                    className="ml-auto text-xs text-blue-400 hover:text-blue-300"
                  >
                    Next prompt →
                  </button>
                </div>
              </div>
            )}

            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full h-48 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Button variant="glass" size="sm" icon={<Heart className="w-4 h-4" />}>Gratitude</Button>
                <Button variant="glass" size="sm" icon={<Target className="w-4 h-4" />}>Goals</Button>
              </div>
              <Button icon={<Send className="w-4 h-4" />}>Save Entry</Button>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-3">AI Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400 mb-1">Emotional Analysis</p>
                <p className="text-sm text-white/80">Positive tone with hints of anxiety. Consider a breathing exercise.</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 mb-1">Wellness Suggestion</p>
                <p className="text-sm text-white/80">Try a 5-minute gratitude meditation tonight.</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-400 mb-1">Tomorrow's Goal</p>
                <p className="text-sm text-white/80">Set aside 15 minutes for mindful walking.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-3">Recent Entries</h2>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.title}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/40">{entry.date}</span>
                    <span>{entry.mood}</span>
                  </div>
                  <p className="text-sm font-medium text-white">{entry.title}</p>
                  <p className="text-xs text-white/50 mt-1 line-clamp-1">{entry.preview}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">This Week's Summary</h3>
            <div className="space-y-2 text-sm text-white/60">
              <p>• 5 entries written</p>
              <p>• Average mood: 😊 Good</p>
              <p>• Top topic: Gratitude</p>
              <p>• Gratitude mentions: 12</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
