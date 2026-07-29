"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smile, Frown, AlertCircle, Feather, Angry, Zap, Heart, Moon, Meh, CloudRain, Send, CheckCircle2 } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { useToast } from "@/components/providers/ToastProvider"
import { format } from "date-fns"

interface MoodOption {
  id: string
  label: string
  emoji: string
  icon: typeof Smile
  color: string
  glow: string
}

const moods: MoodOption[] = [
  { id: "happy",      label: "Happy",      emoji: "😊", icon: Smile,       color: "from-emerald-400/30 to-emerald-500/20 border-emerald-400/40", glow: "rgba(52,211,153,0.35)" },
  { id: "sad",        label: "Sad",        emoji: "😢", icon: Frown,       color: "from-blue-400/30 to-blue-500/20 border-blue-400/40",         glow: "rgba(96,165,250,0.35)" },
  { id: "anxious",    label: "Anxious",    emoji: "😰", icon: AlertCircle, color: "from-purple-400/30 to-purple-500/20 border-purple-400/40",   glow: "rgba(167,139,250,0.35)" },
  { id: "calm",       label: "Calm",       emoji: "😌", icon: Feather,     color: "from-teal-400/30 to-teal-500/20 border-teal-400/40",         glow: "rgba(45,212,191,0.35)" },
  { id: "angry",      label: "Angry",      emoji: "😠", icon: Angry,       color: "from-rose-400/30 to-rose-500/20 border-rose-400/40",         glow: "rgba(251,113,133,0.35)" },
  { id: "stressed",   label: "Stressed",   emoji: "😫", icon: CloudRain,   color: "from-amber-400/30 to-amber-500/20 border-amber-400/40",      glow: "rgba(251,191,36,0.35)" },
  { id: "excited",    label: "Excited",    emoji: "🎉", icon: Zap,         color: "from-orange-400/30 to-orange-500/20 border-orange-400/40",   glow: "rgba(251,146,60,0.35)" },
  { id: "tired",      label: "Tired",      emoji: "😴", icon: Moon,        color: "from-indigo-400/30 to-indigo-500/20 border-indigo-400/40",   glow: "rgba(129,140,248,0.35)" },
  { id: "neutral",    label: "Neutral",    emoji: "😐", icon: Meh,         color: "from-slate-400/30 to-slate-500/20 border-slate-400/40",      glow: "rgba(148,163,184,0.35)" },
  { id: "overwhelmed",label: "Overwhelmed",emoji: "😩", icon: Heart,       color: "from-pink-400/30 to-pink-500/20 border-pink-400/40",         glow: "rgba(244,114,182,0.35)" },
]

interface DailyMood {
  date: string
  mood: string
  note: string
}

function getTodayKey(): string {
  return format(new Date(), "yyyy-MM-dd")
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(format(d, "yyyy-MM-dd"))
  }
  return days
}

const moodColors: Record<string, string> = {
  happy: "bg-emerald-400",
  sad: "bg-blue-400",
  anxious: "bg-purple-400",
  calm: "bg-teal-400",
  angry: "bg-rose-400",
  stressed: "bg-amber-400",
  excited: "bg-orange-400",
  tired: "bg-indigo-400",
  neutral: "bg-slate-400",
  overwhelmed: "bg-pink-400",
}

const moodGlows: Record<string, string> = {
  happy: "rgba(52,211,153,0.5)",
  sad: "rgba(96,165,250,0.5)",
  anxious: "rgba(167,139,250,0.5)",
  calm: "rgba(45,212,191,0.5)",
  angry: "rgba(251,113,133,0.5)",
  stressed: "rgba(251,191,36,0.5)",
  excited: "rgba(251,146,60,0.5)",
  tired: "rgba(129,140,248,0.5)",
  neutral: "rgba(148,163,184,0.5)",
  overwhelmed: "rgba(244,114,182,0.5)",
}

const moodEmojis: Record<string, string> = {
  happy: "😊", sad: "😢", anxious: "😰", calm: "😌",
  angry: "😠", stressed: "😫", excited: "🎉", tired: "😴",
  neutral: "😐", overwhelmed: "😩",
}

export function MoodCheck() {
  const [entries, setEntries] = useLocalStorage<DailyMood[]>("calmora_daily_mood", [])
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const todayKey = getTodayKey()
  const todayEntry = useMemo(() => entries.find((e) => e.date === todayKey), [entries, todayKey])

  const weekHistory = useMemo(() => {
    const last7 = getLast7Days()
    return last7.map((day) => {
      const entry = entries.find((e) => e.date === day)
      return { date: day, mood: entry?.mood || null, note: entry?.note || "" }
    })
  }, [entries])

  const handleSave = () => {
    if (!selectedMood) return
    setSaving(true)

    const newEntry: DailyMood = {
      date: todayKey,
      mood: selectedMood,
      note: note.trim(),
    }

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== todayKey)
      return [...filtered, newEntry]
    })

    showToast("Mood logged for today!", "xp", 5)
    setSaving(false)
  }

  if (todayEntry) {
    return (
      <GlassCard glow className="relative overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none"
          style={{ background: `radial-gradient(circle at 70% 50%, ${moodGlows[todayEntry.mood] || "rgba(255,255,255,0.1)"}, transparent 60%)` }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Daily Mood Check</h2>
              <p className="text-sm text-white/50">Today&apos;s check-in</p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Logged</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-4xl"
            >
              {moodEmojis[todayEntry.mood] || "😊"}
            </motion.span>
            <div>
              <p className="text-white font-semibold capitalize text-lg">{todayEntry.mood}</p>
              {todayEntry.note && <p className="text-sm text-white/50 mt-0.5">&ldquo;{todayEntry.note}&rdquo;</p>}
            </div>
          </motion.div>

          <MoodHistory weekHistory={weekHistory} />
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard glow>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Daily Mood Check</h2>
        <p className="text-sm text-white/50">How are you feeling right now?</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.id
          return (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelectedMood(mood.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200",
                isSelected
                  ? `bg-gradient-to-br ${mood.color}`
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
              style={isSelected ? { boxShadow: `0 0 20px ${mood.glow}` } : {}}
            >
              <motion.span
                animate={isSelected ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="text-2xl"
              >
                {mood.emoji}
              </motion.span>
              <span className={cn("text-[10px] font-medium leading-tight", isSelected ? "text-white" : "text-white/50")}>
                {mood.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
            <Button onClick={handleSave} icon={<Send className="w-4 h-4" />} loading={saving} className="w-full">
              Save Mood
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <MoodHistory weekHistory={weekHistory} />
    </GlassCard>
  )
}

interface HistoryDay {
  date: string
  mood: string | null
}

function MoodHistory({ weekHistory }: { weekHistory: HistoryDay[] }) {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
  const today = format(new Date(), "yyyy-MM-dd")

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-xs text-white/40 mb-3">Last 7 days</p>
      <div className="flex items-end justify-between gap-1.5">
        {weekHistory.map((day, i) => {
          const isToday = day.date === today
          const barH = day.mood ? 28 + ((i * 7 + 13) % 28) : 16

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="relative group w-full">
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: barH, opacity: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
                  className={cn(
                    "w-full rounded-md transition-all",
                    day.mood ? (moodColors[day.mood] || "bg-white/20") + " opacity-70" : "bg-white/5",
                    isToday && day.mood && "ring-1 ring-white/30"
                  )}
                  style={day.mood ? { boxShadow: `0 2px 8px ${moodGlows[day.mood] || "transparent"}` } : {}}
                />
                {day.mood && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {moodEmojis[day.mood] || "😐"}
                  </div>
                )}
              </div>
              <span className={cn("text-[10px]", isToday ? "text-white/70 font-semibold" : "text-white/30")}>
                {dayLabels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
