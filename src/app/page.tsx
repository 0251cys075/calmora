/**
 * @file page.tsx
 * @description Primary landing page / dashboard page of Calmora.
 * If the user is unauthenticated, displays the promo landing screen.
 * Otherwise, queries local storage and auth details to construct user metrics,
 * daily relaxation nudges, weekly mood histograms, quick links, and challenge cards.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { getDailyQuote } from "@/lib/data/quotes"
import {
  Bot, BookOpen, ChartNoAxesColumn, Flower2,
  Activity, Brain, Heart, Trophy, ArrowRight,
  Wind, Smile, Sparkles, TrendingUp, TrendingDown, Minus,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { LandingPage } from "@/components/landing/LandingPage"
import { MoodGreeting } from "@/components/dashboard/MoodGreeting"
import { NextBestAction } from "@/components/dashboard/NextBestAction"
import { WeeklyInsight } from "@/components/dashboard/WeeklyInsight"
import { StreakNudge } from "@/components/dashboard/StreakNudge"
import { ConfettiCelebration } from "@/components/dashboard/ConfettiCelebration"
import { MoodCheck } from "@/components/dashboard/MoodCheck"
import { WellnessRings } from "@/components/dashboard/WellnessRings"

// Framer motion list container animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

// Framer motion list item animation variants
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

/**
 * Returns a list of Date boundaries representing the last 7 calendar days.
 */
function getLast7Days(): Date[] {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push(d)
  }
  return days
}

/** Clamps a value between min and max */
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth()
  const quote = getDailyQuote()

  // Custom LocalStorage hooks loading statistics
  const [moodEntries] = useLocalStorage<{ mood: number; note: string; date: string }[]>("calmora_mood_entries", [])
  const [habits] = useLocalStorage<{ name: string; logs: { date: string; completed: boolean }[] }[]>("calmora_habits", [])
  const [journalEntries] = useLocalStorage<{ _id: string; title: string; content: string; date: string }[]>("calmora_journal_entries", [])
  const [meditationMinutes] = useLocalStorage<number>("calmora_meditation_minutes", 0)
  const [challengeProgress] = useLocalStorage<number>("calmora_challenge_progress", 33)

  const last7Days = getLast7Days()
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]

  // Map weekly mood average points to percentage values for rendering the progress histogram bars
  const weeklyData = last7Days.map((day) => {
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)
    const dayEntries = moodEntries.filter((e) => {
      const ed = new Date(e.date)
      return ed >= dayStart && ed <= dayEnd
    })
    if (dayEntries.length === 0) return 0
    const avg = dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length
    return Math.round((avg / 5) * 100)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // Count how many habits have been logged completed today
  const habitsToday = habits.filter((h) =>
    (h.logs || []).some((l) => {
      const ld = new Date(l.date)
      ld.setHours(0, 0, 0, 0)
      return ld.getTime() === todayTime && l.completed
    })
  ).length

  // Wellness ring percentages
  const moodLoggedToday = moodEntries.some(e => {
    const ed = new Date(e.date); ed.setHours(0, 0, 0, 0); return ed.getTime() === todayTime
  })
  const moodPct = moodLoggedToday ? 100 : 0
  const habitsPct = clamp(habits.length > 0 ? Math.round((habitsToday / habits.length) * 100) : 0, 0, 100)
  const journalPct = clamp(journalEntries.length > 0 ? Math.min(journalEntries.length * 20, 100) : 0, 0, 100)
  const meditationPct = clamp(Math.min(meditationMinutes * 5, 100), 0, 100)

  // Weekly trend: compare this week average to last 3-day average
  const thisWeekAvg = weeklyData.filter(v => v > 0).reduce((s, v) => s + v, 0) / Math.max(weeklyData.filter(v => v > 0).length, 1)
  const last3Avg = weeklyData.slice(-3).filter(v => v > 0).reduce((s, v) => s + v, 0) / Math.max(weeklyData.slice(-3).filter(v => v > 0).length, 1)
  const trendUp = last3Avg >= thisWeekAvg
  const trendDown = last3Avg < thisWeekAvg - 5

  // Loading indicator overlay
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse" />
            <div className="absolute inset-1 rounded-xl bg-[#0a0f1e] flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="text-white/40 text-sm">Loading Calmora...</p>
        </div>
      </div>
    )
  }

  // Marketing page overlay when guest sessions are unauthenticated
  if (!isAuthenticated) {
    return <LandingPage />
  }

  const quickActions = [
    { href: "/ai-companion", label: "AI Chat",       icon: Bot,              color: "from-purple-500 to-indigo-500",  desc: "Talk to your AI companion" },
    { href: "/journal",      label: "Journal",       icon: BookOpen,         color: "from-amber-500 to-orange-500",   desc: "Write your thoughts" },
    { href: "/habits",       label: "Mood Check",    icon: Smile,            color: "from-pink-500 to-rose-500",      desc: "Log your mood" },
    { href: "/habits",       label: "Habits",        icon: ChartNoAxesColumn,color: "from-cyan-500 to-teal-500",      desc: "Track your habits" },
    { href: "/challenges",   label: "21-Day",        icon: Flower2,          color: "from-emerald-500 to-green-500",  desc: "Transform your life" },
    { href: "/relax",        label: "Relax",         icon: Wind,             color: "from-blue-500 to-cyan-500",      desc: "Breathe & meditate" },
  ]

  const statCards = [
    {
      label: "Mood Entries",
      value: `${moodEntries.length}`,
      change: `+${Math.min(moodEntries.length, 5)} total`,
      positive: true,
      icon: Smile,
      color: "text-amber-400",
      gradFrom: "from-amber-500/10",
      gradTo: "to-orange-500/5",
      border: "border-amber-500/20",
    },
    {
      label: "Habits Done",
      value: `${habitsToday}/${habits.length || 6}`,
      change: `${habits.length > 0 ? Math.round((habitsToday / habits.length) * 100) : 0}% today`,
      positive: habitsToday >= Math.ceil(habits.length / 2),
      icon: Activity,
      color: "text-emerald-400",
      gradFrom: "from-emerald-500/10",
      gradTo: "to-teal-500/5",
      border: "border-emerald-500/20",
    },
    {
      label: "Journal Pages",
      value: `${journalEntries.length}`,
      change: `+${Math.min(journalEntries.length, 3)} entries`,
      positive: true,
      icon: BookOpen,
      color: "text-blue-400",
      gradFrom: "from-blue-500/10",
      gradTo: "to-indigo-500/5",
      border: "border-blue-500/20",
    },
    {
      label: "Meditation",
      value: `${meditationMinutes} min`,
      change: `+${Math.min(meditationMinutes, 30)} this week`,
      positive: meditationMinutes > 0,
      icon: Wind,
      color: "text-purple-400",
      gradFrom: "from-purple-500/10",
      gradTo: "to-pink-500/5",
      border: "border-purple-500/20",
    },
  ]

  return (
    <>
      <ConfettiCelebration streak={user?.streak ?? 0} habits={habits} />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
        {/* ── Top AppBar with Stitch Styling ── */}
        <motion.div variants={item} className="flex items-center justify-between p-4 rounded-2xl glass-strong border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-full bg-[#10141a] flex items-center justify-center overflow-hidden">
                <Smile className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#00e5ff] tracking-tight">Calmora</h1>
              <p className="text-xs text-white/50">Welcome back, {user?.name || "Alex"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shadow-inner">
              <span className="text-sm font-bold text-cyan-400">{user?.streak || 7} 🔥</span>
            </div>
          </div>
        </motion.div>

        {/* ── Stitch Daily Inspiration Card ── */}
        <motion.div variants={item}>
          <div className="glass-strong rounded-2xl p-6 relative overflow-hidden group border border-white/10 shadow-2xl">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#00e5ff]/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#a855f7]/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest block">
                Daily Inspiration
              </span>
              <p className="text-2xl font-bold text-white font-heading italic leading-snug">
                &ldquo;{quote.text || "The only way out is through."}&rdquo;
              </p>
              <p className="text-xs text-white/40 font-mono pt-1">— {quote.author || "Robert Frost"}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Stitch Activity Overview (3-Stat Grid) ── */}
        <motion.div variants={item}>
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl glass-strong border border-white/10">
            <div className="flex flex-col items-center justify-center p-3 text-center border-r border-white/10">
              <span className="text-2xl font-extrabold text-[#00e5ff] font-heading">{meditationMinutes || 12}m</span>
              <span className="text-xs text-white/50 font-medium">Meditated</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 text-center border-r border-white/10">
              <span className="text-2xl font-extrabold text-[#00e5ff] font-heading">{journalEntries.length || 3}</span>
              <span className="text-xs text-white/50 font-medium">Entries</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <span className="text-2xl font-extrabold text-[#00e5ff] font-heading">2</span>
              <span className="text-xs text-white/50 font-medium">Challenges</span>
            </div>
          </div>
        </motion.div>

        {/* ── Today's Challenge: Mindful Breathing ── */}
        <motion.div variants={item}>
          <GlassCard className="relative overflow-hidden p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Wind className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white font-heading">Today&apos;s Challenge</h3>
                  <p className="text-xs text-white/50">Practice Mindful Breathing</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00e5ff]">{challengeProgress || 40}%</span>
            </div>

            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
              <motion.div
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${challengeProgress || 40}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            <Link href="/relax">
              <Button className="w-full btn-stitch-ai text-sm py-2.5">
                Start Session
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </GlassCard>
        </motion.div>

        {/* ── Stitch Quick Access (6 Grid Items) ── */}
        <motion.div variants={item}>
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3 px-1">Quick Access</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={`${action.href}-${action.label}`} href={action.href}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-2xl glass-strong border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-400/40 transition-all shadow-md">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">{action.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* ── Weekly Mood Trends Chart ── */}
        <motion.div variants={item}>
          <GlassCard className="p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-heading">Weekly Mood Trends</h3>
                <p className="text-xs text-white/40">Last 7 days histogram</p>
              </div>
              <WeeklyInsight moodEntries={moodEntries} />
            </div>

            <div className="flex items-end justify-between h-36 gap-2 pt-4">
              {weeklyData.map((value, i) => {
                const isToday = i === 6
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: value > 0 ? `${value}%` : "15%" }}
                        transition={{ duration: 0.8, delay: i * 0.08 }}
                        className={`w-full rounded-t-lg ${
                          isToday ? "bg-gradient-to-t from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30" : "bg-white/10"
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${isToday ? "text-[#00e5ff] font-bold" : "text-white/40"}`}>
                      {dayLabels[i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </>
  )
}
