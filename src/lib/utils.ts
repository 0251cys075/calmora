import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function getDayName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getStreakColor(streak: number): string {
  if (streak >= 21) return "from-amber-400 to-orange-500"
  if (streak >= 7) return "from-emerald-400 to-teal-500"
  if (streak >= 3) return "from-blue-400 to-cyan-500"
  return "from-slate-300 to-slate-400"
}

export function getLevel(xp: number): { level: number; currentXp: number; nextXp: number } {
  const level = Math.floor(xp / 100) + 1
  const currentXp = xp % 100
  const nextXp = 100
  return { level, currentXp, nextXp }
}

export function getCalmScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-blue-400"
  if (score >= 40) return "text-amber-400"
  return "text-rose-400"
}

export function getMoodEmoji(mood: number): string {
  if (mood >= 4.5) return "😊"
  if (mood >= 3.5) return "🙂"
  if (mood >= 2.5) return "😐"
  if (mood >= 1.5) return "😔"
  return "😢"
}

export function getMoodLabel(mood: number): string {
  if (mood >= 4.5) return "Excellent"
  if (mood >= 3.5) return "Good"
  if (mood >= 2.5) return "Okay"
  if (mood >= 1.5) return "Low"
  return "Poor"
}
