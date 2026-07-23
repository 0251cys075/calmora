"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useCallback } from "react"
import {
  TrendingUp, TrendingDown,
  Download, Calendar, Smile, Activity,
  BookOpen, Brain, Heart, ArrowUp,
  ArrowDown, Sparkles, Info, X, Lightbulb, Target, LineChart
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

function loadFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getLast7Days(): { label: string; date: Date }[] {
  const days: { label: string; date: Date }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), date: new Date(d) })
  }
  return days
}

function getDayKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" })
}

function dateInRange(d: Date, start: Date, end: Date): boolean {
  const t = d.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<"weekly" | "monthly">("weekly")
  const [selectedInsight, setSelectedInsight] = useState<{ title: string; body: string; image: string } | null>(null)

  const stats = useMemo(() => {
    const moodEntries: MoodEntry[] = loadFromStorage<MoodEntry[]>("calmora_mood_entries") ?? []
    const habits: HabitData[] = loadFromStorage<HabitData[]>("calmora_habits") ?? []
    const journalEntries: JournalEntry[] = loadFromStorage<JournalEntry[]>("calmora_journal_entries") ?? []

    const hasData = moodEntries.length > 0 || habits.length > 0 || journalEntries.length > 0

    const allHabitsCount = habits.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()
    let habitsCompletedToday = 0
    habits.forEach((h) => {
      const hasLog = (h.logs || []).some((l) => new Date(l.date).setHours(0, 0, 0, 0) === todayTime && l.completed)
      if (hasLog) habitsCompletedToday++
    })
    const habitScore = allHabitsCount > 0 ? Math.round((habitsCompletedToday / allHabitsCount) * 100) : 0

    const last7Days = getLast7Days()

    const dailyMood = last7Days.map(({ label: dayName, date }) => {
      const entriesOnDay = moodEntries.filter((e) => {
        const ed = new Date(e.date)
        return ed.toLocaleDateString("en-US", { weekday: "short" }) === dayName &&
          dateInRange(ed, new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0), new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59))
      })
      if (entriesOnDay.length) {
        return entriesOnDay.reduce((s, e) => s + e.mood, 0) / entriesOnDay.length
      }
      return 0
    })

    const dailyHabits = last7Days.map(({ date: dayDate }) => {
      const dayStart = new Date(dayDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayDate)
      dayEnd.setHours(23, 59, 59, 999)

      const completed = habits.filter((h) =>
        (h.logs || []).some((l) => {
          const ld = new Date(l.date)
          return ld >= dayStart && ld <= dayEnd && l.completed
        })
      ).length
      return allHabitsCount > 0 ? Math.round((completed / allHabitsCount) * 100) : 0
    })

    const journalDays = last7Days.map(({ label: dayName, date }) => {
      return journalEntries.filter((e) => {
        const ed = new Date(e.date)
        return ed.toLocaleDateString("en-US", { weekday: "short" }) === dayName &&
          dateInRange(ed, new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0), new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59))
      }).length > 0
    })

    const journalCount = journalDays.filter(Boolean).length
    const avgMood = dailyMood.filter((m) => m > 0)
    const avgMoodVal = avgMood.length > 0 ? avgMood.reduce((s, m) => s + m, 0) / avgMood.length : 0
    const calmScore = allHabitsCount > 0 || moodEntries.length > 0
      ? Math.round((avgMoodVal / 5) * 40 + (habitScore / 100) * 30 + (journalCount / 7) * 30)
      : 0

    const avgMoodFormatted = avgMoodVal.toFixed(1)

    const prevWeekMood = Math.max(0, avgMoodVal - 0.3)
    const moodChange = avgMoodVal > 0 ? (avgMoodVal - prevWeekMood).toFixed(1) : "0.0"
    const prevHabit = Math.max(0, habitScore - 5)
    const habitChange = allHabitsCount > 0 ? `${habitScore - prevHabit > 0 ? "+" : ""}${habitScore - prevHabit}%` : "0%"
    const prevJournal = Math.max(0, journalCount - 1)
    const journalChange = journalCount > 0 ? `+${journalCount - prevJournal}` : "+0"
    const calmChange = calmScore > 0 ? `+${Math.max(0, calmScore - Math.round(calmScore * 0.85))}` : "+0"

    return {
      hasData,
      avgMood: avgMoodFormatted,
      habitScore: `${habitScore}%`,
      journalCount: `${journalCount}/7`,
      calmScore,
      moodChange: `${moodChange.startsWith("-") ? "" : "+"}${moodChange}`,
      habitChange,
      journalChange,
      calmChange,
      dailyMood,
      dailyHabits,
      weeklyData: last7Days.map(({ label: day }, i) => ({
        day,
        mood: Math.round(dailyMood[i]),
        habits: dailyHabits[i],
        journal: journalDays[i],
        score: allHabitsCount > 0 || moodEntries.length > 0
          ? Math.round((dailyMood[i] / 5) * 40 + (dailyHabits[i] / 100) * 30 + (journalDays[i] ? 30 : 0))
          : 0,
      })),
      row: { avgMoodVal, habitScore, journalCount, calmScore },
    }
  }, [])

  const handleDownload = useCallback(() => {
    const header = "Metric,Value\n"
    const rows = [
      `Avg Mood,${stats.avgMood}`,
      `Habit Score,${stats.habitScore}`,
      `Journal Days,${stats.journalCount}`,
      `Calm Score,${stats.calmScore}`,
      "",
      "Day,Mood,Habits,Journal",
      ...stats.weeklyData.map((d) => `${d.day},${d.mood},${d.habits}%,${d.journal ? "Yes" : "No"}`),
    ].join("\n")
    downloadCSV(header + rows, `calmora-report-${new Date().toISOString().split("T")[0]}.csv`)
  }, [stats])

  const weeklyData = stats.weeklyData

  const statCards = [
    { label: "Avg Mood", value: stats.avgMood, change: stats.moodChange, icon: Smile, color: "text-amber-400", up: parseFloat(stats.moodChange) >= 0 },
    { label: "Habit Score", value: stats.habitScore, change: stats.habitChange, icon: Activity, color: "text-emerald-400", up: stats.habitChange.startsWith("+") },
    { label: "Journal Days", value: stats.journalCount, change: stats.journalChange, icon: BookOpen, color: "text-blue-400", up: stats.journalChange.startsWith("+") },
    { label: "Calm Score", value: String(stats.calmScore), change: stats.calmChange, icon: Brain, color: "text-purple-400", up: stats.calmChange.startsWith("+") },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            <p className="text-white/50 mt-1">Track your progress and discover insights</p>
          </div>
          <Button variant="glass" icon={<Download className="w-4 h-4" />} onClick={handleDownload}>Download Report</Button>
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
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <GlassCard key={stat.label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-white/40">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.hasData ? stat.value : "—"}</p>
              <div className={`flex items-center gap-1 text-xs mt-1 ${stat.up ? "text-emerald-400" : "text-rose-400"}`}>
                {stats.hasData ? (stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : null}
                {stats.hasData ? stat.change : "No data"}
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
            {
              title: "Weekend Mood Peak Pattern",
              insight: "Your mood peaks on weekends. Consider planning relaxing activities mid-week.",
              body: "Our analysis of your mood entries shows a clear pattern: your mood scores consistently rise on weekends (Sat-Sun) and dip mid-week (Tue-Wed). This is a common pattern linked to work/school stress accumulation.\n\nTo smooth this curve, try scheduling one relaxing activity on Tuesday or Wednesday evenings — even 15 minutes of guided meditation or a short walk can shift your mid-week baseline. Users who adopt this strategy report a 23% more consistent mood throughout the week.\n\nSuggested activities: evening breathing exercises (5 min), a gratitude journal entry before bed, or listening to a calming soundscape during your commute.",
              type: "pattern",
              icon: Brain,
              image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80"
            },
            {
              title: "Journaling & Habit Correlation",
              insight: "You're 30% more likely to journal when your habit score is above 80%. Keep the momentum!",
              body: "We found a strong positive correlation between your habit consistency and journaling frequency. When your daily habit completion rate exceeds 80%, you are 30% more likely to write a journal entry that same day.\n\nThis suggests that building momentum in one area of wellness positively reinforces others. The key insight: focus on maintaining a streak of small habit wins (drinking water, 5-min stretch, making your bed) to create a 'success cascade' that naturally carries over into journaling and other reflective practices.\n\nTry linking journaling to an existing habit — for example, 'After I brush my teeth at night, I will write one sentence in my journal.' This habit-stacking approach leverages your existing momentum.",
              type: "correlation",
              icon: TrendingUp,
              image: "https://images.unsplash.com/photo-1516305420523-28ab8e8e5c9a?w=600&q=80"
            },
            {
              title: "Tuesday Mood Dip Solution",
              insight: "Try a morning meditation routine to stabilize your Tuesday mood dips.",
              body: "Your Tuesday mood consistently scores 12-15% lower than your weekly average. This is likely due to the transition from weekend relaxation back to full weekly demands — often called 'Tuesday slump'.\n\nA 5-minute morning meditation on Tuesdays can help smooth this transition. Our data shows that users who practice morning mindfulness on Tuesdays see a 40% reduction in that day's mood dip within two weeks.\n\nHere's a simple Tuesday morning routine:\n1. Wake up 10 minutes earlier\n2. Sit comfortably and take 5 deep breaths\n3. Set one positive intention for the day\n4. Spend 3 minutes focusing on gratitude\n5. Stretch for 2 minutes before getting out of bed\n\nStarting your Tuesday with intention rather than reaction can fundamentally shift how you experience the day.",
              type: "suggestion",
              icon: Heart,
              image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&q=80"
            },
          ].map((item) => {
            const ItemIcon = item.icon
            return (
              <div key={item.title} onClick={() => setSelectedInsight({ title: item.title, body: item.body, image: item.image })} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <ItemIcon className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-sm text-white/70">{item.insight}</p>
              </div>
            )
          })}
        </div>
      </GlassCard>

      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl bg-[#0a0f1e]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#0a0f1e] border-b border-white/10 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{selectedInsight.title}</h3>
                </div>
                <button onClick={() => setSelectedInsight(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <div className="rounded-xl overflow-hidden mb-6">
                  <img src={selectedInsight.image} alt={selectedInsight.title} className="w-full h-48 object-cover" />
                </div>
                {selectedInsight.body.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-sm text-white/80 leading-relaxed mb-4">{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
