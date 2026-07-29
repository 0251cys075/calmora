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

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* ── Header row: greeting + badges ── */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <MoodGreeting name={user?.name ?? "Friend"} moodEntries={moodEntries} />
          <div className="flex items-center gap-3 flex-shrink-0 mt-1">
            <Badge variant="premium" size="md">
              <Trophy className="w-3.5 h-3.5" />
              Level {user?.level || 8}
            </Badge>
            <Badge variant="success" size="md">
              <Sparkles className="w-3.5 h-3.5" />
              {user?.streak || 0} day streak
            </Badge>
          </div>
        </motion.div>

        <StreakNudge habits={habits} streak={user?.streak ?? 0} />

        <motion.div variants={item}>
          <NextBestAction
            journalEntries={journalEntries}
            moodEntries={moodEntries}
            habits={habits}
            streak={user?.streak ?? 0}
          />
        </motion.div>

        {/* ── Hero card: Wellness Rings + Daily Quote ── */}
        <motion.div variants={item}>
          <GlassCard className="relative overflow-hidden p-6" glow>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-cyan-500/4 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-500/8 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Wellness rings */}
              <WellnessRings
                moodPct={moodPct}
                habitsPct={habitsPct}
                journalPct={journalPct}
                meditationPct={meditationPct}
                calmScore={user?.calmScore || 850}
              />

              {/* Divider */}
              <div className="hidden lg:block w-px h-32 bg-white/10 flex-shrink-0" />

              {/* Quote section */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-white/50 text-sm">Daily Inspiration</span>
                </div>
                <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-white/40 text-sm">— {quote.author}</p>

                {/* Calm score */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-white">{user?.calmScore || 850}</span>
                    <span className="text-xs text-white/40">Calm Score</span>
                  </div>
                  {moodEntries.length > 0 && (
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium ${
                      trendDown
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        : trendUp
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "bg-white/5 text-white/40 border border-white/10"
                    }`}>
                      {trendDown ? <TrendingDown className="w-3 h-3" /> : trendUp ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {trendDown ? "Mood dipping" : trendUp ? "Trending up" : "Steady"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Mood Check ── */}
        <motion.div variants={item}>
          <MoodCheck />
        </motion.div>

        {/* ── Quick Access ── */}
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-white mb-3">Quick Access</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={`${action.href}-${action.label}`} href={action.href}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-colors cursor-pointer h-full"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-white text-center leading-tight">{action.label}</p>
                    <p className="text-[10px] text-white/35 text-center leading-tight">{action.desc}</p>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* ── Weekly Progress + Today's Challenge ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Weekly Mood</h2>
                  <p className="text-xs text-white/40 mt-0.5">Last 7 days overview</p>
                </div>
                <WeeklyInsight moodEntries={moodEntries} />
              </div>
              <div className="flex items-end justify-between h-40 gap-2">
                {weeklyData.map((value, i) => {
                  const isToday = i === 6
                  const barColor = value > 70
                    ? "from-emerald-500/60 to-emerald-400/30"
                    : value > 40
                      ? "from-blue-500/60 to-cyan-500/30"
                      : value > 0
                        ? "from-amber-500/60 to-orange-400/30"
                        : "from-white/5 to-white/5"

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative group w-full flex flex-col justify-end" style={{ height: "100%" }}>
                        {value > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/40 px-1.5 py-0.5 rounded">
                            {value}%
                          </div>
                        )}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: value > 0 ? `${value}%` : "8px" }}
                          transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
                          className={`w-full rounded-lg bg-gradient-to-t ${barColor} relative ${isToday && value > 0 ? "ring-1 ring-white/30" : ""}`}
                          style={{ minHeight: value > 0 ? undefined : "8px" }}
                        >
                          {isToday && value > 0 && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80" />
                          )}
                        </motion.div>
                      </div>
                      <span className={`text-xs ${isToday ? "text-white/80 font-semibold" : "text-white/35"}`}>
                        {dayLabels[i]}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Scale reference */}
              <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] text-white/20">Low</span>
                <span className="text-[10px] text-white/20">Mood scale</span>
                <span className="text-[10px] text-white/20">High</span>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="h-full">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Flower2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Today&apos;s Challenge</h2>
                  <p className="text-xs text-white/40">Morning Gratitude</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  Write 3 things you&apos;re grateful for and set your intention for the day.
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Progress</span>
                    <span>{challengeProgress}%</span>
                  </div>
                  <Progress value={challengeProgress} size="sm" variant="gradient" />
                </div>

                <Link href="/challenges">
                  <Button variant="glass" size="sm" className="w-full mt-2">
                    View Challenge
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ── Activity Overview Stats ── */}
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-white mb-3">Activity Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradFrom} ${stat.gradTo} border ${stat.border} backdrop-blur-sm transition-all`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      stat.positive ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                    }`}>
                      {stat.positive ? "↑" : "↓"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                  <p className="text-xs text-white/40 leading-tight">{stat.label}</p>
                  <p className={`text-xs mt-1 font-medium ${stat.positive ? "text-emerald-400" : "text-rose-400"}`}>
                    {stat.change}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
