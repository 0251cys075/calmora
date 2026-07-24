/**
 * @file page.tsx
 * @description React page component for the AI Journal log workspace.
 * Allows users to author daily logs with AI prompt suggestions, use quick templates
 * for gratitude or goal settings, view automated cognitive insights,
 * and review weekly statistics (mood averages, word frequencies).
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect, useMemo, useRef } from "react"
import {
  BookOpen, Sparkles, Heart, Target,
  Send, Brain, Lightbulb,
  Clock, AlertCircle
} from "lucide-react"
import { journalApi, withFallback, isOnline, type JournalEntry } from "@/lib/api"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { validateSchema, journalEntrySchema } from "@/lib/validation"
import { useToast } from "@/components/providers/ToastProvider"

// Prompts used for daily writing suggestions
const prompts = [
  "What are three things you're grateful for today?",
  "Describe a moment that brought you peace today.",
  "What challenged you today, and how did you grow from it?",
  "If you could tell your future self one thing, what would it be?",
  "What emotion dominated your day, and why?",
]

export default function JournalPage() {
  const { showToast } = useToast()
  const [activePrompt, setActivePrompt] = useState(0)
  const [journalEntry, setJournalEntry] = useState("")
  const [showPrompts, setShowPrompts] = useState(true)
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>("calmora_journal_entries", [])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const journalRef = useRef<HTMLTextAreaElement>(null)

  /**
   * Helper appending quick template text directly to the active text input box.
   */
  const insertTemplate = (template: string) => {
    setJournalEntry((prev) => {
      const sep = prev && !prev.endsWith("\n") ? "\n\n" : ""
      return prev + sep + template
    })
    setTimeout(() => journalRef.current?.focus(), 0)
  }

  // Load journal entries from the database when connected, else fall back to local storage
  useEffect(() => {
    if (!isOnline()) {
      setLoading(false)
      return
    }

    withFallback(() => journalApi.list(), { entries: [] })
      .then((res) => {
        if (res.entries.length) setEntries(res.entries)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /**
   * Memoized stats summarizing entries length, mood averages, word frequency counts,
   * and gratitude term counts.
   */
  const summary = useMemo(() => {
    const totalEntries = entries.length
    const moods = entries.filter((e) => e.mood).map((e) => e.mood!)
    const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : 0
    const gratitudeCount = entries.filter((e) => {
      const content = (e.title + " " + e.content).toLowerCase()
      return content.includes("grateful") || content.includes("gratitude") || content.includes("thank")
    }).length
    
    // Compute frequency counts on parsed words excluding common stop words
    const allWords = entries.flatMap((e) => (e.title + " " + e.content).toLowerCase().split(/\s+/))
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "was", "i", "my", "me", "we", "you", "it", "that", "this", "not", "have", "do", "be", "are", "am", "he", "she", "they", "so", "up", "out", "if", "just", "all", "now", "then", "can", "did", "get", "got", "has"])
    const wordFreq: Record<string, number> = {}
    allWords.forEach((w) => {
      if (w.length > 2 && !stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1
      }
    })
    const topTopic = Object.entries(wordFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"

    return { totalEntries, avgMood: Math.round(avgMood * 10) / 10, topTopic, gratitudeCount }
  }, [entries])

  /**
   * Validates journal entry inputs, saves record locally, awards XP,
   * and dispatches a background task syncing it to the server database.
   */
  const handleSave = () => {
    setValidationErrors({})
    setSaveError(null)

    const validation = validateSchema(journalEntrySchema, { content: journalEntry })
    if (!validation.success) {
      setValidationErrors(validation.errors)
      return
    }

    setSaving(true)
    const content = journalEntry.trim()
    const title = content.split("\n")[0].slice(0, 60) || "Untitled"

    const localEntry: JournalEntry = {
      _id: `local_${Date.now()}`,
      title,
      content,
      date: new Date().toISOString(),
    }
    
    // Optimistic local state update
    setEntries((prev) => [localEntry, ...prev])
    setJournalEntry("")
    setSaving(false)

    // Award XP and score increments
    const userData = JSON.parse(localStorage.getItem("calmora_user") || "{}")
    const oldLevel = userData.level || 8
    userData.xp = (userData.xp || 1200) + 10
    userData.calmScore = Math.min(1000, (userData.calmScore || 850) + 5)
    const nextLevelXp = (userData.level || 8) * 500
    if (userData.xp >= nextLevelXp) {
      userData.level = (userData.level || 8) + 1
    }
    localStorage.setItem("calmora_user", JSON.stringify(userData))

    if (userData.level > oldLevel) {
      showToast("🎉 Level Up!", "levelUp", userData.level * 100)
    } else {
      showToast("Journal saved", "xp", 10)
    }

    if (!isOnline()) return

    journalApi.create({ content, title })
      .then(({ entry }) => {
        setEntries((prev) => prev.map((e) => e._id === localEntry._id ? entry : e))
      })
      .catch(() => {
        setSaveError("Saved locally. Could not sync to server.")
      })
  }

  /**
   * Helper translating mood numeric scores into representative visual emojis.
   */
  const getMoodEmoji = (mood?: number) => {
    if (!mood) return ""
    if (mood >= 4) return "😊"
    if (mood >= 3) return "🙂"
    if (mood >= 2) return "😐"
    return "😔"
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Journal</h1>
            <p className="text-white/50 mt-1">Write, reflect, and grow with AI-powered guidance</p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline() && (
              <Badge variant="warning" size="sm">
                <AlertCircle className="w-3 h-3" /> Offline
              </Badge>
            )}
          </div>
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
              ref={journalRef}
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Start writing your thoughts..."
              className={`w-full h-48 p-4 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none resize-none text-sm ${
                validationErrors.content ? "border-rose-500/50 focus:border-rose-500/50" : "border-white/10 focus:border-blue-500/50"
              }`}
            />

            {validationErrors.content && (
              <p className="text-xs text-rose-400 mt-2">{validationErrors.content}</p>
            )}
            {saveError && (
              <p className="text-xs text-amber-400 mt-2">{saveError}</p>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Button variant="glass" size="sm" icon={<Heart className="w-4 h-4" />} onClick={() => insertTemplate("Today, I am grateful for: ")}>Gratitude</Button>
                <Button variant="glass" size="sm" icon={<Target className="w-4 h-4" />} onClick={() => insertTemplate("My main focus for today: ")}>Goals</Button>
              </div>
              <Button onClick={handleSave} icon={<Send className="w-4 h-4" />} loading={saving}>
                Save Entry
              </Button>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-3">AI Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 animate-pulse border border-white/10">
                    <div className="h-3 bg-white/10 rounded w-16 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-6">No entries yet. Start writing!</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                {entries.slice(0, 10).map((entry) => (
                  <div
                    key={entry._id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-xs text-white/40">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span>{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {(!entry.title || entry.title === entry.content || entry.content.length < 80) ? "Journal Entry" : entry.title}
                    </p>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">This Week's Summary</h3>
            <div className="space-y-2 text-sm text-white/60">
              <p>• {summary.totalEntries} entries written</p>
              <p>• Average mood: {summary.avgMood > 0 ? `${summary.avgMood}/5` : "N/A"}</p>
              <p>• Top topic: {summary.topTopic}</p>
              <p>• Gratitude mentions: {summary.gratitudeCount}</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
