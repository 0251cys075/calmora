"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useState, useMemo } from "react"
import {
  FileText, TrendingUp, TrendingDown,
  Download, Calendar, Smile, Activity,
  BookOpen, Brain, Heart, ArrowUp,
  ArrowDown, Sparkles
} from "lucide-react"

interface MoodEntry {
  mood: number
  note: string
  date: string
}

interface JournalEntry {
  _id: string
  title: string
  content: string
  mood?: number
  tags?: string[]
  date: string
}

interface HabitData {
  _id?: string
  name: string
  logs: { date: string; completed: boolean }[]
  streak?: number
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toLocaleDateString("en-US", { weekday: "short" }))
  }
  return days
}

function getDayKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" })
}

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<"weekly" | "monthly">("weekly")

  const stats = useMemo(() => {
    const moodEntries: MoodEntry[] = loadFromStorage("calmora_mood_entries", [])
    const habits: HabitData[] = loadFromStorage("calmora_habits", [])
    const journalEntries: JournalEntry[] = loadFromStorage("calmora_journal_entries", [])
    const weeklyMood: number[] = loadFromStorage("calmora_weekly_mood", [3, 4, 2, 5, 4, 3, 3])

    const avgMood = moodEntries.length
      ? moodEntries.reduce((s, e) => s + e.mood, 0) / moodEntries.length
      : weeklyMood.reduce((s, m) => s + m, 0) / weeklyMood.length

    const totalHabits = habits.length || 6
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()
    let habitsCompletedToday = 0
    habits.forEach((h) => {
      const hasLog = (h.logs || []).some((l) => new Date(l.date).setHours(0, 0, 0, 0) === todayTime && l.completed)
      if (hasLog) habitsCompletedToday++
    })
    const habitScore = totalHabits ? Math.round((habitsCompletedToday / totalHabits) * 100) : 80

    const last7Days = getLast7Days()

    const dailyMood = last7Days.map((dayName) => {
      const entriesOnDay = moodEntries.filter((e) => getDayKey(e.date) === dayName)
      if (entriesOnDay.length) {
        return entriesOnDay.reduce((s, e) => s + e.mood, 0) / entriesOnDay.length
      }
      const weeklyIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(dayName)
      return weeklyMood[weeklyIndex] || 3
    })

    const dailyHabits = last7Days.map((dayName, di) => {
      const dayDate = new Date()
      dayDate.setDate(dayDate.getDate() - (6 - di))
      const dayStart = new Date(dayDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const completed = habits.filter((h) =>
        (h.logs || []).some((l) => {
          const ld = new Date(l.date)
          return ld >= dayStart && ld <= dayEnd && l.completed
        })
      ).length
      return totalHabits ? Math.round((completed / totalHabits) * 100) : 80
    })

    const journalDays = last7Days.map((dayName) => {
      return journalEntries.filter((e) => getDayKey(e.date) === dayName).length > 0
    })

    const journalCount = journalDays.filter(Boolean).length
    const calmScore = Math.round((avgMood / 5) * 40 + (habitScore / 100) * 30 + (journalCount / 7) * 30)

    const avgMoodFormatted = avgMood.toFixed(1)

    return {
      avgMood: avgMoodFormatted,
      habitScore: `${habitScore}%`,
      journalCount: `${journalCount}/7`,
      calmScore,
      dailyMood,
      dailyHabits,
      weeklyData: last7Days.map((day, i) => ({
        day,
        mood: Math.round(dailyMood[i]),
        habits: dailyHabits[i],
        journal: journalDays[i],
        score: Math.round((dailyMood[i] / 5) * 40 + (dailyHabits[i] / 100) * 30 + (journalDays[i] ? 30 : 0)),
      })),
    }
  }, [])

  const weeklyData = stats.weeklyData

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            <p className="text-white/50 mt-1">Track your progress and discover insights</p>
          </div>
          <Button variant="glass" icon={<Download className="w-4 h-4" />}>Download Report</Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2"
      >
        <button
          onClick={() => setActivePeriod("weekly")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            activePeriod === "weekly"
              ? "bg-white/10 text-white border-white/20"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Weekly
        </button>
        <button
          onClick={() => setActivePeriod("monthly")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            activePeriod === "monthly"
              ? "bg-white/10 text-white border-white/20"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Monthly
        </button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Mood", value: stats.avgMood, change: "+0.5", icon: Smile, color: "text-amber-400", up: true },
          { label: "Habit Score", value: stats.habitScore, change: "+12%", icon: Activity, color: "text-emerald-400", up: true },
          { label: "Journal Days", value: stats.journalCount, change: "+2", icon: BookOpen, color: "text-blue-400", up: true },
          { label: "Calm Score", value: String(stats.calmScore), change: "+8", icon: Brain, color: "text-purple-400", up: true },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <GlassCard key={stat.label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-white/40">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <div className={`flex items-center gap-1 text-xs mt-1 ${stat.up ? "text-emerald-400" : "text-rose-400"}`}>
                {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </GlassCard>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Mood Trend</h2>
          <div className="flex items-end justify-between h-32 gap-1">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.mood / 5) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className="w-full rounded-lg bg-gradient-to-t from-amber-500/50 to-orange-500/30"
                  style={{ minHeight: 0 }}
                />
                <span className="text-[10px] text-white/30">{d.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Habit Consistency</h2>
          <div className="flex items-end justify-between h-32 gap-1">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.habits}%` }}
                  transition={{ duration: 0.6 }}
                  className="w-full rounded-lg bg-gradient-to-t from-emerald-500/50 to-teal-500/30"
                  style={{ minHeight: 0 }}
                />
                <span className="text-[10px] text-white/30">{d.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard glow>
        <h2 className="text-lg font-semibold text-white mb-4">
          <Sparkles className="w-5 h-5 inline text-purple-400 mr-2" />
          AI Insights & Suggestions
        </h2>
        <div className="space-y-3">
          {[
            { insight: "Your mood peaks on weekends. Consider planning relaxing activities mid-week.", type: "pattern", icon: Brain },
            { insight: "You're 30% more likely to journal when your habit score is above 80%. Keep the momentum!", type: "correlation", icon: TrendingUp },
            { insight: "Try a morning meditation routine to stabilize your Tuesday mood dips.", type: "suggestion", icon: Heart },
          ].map((item) => {
            const ItemIcon = item.icon
            return (
              <div key={item.insight} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <ItemIcon className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-sm text-white/70">{item.insight}</p>
              </div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}
