/**
 * @file MoodGreeting.tsx
 * @description React component rendering a contextual dashboard greeting header.
 * Adjusts welcome wording based on time of day (morning/afternoon/evening) and customizes
 * subtitles based on the user's latest logged daily mood value.
 */

"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"

interface MoodGreetingProps {
  name: string
  moodEntries: { mood: number; date: string }[]
}

/**
 * Returns dynamic greetings matching standard time windows.
 */
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

/**
 * Returns customized supportive subtitles and emojis aligned with mood scores.
 */
function getMoodMessage(mood: number | null): { emoji: string; subtitle: string; accent: string } {
  if (mood === null) {
    return { emoji: "👋", subtitle: "Ready to check in with yourself today?", accent: "from-blue-400 to-cyan-400" }
  }
  if (mood <= 2) {
    return { emoji: "💙", subtitle: "It's okay to have tough days. Take a moment for yourself.", accent: "from-blue-400 to-indigo-400" }
  }
  if (mood === 3) {
    return { emoji: "🌿", subtitle: "Steady as she goes. Small steps add up.", accent: "from-teal-400 to-cyan-400" }
  }
  if (mood === 4) {
    return { emoji: "✨", subtitle: "You're doing great! Keep that momentum going.", accent: "from-emerald-400 to-teal-400" }
  }
  return { emoji: "🌟", subtitle: "On top of the world! Cherish this energy.", accent: "from-amber-400 to-orange-400" }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

export function MoodGreeting({ name, moodEntries }: MoodGreetingProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Compute contextual messages based on the newest logged mood record
  const { emoji, subtitle, accent } = useMemo(() => {
    const sorted = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestMood = sorted.length > 0 ? sorted[0].mood : null
    return getMoodMessage(latestMood)
  }, [moodEntries])

  const timeGreeting = getTimeBasedGreeting()

  return (
    <motion.div variants={item} className="flex flex-col gap-1">
      {/* Live clock */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-1"
      >
        <span className={`text-xs font-semibold bg-gradient-to-r ${accent} bg-clip-text text-transparent uppercase tracking-widest`}>
          {formatTime(now)}
        </span>
        <span className="text-white/20 text-xs">·</span>
        <span className="text-xs text-white/30">{formatDate(now)}</span>
      </motion.div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white">
        {timeGreeting},{" "}
        <span className={`bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
          {name.split(" ")[0] || "Friend"}
        </span>{" "}
        <motion.span
          animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.2, 1.1, 1.2, 1] }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ display: "inline-block" }}
        >
          {emoji}
        </motion.span>
      </h1>
      <p className="text-white/50 mt-0.5 text-sm sm:text-base">{subtitle}</p>
    </motion.div>
  )
}

// Framer motion item transition variants
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
