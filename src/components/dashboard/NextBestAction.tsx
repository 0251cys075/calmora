"use client"

import { useMemo } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  BookOpen, Smile, ChartNoAxesColumn, Bot, Sparkles, ArrowRight,
} from "lucide-react"
import Link from "next/link"

interface NextBestActionProps {
  journalEntries: { date: string }[]
  moodEntries: { date: string }[]
  habits: { name: string; logs: { date: string; completed: boolean }[] }[]
  streak: number
}

interface Suggestion {
  href: string
  label: string
  description: string
  icon: typeof BookOpen
  color: string
}

function getSuggestion(
  journalEntries: { date: string }[],
  moodEntries: { date: string }[],
  habits: { name: string; logs: { date: string; completed: boolean }[] }[],
  streak: number,
): Suggestion {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const nowTime = now.getTime()

  const lastJournal = journalEntries.length > 0
    ? new Date(journalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date).getTime()
    : 0
  const daysSinceJournal = Math.floor((nowTime - lastJournal) / 86400000)

  if (daysSinceJournal >= 2) {
    return {
      href: "/journal",
      label: "Write in your journal",
      description: `It's been ${daysSinceJournal} days since your last entry. Reflect on how you've been feeling.`,
      icon: BookOpen,
      color: "from-amber-500 to-orange-500",
    }
  }

  const moodToday = moodEntries.some((e) => {
    const ed = new Date(e.date)
    ed.setHours(0, 0, 0, 0)
    return ed.getTime() === nowTime
  })

  if (!moodToday) {
    return {
      href: "/habits",
      label: "Log your mood",
      description: "You haven't logged your mood today. A quick check-in helps track your patterns.",
      icon: Smile,
      color: "from-pink-500 to-rose-500",
    }
  }

  const habitsToday = habits.filter((h) =>
    (h.logs || []).some((l) => {
      const ld = new Date(l.date)
      ld.setHours(0, 0, 0, 0)
      return ld.getTime() === nowTime && l.completed
    })
  ).length

  if (habitsToday < habits.length && habits.length > 0) {
    const remaining = habits.length - habitsToday
    return {
      href: "/habits",
      label: `${remaining} habit${remaining > 1 ? "s" : ""} left today`,
      description: remaining === 1 ? "Complete your last habit to keep the streak alive." : `You have ${remaining} habits to complete. Stay on track!`,
      icon: ChartNoAxesColumn,
      color: "from-cyan-500 to-teal-500",
    }
  }

  if (streak > 0 && streak % 7 === 0) {
    return {
      href: "/challenges",
      label: `${streak}-day streak! Take on a challenge`,
      description: "You're in a great rhythm. A new challenge could keep the momentum going.",
      icon: Sparkles,
      color: "from-emerald-500 to-green-500",
    }
  }

  return {
    href: "/ai-companion",
    label: "Chat with your AI Companion",
    description: "You're all caught up! Talk things through or just say hi.",
    icon: Bot,
    color: "from-purple-500 to-indigo-500",
  }
}

export function NextBestAction({ journalEntries, moodEntries, habits, streak }: NextBestActionProps) {
  const suggestion = useMemo(
    () => getSuggestion(journalEntries, moodEntries, habits, streak),
    [journalEntries, moodEntries, habits, streak],
  )

  const Icon = suggestion.icon

  return (
    <motion.div variants={item}>
      <GlassCard glow>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Next Best Action</span>
            </div>
            <h3 className="text-base font-semibold text-white">{suggestion.label}</h3>
            <p className="text-sm text-white/50 mt-0.5">{suggestion.description}</p>
            <Link href={suggestion.href}>
              <Button variant="glass" size="sm" className="mt-3">
                Go
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
