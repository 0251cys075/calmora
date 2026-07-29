/**
 * @file StreakNudge.tsx
 * @description React component rendering a "Streak at Risk" warning card.
 * Triggers during late evening hours (>= 8 PM) if the user has an active streak
 * but has not logged all daily habits for today, encouraging immediate completion.
 */

"use client"

import { useMemo } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Flame, ArrowRight, Moon } from "lucide-react"
import Link from "next/link"

interface StreakNudgeProps {
  habits: { name: string; logs: { date: string; completed: boolean }[] }[]
  streak: number
}

/**
 * Returns true if the client current hour is 8 PM (20:00) or later.
 */
function isLateEvening(): boolean {
  const hour = new Date().getHours()
  return hour >= 20
}

export function StreakNudge({ habits, streak }: StreakNudgeProps) {
  // Evaluates show trigger parameters: late evening, active streak, incomplete habits
  const show = useMemo(() => {
    if (!isLateEvening()) return false
    if (streak <= 0) return false
    if (habits.length === 0) return false

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const nowTime = now.getTime()

    const allComplete = habits.every((h) =>
      (h.logs || []).some((l) => {
        const ld = new Date(l.date)
        ld.setHours(0, 0, 0, 0)
        return ld.getTime() === nowTime && l.completed
      })
    )

    return !allComplete
  }, [habits, streak])

  if (!show) return null

  // Filter out remaining habits that haven't been completed today
  const incomplete = habits.filter((h) =>
    !(h.logs || []).some((l) => {
      const ld = new Date(l.date)
      ld.setHours(0, 0, 0, 0)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      return ld.getTime() === now.getTime() && l.completed
    })
  )

  return (
    <motion.div
      variants={item}
      initial="hidden"
      animate="show"
    >
      <GlassCard glow>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Moon className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">Streak at Risk</span>
            </div>
            <p className="text-sm text-white font-medium">
              {streak > 0 ? `${streak}-day streak — don't break it now!` : "Keep your momentum going!"}
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              {incomplete.length === 1
                ? `1 habit left to complete before the day ends.`
                : `${incomplete.length} habits still need your attention tonight.`}
            </p>
            <Link href="/habits">
              <Button variant="glass" size="sm" className="mt-2">
                Complete Now
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Framer motion entry animation parameters
const item = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
}
