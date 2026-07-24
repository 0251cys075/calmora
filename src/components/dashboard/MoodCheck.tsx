"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Smile, Frown, AlertCircle, Feather, Angry, Zap, Heart, Moon, Meh, CloudRain, Send, CheckCircle2, Camera } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { useToast } from "@/components/providers/ToastProvider"
import { CameraMoodDetector } from "@/components/mood/CameraMoodDetector"
import { format } from "date-fns"

interface MoodOption {
  id: string
  label: string
  emoji: string
  icon: typeof Smile
  color: string
}

const moods: MoodOption[] = [
  { id: "happy", label: "Happy", emoji: "😊", icon: Smile, color: "from-emerald-400/30 to-emerald-500/20 border-emerald-400/30" },
  { id: "sad", label: "Sad", emoji: "😢", icon: Frown, color: "from-blue-400/30 to-blue-500/20 border-blue-400/30" },
  { id: "anxious", label: "Anxious", emoji: "😰", icon: AlertCircle, color: "from-purple-400/30 to-purple-500/20 border-purple-400/30" },
  { id: "calm", label: "Calm", emoji: "😌", icon: Feather, color: "from-teal-400/30 to-teal-500/20 border-teal-400/30" },
  { id: "angry", label: "Angry", emoji: "😠", icon: Angry, color: "from-rose-400/30 to-rose-500/20 border-rose-400/30" },
  { id: "stressed", label: "Stressed", emoji: "😫", icon: CloudRain, color: "from-amber-400/30 to-amber-500/20 border-amber-400/30" },
  { id: "excited", label: "Excited", emoji: "🎉", icon: Zap, color: "from-orange-400/30 to-orange-500/20 border-orange-400/30" },
  { id: "tired", label: "Tired", emoji: "😴", icon: Moon, color: "from-indigo-400/30 to-indigo-500/20 border-indigo-400/30" },
  { id: "neutral", label: "Neutral", emoji: "😐", icon: Meh, color: "from-slate-400/30 to-slate-500/20 border-slate-400/30" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😩", icon: Heart, color: "from-pink-400/30 to-pink-500/20 border-pink-400/30" },
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
  const [cameraEnabled] = useLocalStorage("calmora_camera_mood_enabled", true)
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
      <GlassCard glow>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Daily Mood Check</h2>
            <p className="text-sm text-white/50">Today's check-in</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-300">Logged</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <span className="text-3xl">{moodEmojis[todayEntry.mood] || "😊"}</span>
          <div>
            <p className="text-white font-medium capitalize">{todayEntry.mood}</p>
            {todayEntry.note && <p className="text-sm text-white/50 mt-0.5">{todayEntry.note}</p>}
          </div>
        </div>

        <MoodHistory weekHistory={weekHistory} />
      </GlassCard>
    )
  }

  return (
    <GlassCard glow>
      <div className="mb-4">
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
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(mood.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                isSelected
                  ? `bg-gradient-to-br ${mood.color}`
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className={cn("text-[10px] font-medium", isSelected ? "text-white" : "text-white/50")}>
                {mood.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {cameraEnabled && (
        <div className="mb-3">
          <CameraMoodDetector
            onMoodDetected={(moodId) => setSelectedMood(moodId)}
          />
        </div>
      )}

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50"
          />
          <Button onClick={handleSave} icon={<Send className="w-4 h-4" />} loading={saving} className="w-full">
            Save Mood
          </Button>
        </motion.div>
      )}

      <MoodHistory weekHistory={weekHistory} />
    </GlassCard>
  )
}

function MoodHistory({ weekHistory }: { weekHistory: { date: string; mood: string | null }[] }) {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-xs text-white/40 mb-3">Last 7 days</p>
      <div className="flex items-end justify-between gap-2">
        {weekHistory.map((day, i) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="relative group">
              <div
                className={cn(
                  "w-full rounded-md transition-all",
                  day.mood ? moodColors[day.mood] || "bg-white/20" : "bg-white/5",
                  day.mood ? "min-h-[24px]" : "h-4"
                )}
                style={{
                  height: day.mood ? `${Math.max(24, Math.random() * 40 + 24)}px` : "16px",
                }}
              />
              {day.mood && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {moodEmojis[day.mood] || "😐"}
                </div>
              )}
            </div>
            <span className="text-[10px] text-white/30">{dayLabels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
