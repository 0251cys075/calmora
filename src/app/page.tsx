"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { getDailyQuote } from "@/lib/data/quotes"
import {
  Bot, BookOpen, ChartNoAxesColumn, Flower2,
  TrendingUp, Zap, Activity, Brain, Heart, Trophy, ArrowRight,
  Wind, Smile
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { LandingPage } from "@/components/landing/LandingPage"

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

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth()
  const quote = getDailyQuote()

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

  // If user is NOT authenticated, display the Benefits Landing Page with Sign Up / Login CTAs!
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

  const weeklyData = [70, 85, 60, 90, 75, 95, 80]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {user?.name || "Friend"}!</h1>
          <p className="text-white/50 mt-1 text-sm sm:text-base">Here's your wellness overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="premium" size="md">
            <Trophy className="w-3.5 h-3.5" />
            Level {user?.level || 8}
          </Badge>
          <Badge variant="success" size="md">
            <Zap className="w-3.5 h-3.5" />
            5 day streak
          </Badge>
        </div>
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
              <div className="flex items-center gap-1 text-sm text-white/40">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">+12%</span> vs last week
              </div>
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
                  <span className="text-xs text-white/40">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Today's Challenge</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Flower2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Morning Gratitude</p>
                  <p className="text-xs text-white/40">Write 3 things you're grateful for</p>
                </div>
              </div>
              <Progress value={33} size="sm" variant="gradient" />
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
              { label: "Mood Entries", value: "12", change: "+3", icon: Smile, color: "text-amber-400" },
              { label: "Habits Done", value: "8/10", change: "80%", icon: Activity, color: "text-emerald-400" },
              { label: "Journal Pages", value: "6", change: "+2", icon: BookOpen, color: "text-blue-400" },
              { label: "Meditation", value: "45 min", change: "+15", icon: Wind, color: "text-purple-400" },
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
  )
}
