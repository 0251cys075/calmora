/**
 * @file WellnessRings.tsx
 * @description Animated SVG circular progress rings showing daily wellness goals.
 * Displays mood, habits, journal, and meditation completion as beautiful concentric rings.
 */

"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface RingProps {
  value: number   // 0-100
  color: string
  trackColor: string
  radius: number
  strokeWidth: number
  delay?: number
}

function Ring({ value, color, trackColor, radius, strokeWidth, delay = 0 }: RingProps) {
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (value / 100) * circumference

  return (
    <g>
      {/* Track */}
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <motion.circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1.4, delay, ease: "easeOut" }}
        style={{ transformOrigin: "90px 90px", transform: "rotate(-90deg)" }}
      />
    </g>
  )
}

interface WellnessRingsProps {
  moodPct: number
  habitsPct: number
  journalPct: number
  meditationPct: number
  calmScore: number
}

export function WellnessRings({
  moodPct,
  habitsPct,
  journalPct,
  meditationPct,
  calmScore,
}: WellnessRingsProps) {
  const rings = useMemo(() => [
    { value: moodPct,       color: "#f43f5e", trackColor: "rgba(244,63,94,0.12)",    radius: 74, strokeWidth: 8, delay: 0,    label: "Mood" },
    { value: habitsPct,     color: "#06b6d4", trackColor: "rgba(6,182,212,0.12)",    radius: 62, strokeWidth: 8, delay: 0.15, label: "Habits" },
    { value: journalPct,    color: "#f59e0b", trackColor: "rgba(245,158,11,0.12)",   radius: 50, strokeWidth: 8, delay: 0.3,  label: "Journal" },
    { value: meditationPct, color: "#8b5cf6", trackColor: "rgba(139,92,246,0.12)",   radius: 38, strokeWidth: 8, delay: 0.45, label: "Mindful" },
  ], [moodPct, habitsPct, journalPct, meditationPct])

  return (
    <div className="flex items-center gap-6">
      {/* SVG Rings */}
      <div className="relative flex-shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Subtle outer glow */}
          <defs>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#ring-glow)">
            {rings.map((ring) => (
              <Ring key={ring.label} {...ring} />
            ))}
          </g>
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-2xl font-bold text-white"
          >
            {calmScore}
          </motion.span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Score</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: ring.color, boxShadow: `0 0 6px ${ring.color}80` }}
            />
            <div className="flex items-center justify-between gap-4 flex-1">
              <span className="text-xs text-white/50">{ring.label}</span>
              <span className="text-xs font-semibold text-white">{ring.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
