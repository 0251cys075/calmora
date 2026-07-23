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
  Wind, Smile, Sparkles
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

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

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth()
  const quote = getDailyQuote()
  const [moodEntries] = useLocalStorage<{ mood: number; note: string; date: string }[]>("calmora_mood_entries", [])
  const [habits] = useLocalStorage<{ name: string; logs: { date: string; completed: boolean }[] }[]>("calmora_habits", [])
  const [journalEntries] = useLocalStorage<{ _id: string; title: string; content: string; date: string }[]>("calmora_journal_entries", [])
  const [meditationMinutes] = useLocalStorage<number>("calmora_meditation_minutes", 0)
  const [challengeProgress] = useLocalStorage<number>("calmora_challenge_progress", 33)

  const last7Days = getLast7Days()
  const dayLabels = ["M","T","W","T","F","S","S"]

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
  const habitsToday = habits.filter((h) =>
    (h.logs || []).some((l) => {
      const ld = new Date(l.date)
      ld.setHours(0, 0, 0, 0)
      return ld.getTime() === todayTime && l.completed
    })
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse" />
          <p className="text-white/40 text-sm">Loading Calmora...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  const quickActions = [
    { href: "/ai-companion", label: "AI Chat", icon: Bot, color: "from-purple-500 to-indigo-500", desc: "Talk to your AI companion" },
    { href: "/journal", label: "Journal", icon: BookOpen, color: "from-amber-500 to-orange-500", desc: "Write your thoughts" },
    { href: "/habits", label: "Mood Check", icon: Smile, color: "from-pink-500 to-rose-500", desc: "Log your mood" },
    { href: "/habits", label: "Habits", icon: ChartNoAxesColumn, color: "from-cyan-500 to-teal-500", desc: "Track your habits" },
    { href: "/challenges", label: "21-Day Challenge", icon: Flower2, color: "from-emerald-500 to-green-500", desc: "Transform your life" },
    { href: "/relax", label: "Relax", icon: Wind, color: "from-blue-500 to-cyan-500", desc: "Breathe & meditate" },
  ]

  return (
    <>
      <ConfettiCelebration streak={user?.streak ?? 0} habits={habits} />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <MoodGreeting name={user?.name ?? "Friend"} moodEntries={moodEntries} />
          <div className="flex items-center gap-3 flex-shrink-0">
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

        <motion.div variants={item}>
          <GlassCard className="relative overflow-hidden" glow>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    <span className="text-white/60 text-sm">Daily Inspiration</span>
                  </div>
                  <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="text-white/40">— {quote.author}</p>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gradient">{user?.calmScore || 850}</span>
                  <span className="text-xs text-white/40">Calm Score</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-white mb-3">Quick Access Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <GlassCard className="text-center p-4 h-full hover:border-white/20 transition-all">
                    <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{action.desc}</p>
                  </GlassCard>
                </Link>
              )
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Weekly Progress</h2>
                <WeeklyInsight moodEntries={moodEntries} />
              </div>
              <div className="flex items-end justify-between h-40 gap-2">
                {weeklyData.map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                      className="w-full rounded-lg bg-gradient-to-t from-blue-500/50 to-cyan-500/30 relative group cursor-pointer"
                      style={{ minHeight: 0 }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        {value}%
                      </div>
                    </motion.div>
                    <span className="text-xs text-white/40">{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard>
              <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Challenge</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Flower2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Morning Gratitude</p>
                    <p className="text-xs text-white/40">Write 3 things you&apos;re grateful for</p>
                  </div>
                </div>
                <Progress value={challengeProgress} size="sm" variant="gradient" />
                <Link href="/challenges">
                  <Button variant="glass" size="sm" className="w-full">
                    View Challenge
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Activity Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Mood Entries", value: `${moodEntries.length}`, change: `+${Math.min(moodEntries.length, 5)}`, icon: Smile, color: "text-amber-400" },
                { label: "Habits Done", value: `${habitsToday}/${habits.length || 6}`, change: `${habits.length > 0 ? Math.round((habitsToday / habits.length) * 100) : 0}%`, icon: Activity, color: "text-emerald-400" },
                { label: "Journal Pages", value: `${journalEntries.length}`, change: `+${Math.min(journalEntries.length, 3)}`, icon: BookOpen, color: "text-blue-400" },
                { label: "Meditation", value: `${meditationMinutes} min`, change: `+${Math.min(meditationMinutes, 30)}`, icon: Wind, color: "text-purple-400" },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-white/40">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-emerald-400">{stat.change}</p>
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
