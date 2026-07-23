"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface MoodGreetingProps {
  name: string
  moodEntries: { mood: number; date: string }[]
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getMoodMessage(mood: number | null): { emoji: string; subtitle: string } {
  if (mood === null) {
    return { emoji: "👋", subtitle: "Ready to check in with yourself today?" }
  }
  if (mood <= 2) {
    return { emoji: "💙", subtitle: "It's okay to have tough days. Take a moment for yourself." }
  }
  if (mood === 3) {
    return { emoji: "🌿", subtitle: "Steady as she goes. Small steps add up." }
  }
  if (mood === 4) {
    return { emoji: "✨", subtitle: "You're doing great! Keep that momentum going." }
  }
  return { emoji: "🌟", subtitle: "On top of the world! Cherish this energy." }
}

export function MoodGreeting({ name, moodEntries }: MoodGreetingProps) {
  const { emoji, subtitle } = useMemo(() => {
    const sorted = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestMood = sorted.length > 0 ? sorted[0].mood : null
    return getMoodMessage(latestMood)
  }, [moodEntries])

  const timeGreeting = getTimeBasedGreeting()

  return (
    <motion.div variants={item}>
      <h1 className="text-2xl sm:text-3xl font-bold text-white">
        {timeGreeting}, {name.split(" ")[0] || "Friend"} {emoji}
      </h1>
      <p className="text-white/50 mt-1 text-sm sm:text-base">{subtitle}</p>
    </motion.div>
  )
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
