"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import {
  ChartNoAxesColumn, Check, Plus, Flame,
  Smile, Meh, Frown, Angry, Sun,
  Activity, Brain, Heart, Coffee, BookOpen,
  Dumbbell, Zap, TrendingUp, AlertCircle
} from "lucide-react"
import { habitsApi, moodsApi, withFallback, isOnline, type HabitData } from "@/lib/api"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

const moods = [
  { value: 5, icon: <Smile className="w-6 h-6" />, label: "Great", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" },
  { value: 4, icon: <Sun className="w-6 h-6" />, label: "Good", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  { value: 3, icon: <Meh className="w-6 h-6" />, label: "Okay", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" },
  { value: 2, icon: <Frown className="w-6 h-6" />, label: "Low", color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30" },
  { value: 1, icon: <Angry className="w-6 h-6" />, label: "Poor", color: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/30" },
]

const defaultHabits = [
  { id: "default_1", name: "Morning Meditation", icon: Brain, color: "text-purple-400", completed: false, streak: 0, time: "7:00 AM", logs: [] },
  { id: "default_2", name: "Drink 8 Glasses Water", icon: Coffee, color: "text-blue-400", completed: false, streak: 0, time: "All day", logs: [] },
  { id: "default_3", name: "Read 20 Pages", icon: BookOpen, color: "text-amber-400", completed: false, streak: 0, time: "9:00 PM", logs: [] },
  { id: "default_4", name: "Exercise", icon: Dumbbell, color: "text-emerald-400", completed: false, streak: 0, time: "6:00 PM", logs: [] },
  { id: "default_5", name: "Gratitude Journal", icon: Heart, color: "text-rose-400", completed: false, streak: 0, time: "10:00 PM", logs: [] },
  { id: "default_6", name: "No Phone Morning", icon: Zap, color: "text-cyan-400", completed: false, streak: 0, time: "8:00 AM", logs: [] },
]

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const currentDay = new Date().getDay()

export default function HabitsPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [habitsList, setHabitsList] = useLocalStorage<HabitData[]>("calmora_habits", [])
  const [habitNote, setHabitNote] = useState("")
  const [weeklyMood, setWeeklyMood] = useLocalStorage<number[]>("calmora_weekly_mood", [3, 4, 2, 5, 4, 3, 3])
  const [savingMood, setSavingMood] = useState(false)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    if (!isOnline()) {
      setOffline(true)
      setLoading(false)
      return
    }
    Promise.all([
      withFallback(() => habitsApi.list(), { habits: [] }),
      withFallback(() => moodsApi.weekly(), { weekly: [] }),
    ]).then(([habitsRes, weeklyRes]) => {
      if (habitsRes.habits.length) setHabitsList(habitsRes.habits)
      if (weeklyRes.weekly.length) {
        setWeeklyMood(weeklyRes.weekly.map((d) => d.value ?? 3))
      }
      setOffline(false)
    }).catch(() => setOffline(true)).finally(() => setLoading(false))
  }, [])

  const displayHabits = habitsList.length > 0
    ? habitsList.map((h) => {
        const dh = defaultHabits.find((d) => d.name === h.name)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayLog = h.logs?.find((l) => new Date(l.date).setHours(0, 0, 0, 0) === today.getTime())
        return {
          id: h._id || h.name,
          name: h.name,
          icon: dh?.icon || Activity,
          color: dh?.color || "text-blue-400",
          completed: todayLog?.completed ?? false,
          streak: h.streak || 0,
          time: dh?.time || "",
          logs: h.logs || [],
        }
      })
    : defaultHabits

  const toggleHabit = useCallback(async (id: string) => {
    setHabitsList((prev) =>
      prev.map((h) => {
        const habitId = h._id || h.name
        if (habitId !== id) return h
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const existingLog = (h.logs || []).find(
          (l) => new Date(l.date).setHours(0, 0, 0, 0) === today.getTime()
        )
        const newCompleted = !(existingLog?.completed ?? false)
        const newLogs = existingLog
          ? (h.logs || []).map((l) =>
              new Date(l.date).setHours(0, 0, 0, 0) === today.getTime()
                ? { ...l, completed: newCompleted }
                : l
            )
          : [...(h.logs || []), { date: today.toISOString(), completed: true }]

        return {
          ...h,
          logs: newLogs,
          streak: newCompleted ? (h.streak || 0) + 1 : 0,
        }
      })
    )

    if (!isOnline()) return
    try {
      await habitsApi.toggle(id)
    } catch {
      // silently fail
    }
  }, [])

  const handleMoodSubmit = async () => {
    if (!selectedMood) return
    setSavingMood(true)

    setWeeklyMood((prev) => {
      const next = [...prev]
      next[next.length - 1] = selectedMood
      return next
    })

    if (!isOnline()) {
      setSavingMood(false)
      return
    }

    try {
      await moodsApi.create({ mood: selectedMood, note: habitNote })
    } catch {
      // silently fail
    }
    setSavingMood(false)
  }

  const completedCount = displayHabits.filter((h) => h.completed).length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Habits & Mood</h1>
            <p className="text-white/50 mt-1">Track your daily habits and emotional wellbeing</p>
          </div>
          {offline && (
            <Badge variant="warning" size="sm">
              <AlertCircle className="w-3 h-3" /> Offline
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Today's Habits</h2>
              <Badge variant="success">
                <Check className="w-3 h-3" /> {completedCount}/{displayHabits.length}
              </Badge>
            </div>
            <Progress value={(completedCount / displayHabits.length) * 100} variant="success" showLabel label="Daily Progress" className="mb-4" />
            <div className="space-y-2">
              {displayHabits.map((habit) => {
                const Icon = habit.icon
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      habit.completed
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      habit.completed
                        ? "bg-emerald-500/20 border-emerald-500/30"
                        : "bg-white/10 border-white/20"
                    }`}>
                      {habit.completed ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Icon className={`w-4 h-4 ${habit.color}`} />
                      )}
                    </div>
                    <span className={`flex-1 text-sm ${habit.completed ? "text-white/50 line-through" : "text-white"}`}>
                      {habit.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                          <Flame className="w-3 h-3" />
                          {habit.streak}
                        </div>
                      )}
                      <span className="text-xs text-white/30">{habit.time}</span>
                    </div>
                  </div>
                )
              })}
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
            <h2 className="text-lg font-semibold text-white mb-4">Mood Check</h2>
            <p className="text-sm text-white/50 mb-3">How are you feeling right now?</p>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    selectedMood === mood.value ? mood.bg : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className={selectedMood === mood.value ? mood.color : "text-white/40"}>
                    {mood.icon}
                  </span>
                  <span className={`text-xs ${selectedMood === mood.value ? "text-white" : "text-white/40"}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={habitNote}
                onChange={(e) => setHabitNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
              />
              <Button size="sm" onClick={handleMoodSubmit} loading={savingMood} disabled={!selectedMood}>
                Log
              </Button>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">Weekly Streak</h3>
            <div className="flex gap-1 justify-between">
              {days.map((day, i) => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    i === currentDay
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                      : i < currentDay
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-white/30"
                  }`}
                >
                  {day[0]}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">This Week's Mood</h3>
            <div className="flex gap-1 justify-between items-end h-16">
              {weeklyMood.slice(0, 7).map((m, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-md bg-gradient-to-t from-blue-500/50 to-cyan-500/30"
                  style={{ height: `${(m / 5) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {["M","T","W","T","F","S","S"].map((d) => (
                <span key={d} className="text-[10px] text-white/30">{d}</span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Overview</h2>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const moodVal = [null, null, null, 4, 5, 3, 4, 2, 5, 4, 3, 4, 5, 3, 4, 2, 3, 5, 4, 3, 4, 5, 3, 4, 2, 4, 5, 3, 4, null][i]
              const isToday = i === 15
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs transition-all ${
                    isToday ? "ring-2 ring-blue-500/50" : ""
                  } ${
                    moodVal === null
                      ? "bg-white/5"
                      : moodVal >= 4
                      ? "bg-emerald-500/40"
                      : moodVal >= 3
                      ? "bg-blue-500/30"
                      : moodVal >= 2
                      ? "bg-amber-500/30"
                      : "bg-rose-500/30"
                  }`}
                >
                  {i + 1}
                </div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
