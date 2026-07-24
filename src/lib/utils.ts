/**
 * @file utils.ts
 * @description General utility functions for string manipulation, formatting, and calculations.
 * Primarily supports styling (Tailwind classes), date parsing, and gamification helper systems.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines CSS class names dynamically and resolves Tailwind CSS class conflicts.
 * @param inputs - Array of class values or conditional class objects
 * @returns Concatenated and merged class names as a single string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a Date object into a readable short date string.
 * @param date - The Date object to format
 * @returns Formatted date string (e.g., "Jan 1, 2026")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/**
 * Retrieves the full weekday name for a given Date.
 * @param date - The Date object
 * @returns The weekday name (e.g., "Monday")
 */
export function getDayName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)
}

/**
 * Calculates the number of days in a specific month of a year.
 * @param year - The year (e.g., 2026)
 * @param month - The month index (0-11, where 0 is January)
 * @returns Total number of days in that month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Returns Tailwind gradient classes based on the user's current habit streak.
 * @param streak - The current habit streak count
 * @returns String containing Tailwind CSS gradient classes
 */
export function getStreakColor(streak: number): string {
  if (streak >= 21) return "from-amber-400 to-orange-500"
  if (streak >= 7) return "from-emerald-400 to-teal-500"
  if (streak >= 3) return "from-blue-400 to-cyan-500"
  return "from-slate-300 to-slate-400"
}

/**
 * Calculates level progress based on XP, where every 100 XP levels up.
 * @param xp - Total Experience Points (XP)
 * @returns Object containing the current level, current XP within this level, and target XP
 */
export function getLevel(xp: number): { level: number; currentXp: number; nextXp: number } {
  const level = Math.floor(xp / 100) + 1
  const currentXp = xp % 100
  const nextXp = 100
  return { level, currentXp, nextXp }
}

/**
 * Returns the CSS text color class representing different Calm Score thresholds.
 * @param score - Calm Score integer (typically 0-100)
 * @returns Tailwind CSS text color class string
 */
export function getCalmScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-blue-400"
  if (score >= 40) return "text-amber-400"
  return "text-rose-400"
}

/**
 * Maps a numeric mood score (1-5) to a corresponding mood emoji.
 * @param mood - Numeric mood value
 * @returns Emoji string representation
 */
export function getMoodEmoji(mood: number): string {
  if (mood >= 4.5) return "😊"
  if (mood >= 3.5) return "🙂"
  if (mood >= 2.5) return "😐"
  if (mood >= 1.5) return "😔"
  return "😢"
}

/**
 * Maps a numeric mood score (1-5) to a text description/label.
 * @param mood - Numeric mood value
 * @returns Mood description string
 */
export function getMoodLabel(mood: number): string {
  if (mood >= 4.5) return "Excellent"
  if (mood >= 3.5) return "Good"
  if (mood >= 2.5) return "Okay"
  if (mood >= 1.5) return "Low"
  return "Poor"
}
