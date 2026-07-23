"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Brain, TrendingUp } from "lucide-react"

interface WeeklyInsightProps {
  moodEntries: { mood: number; date: string }[]
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" })
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

function generateInsight(moodEntries: { mood: number; date: string }[]): string {
  const last7 = getLast7Days()
  const dayMoodMap: Record<string, { total: number; count: number }> = {}
  const dayEntryCount: Record<string, number> = {}

  for (const day of last7) {
    const dayName = getDayName(day)
    const dayStart = day.getTime()
    const dayEnd = dayStart + 86399999

    const dayEntries = moodEntries.filter((e) => {
      const ed = new Date(e.date).getTime()
      return ed >= dayStart && ed <= dayEnd
    })

    if (dayEntries.length > 0) {
      if (!dayMoodMap[dayName]) {
        dayMoodMap[dayName] = { total: 0, count: 0 }
      }
      dayMoodMap[dayName].total += dayEntries.reduce((s, e) => s + e.mood, 0)
      dayMoodMap[dayName].count += dayEntries.length
      dayEntryCount[dayName] = (dayEntryCount[dayName] || 0) + dayEntries.length
    }
  }

  const daysWithData = Object.keys(dayMoodMap)
  if (daysWithData.length === 0) {
    return "Start logging your mood to receive weekly insights."
  }

  let bestDay = ""
  let bestAvg = 0
  let mostConsistentDay = ""
  let mostEntries = 0

  for (const day of daysWithData) {
    const avg = dayMoodMap[day].total / dayMoodMap[day].count
    if (avg > bestAvg) {
      bestAvg = avg
      bestDay = day
    }
    const count = dayEntryCount[day] || 0
    if (count > mostEntries) {
      mostEntries = count
      mostConsistentDay = day
    }
  }

  if (daysWithData.length >= 5) {
    return `You were most consistent on ${mostConsistentDay}s with your check-ins this week.`
  }

  if (bestDay) {
    return `Your mood tends to be highest on ${bestDay}s. Notice what makes those days different.`
  }

  return "Keep tracking daily to discover your personalized patterns."
}

export function WeeklyInsight({ moodEntries }: WeeklyInsightProps) {
  const insight = useMemo(() => generateInsight(moodEntries), [moodEntries])
  const hasData = moodEntries.length > 0

  return (
    <motion.div variants={item}>
      <div className="flex items-center gap-2 text-sm">
        {hasData ? (
          <>
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300">{insight}</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4 text-white/30" />
            <span className="text-white/30">{insight}</span>
          </>
        )}
      </div>
    </motion.div>
  )
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
