"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, CheckCircle2, Send, ChevronLeft, ChevronRight, History, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { useToast } from "@/components/providers/ToastProvider"
import { HybridMoodQuiz } from "@/components/mood/HybridMoodQuiz"
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parse } from "date-fns"

interface DailyMood {
  date: string
  mood: string
  note: string
}

interface NumericMoodEntry {
  mood: number
  note: string
  date: string
}

const MOODS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "angry", label: "Angry", emoji: "😠" },
  { id: "stressed", label: "Stressed", emoji: "😫" },
  { id: "excited", label: "Excited", emoji: "🎉" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "neutral", label: "Neutral", emoji: "😐" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😩" },
]

const MOOD_TO_NUMERIC: Record<string, number> = {
  excited: 5,
  happy: 5,
  calm: 4,
  neutral: 3,
  anxious: 2,
  overwhelmed: 2,
  stressed: 2,
  sad: 2,
  tired: 2,
  angry: 1,
}

const moodEmojis: Record<string, string> = {
  happy: "😊", sad: "😢", anxious: "😰", calm: "😌",
  angry: "😠", stressed: "😫", excited: "🎉", tired: "😴",
  neutral: "😐", overwhelmed: "😩",
}

function getComparisonText(currentMood: string, yesterdayMood: string | null, weeklyAvg: number | null): string | null {
  if (!yesterdayMood && weeklyAvg === null) return null

  const currentVal = MOOD_TO_NUMERIC[currentMood] || 3

  if (yesterdayMood) {
    const yesterdayVal = MOOD_TO_NUMERIC[yesterdayMood] || 3
    if (currentVal > yesterdayVal) return "You're feeling better than yesterday ✨"
    if (currentVal < yesterdayVal) return "You're feeling lower than yesterday"
    return "Same mood as yesterday"
  }

  if (weeklyAvg !== null) {
    if (currentVal > weeklyAvg) return "Above your weekly average ✨"
    if (currentVal < weeklyAvg) return "Below your weekly average"
    return "Matches your weekly average"
  }

  return null
}

export default function MoodScannerPage() {
  const [entries, setEntries] = useLocalStorage<DailyMood[]>("calmora_daily_mood", [])
  const [numericEntries, setNumericEntries] = useLocalStorage<NumericMoodEntry[]>("calmora_mood_entries", [])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [showWeek, setShowWeek] = useState(true)
  const [justSaved, setJustSaved] = useState(false)
  const [moodDetected, setMoodDetected] = useState(false)
  const { showToast } = useToast()

  const dateKey = format(selectedDate, "yyyy-MM-dd")
  const todayKey = format(new Date(), "yyyy-MM-dd")
  const yesterdayKey = format(subDays(selectedDate, 1), "yyyy-MM-dd")

  const existingEntry = useMemo(
    () => entries.find((e) => e.date === dateKey),
    [entries, dateKey]
  )

  const yesterdayEntry = useMemo(
    () => entries.find((e) => e.date === yesterdayKey),
    [entries, yesterdayKey]
  )

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weekEntries = useMemo(() => {
    return weekDays.map((day) => {
      const key = format(day, "yyyy-MM-dd")
      const entry = entries.find((e) => e.date === key)
      return { date: key, day, mood: entry?.mood || null }
    })
  }, [entries, weekDays])

  const weeklyAverage = useMemo(() => {
    const vals = weekEntries
      .map((e) => (e.mood ? MOOD_TO_NUMERIC[e.mood] : null))
      .filter((v): v is number => v !== null)
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }, [weekEntries])

  const comparisonText = useMemo(() => {
    if (!justSaved || !selectedMood) return null
    return getComparisonText(selectedMood, yesterdayEntry?.mood || null, weeklyAverage)
  }, [justSaved, selectedMood, yesterdayEntry, weeklyAverage])

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedMood(null)
    setNote("")
    setJustSaved(false)
    setMoodDetected(false)
  }, [])

  const goToday = useCallback(() => handleDateChange(new Date()), [handleDateChange])

  const handleHybridComplete = useCallback((moodId: string) => {
    setSelectedMood(moodId)
    setMoodDetected(true)
  }, [])

  const handleSave = useCallback(() => {
    if (!selectedMood) return
    setSaving(true)

    const newEntry: DailyMood = {
      date: dateKey,
      mood: selectedMood,
      note: note.trim(),
    }

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== dateKey)
      return [...filtered, newEntry]
    })

    const numericValue = MOOD_TO_NUMERIC[selectedMood] || 3
    setNumericEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== dateKey)
      return [...filtered, { mood: numericValue, note: note.trim(), date: dateKey }]
    })

    showToast(
      dateKey === todayKey
        ? "Mood logged for today!"
        : `Mood logged for ${format(selectedDate, "MMM d")}!`,
      "xp",
      5
    )
    setJustSaved(true)
    setSaving(false)
  }, [selectedMood, dateKey, todayKey, note, setEntries, setNumericEntries, showToast])

  const handleOverrideMood = useCallback((moodId: string) => {
    setSelectedMood(moodId)
    setJustSaved(false)
  }, [])

  const canSave = selectedMood && !saving

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mood Scanner</h1>
            <p className="text-sm text-white/50">Hybrid assessment combining quiz + facial expression analysis</p>
          </div>
          <Button variant="glass" size="sm" onClick={goToday}>
            <CalendarDays className="w-4 h-4 mr-1" /> Today
          </Button>
        </div>
      </motion.div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard glow>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDateChange(subDays(selectedDate, 1))}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-white/60" />
                </button>
                <input
                  type="date"
                  value={dateKey}
                  onChange={(e) => {
                    const d = parse(e.target.value, "yyyy-MM-dd", new Date())
                    handleDateChange(d)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                />
                <button
                  onClick={() => handleDateChange(addDays(selectedDate, 1))}
                  disabled={dateKey === todayKey}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
              {existingEntry && !justSaved && (
                <span className="ml-auto text-xs text-emerald-400/80 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Logged: {moodEmojis[existingEntry.mood]} {existingEntry.mood}
                </span>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <HybridMoodQuiz onComplete={handleHybridComplete} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard>
            <h2 className="text-sm font-medium text-white/70 mb-3">
              Your mood for {format(selectedDate, "MMM d, yyyy")}
            </h2>

            {justSaved && selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{moodEmojis[selectedMood]}</span>
                  <div>
                    <p className="text-base font-semibold text-white capitalize">{selectedMood}</p>
                    {note && <p className="text-xs text-white/50">{note}</p>}
                  </div>
                </div>
                {comparisonText && (
                  <div className="flex items-center gap-1.5 text-xs text-white/60 border-t border-emerald-500/20 pt-2 mt-2">
                    {comparisonText.includes("better") || comparisonText.includes("Above") ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    ) : comparisonText.includes("lower") || comparisonText.includes("Below") ? (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-white/40" />
                    )}
                    <span>{comparisonText}</span>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id
                return (
                  <motion.button
                    key={mood.id}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOverrideMood(mood.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <span className={cn("text-[10px] font-medium", isSelected ? "text-emerald-300" : "text-white/50")}>
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
                  className="space-y-3 mt-4 overflow-hidden"
                >
                  {justSaved ? (
                    <div className="flex gap-2">
                      <Button variant="glass" size="sm" className="flex-1" onClick={() => setJustSaved(false)}>
                        Edit
                      </Button>
                      <Button variant="primary" size="sm" className="flex-1" icon={<CheckCircle2 className="w-4 h-4" />} disabled>
                        Saved
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note (optional)..."
                        maxLength={100}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                      />
                      <Button
                        onClick={handleSave}
                        icon={<Send className="w-4 h-4" />}
                        loading={saving}
                        disabled={!canSave}
                        className="w-full"
                      >
                        {existingEntry ? "Update Mood" : "Save Mood"}
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-white/50" />
                  This Week
                </h2>
                <button
                  onClick={() => setShowWeek(!showWeek)}
                  className="text-[10px] text-white/40 hover:text-white/60"
                >
                  {showWeek ? "Hide" : "Show"}
                </button>
              </div>

              <AnimatePresence>
                {showWeek && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    {weekEntries.map(({ date, day, mood }) => {
                      const isSelectedDate = date === dateKey
                      return (
                        <button
                          key={date}
                          onClick={() => handleDateChange(day)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                            isSelectedDate
                              ? "bg-blue-500/20 border border-blue-500/30"
                              : "bg-white/5 border border-white/5 hover:bg-white/10"
                          )}
                        >
                          <span className="text-xs text-white/40 w-8">{format(day, "EEE")}</span>
                          <span className={cn("text-xs font-medium flex-1", isSelectedDate ? "text-white" : "text-white/60")}>
                            {format(day, "MMM d")}
                          </span>
                          <span className="text-sm">{mood ? (moodEmojis[mood] || "😐") : "—"}</span>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard>
              <h2 className="text-sm font-medium text-white/70 mb-3">Quick Stats</h2>
              {(() => {
                const totalEntries = entries.length
                const weekCount = weekEntries.filter((e) => e.mood).length
                const latestMood = entries.length > 0 ? entries[entries.length - 1].mood : null
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Total entries</span>
                      <span className="text-white font-medium">{totalEntries}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">This week</span>
                      <span className="text-white font-medium">{weekCount}/7 days</span>
                    </div>
                    {weeklyAverage !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Weekly avg</span>
                        <span className="text-white font-medium">{weeklyAverage.toFixed(1)}/5</span>
                      </div>
                    )}
                    {latestMood && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Latest mood</span>
                        <span className="text-white font-medium">{moodEmojis[latestMood]} {latestMood}</span>
                      </div>
                    )}
                  </div>
                )
              })()}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
