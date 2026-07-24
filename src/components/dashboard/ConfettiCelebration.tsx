/**
 * @file ConfettiCelebration.tsx
 * @description React component rendering a confetti particle animation when streak milestones are achieved.
 * Monitors login streak boundaries (e.g. multiples of 7) to trigger dynamic celebration overlays.
 */

"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiCelebrationProps {
  streak: number
  habits: { name: string; logs: { date: string; completed: boolean }[] }[]
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

// Assorted vibrant colors for particles
const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#f97316"]

/**
 * Checks if a milestone (multiple of 7 days) was completed in this transition.
 */
function checkMilestoneTriggered(prevStreak: number, currentStreak: number): boolean {
  if (prevStreak === currentStreak) return false
  return currentStreak > 0 && currentStreak % 7 === 0
}

export function ConfettiCelebration({ streak: currentStreak, habits }: ConfettiCelebrationProps) {
  const [show, setShow] = useState(false)
  const [prevStreak, setPrevStreak] = useState(currentStreak)

  // Trigger effect when currentStreak updates to detect milestone triggers
  useEffect(() => {
    if (checkMilestoneTriggered(prevStreak, currentStreak)) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
    setPrevStreak(currentStreak)
  }, [currentStreak, prevStreak])

  // Compute randomised floating particles parameters
  const particles = useMemo(() => {
    if (!show) return []
    const items: Particle[] = []
    for (let i = 0; i < 40; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
      })
    }
    return items
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                rotate: p.rotation,
              }}
              animate={{
                y: [0, 30, 60, 90, 120],
                opacity: [1, 1, 0.8, 0.4, 0],
                scale: [1, 0.8, 1.2, 0.6, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
