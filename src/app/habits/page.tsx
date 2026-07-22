"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  ChartNoAxesColumn, Check, Plus, Flame,
  Smile, Meh, Frown, Angry, Sun, Moon,
  Activity, Brain, Heart, Coffee, BookOpen,
  Dumbbell, Zap, TrendingUp, Calendar
} from "lucide-react"

const moods = [
  { value: 5, icon: <Smile className="w-6 h-6" />, label: "Great", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" },
  { value: 4, icon: <Sun className="w-6 h-6" />, label: "Good", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  { value: 3, icon: <Meh className="w-6 h-6" />, label: "Okay", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" },
  { value: 2, icon: <Frown className="w-6 h-6" />, label: "Low", color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30" },
  { value: 1, icon: <Angry className="w-6 h-6" />, label: "Poor", color: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/30" },
]

const habits = [
  { id: 1, name: "Morning Meditation", icon: Brain, color: "text-purple-400", completed: true, streak: 12, time: "7:00 AM" },
  { id: 2, name: "Drink 8 Glasses Water", icon: Coffee, color: "text-blue-400", completed: true, streak: 30, time: "All day" },
  { id: 3, name: "Read 20 Pages", icon: BookOpen, color: "text-amber-400", completed: false, streak: 5, time: "9:00 PM" },
  { id: 4, name: "Exercise", icon: Dumbbell, color: "text-emerald-400", completed: true, streak: 8, time: "6:00 PM" },
  { id: 5, name: "Gratitude Journal", icon: Heart, color: "text-rose-400", completed: false, streak: 3, time: "10:00 PM" },
  { id: 6, name: "No Phone Morning", icon: Zap, color: "text-cyan-400", completed: true, streak: 7, time: "8:00 AM" },
]

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const currentDay = new Date().getDay()

export default function HabitsPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(4)
  const [habitsList, setHabitsList] = useState(habits)
  const [habitNote, setHabitNote] = useState("")

  const toggleHabit = (id: number) => {
    setHabitsList((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    )
  }

  const completedCount = habitsList.filter((h) => h.completed).length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Habits & Mood</h1>
        <p className="text-white/50 mt-1">Track your daily habits and emotional wellbeing</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Today's Habits</h2>
              <Badge variant="success">
                <Check className="w-3 h-3" /> {completedCount}/{habitsList.length}
              </Badge>
            </div>
            <Progress value={(completedCount / habitsList.length) * 100} variant="success" showLabel label="Daily Progress" className="mb-4" />
            <div className="space-y-2">
              {habitsList.map((habit) => {
                const Icon = habit.icon
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      habit.completed
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      habit.completed
                        ? "bg-emerald-500/20 border-emerald-500/30"
                        : "bg-white/10 border-white/20"
                    }`}>
                      {habit.completed ? (
                        <Check className={`w-4 h-4 ${habit.completed ? "text-emerald-400" : habit.color}`} />
                      ) : (
                        <Icon className={`w-4 h-4 ${habit.color}`} />
                      )}
                    </div>
                    <span className={`flex-1 text-sm ${habit.completed ? "text-white/50 line-through" : "text-white"}`}>
                      {habit.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                          <Flame className="w-3 h-3" />
                          {habit.streak}
                        </div>
                      )}
                      <span className="text-xs text-white/30">{habit.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Mood Check</h2>
            <p className="text-sm text-white/50 mb-3">How are you feeling right now?</p>
            <div className="flex gap-2 mb-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    selectedMood === mood.value ? mood.bg : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className={selectedMood === mood.value ? mood.color : "text-white/40"}>
                    {mood.icon}
                  </span>
                  <span className={`text-xs ${selectedMood === mood.value ? "text-white" : "text-white/40"}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={habitNote}
              onChange={(e) => setHabitNote(e.target.value)}
              placeholder="Add a note about your mood..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">Weekly Streak</h3>
            <div className="flex gap-1 justify-between">
              {days.map((day, i) => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    i === currentDay
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                      : i < currentDay
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-white/30"
                  }`}
                >
                  {day[0]}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">This Week's Mood</h3>
            <div className="flex gap-1 justify-between items-end h-16">
              {[3, 4, 2, 5, 4, 3, selectedMood || 3].map((m, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-md bg-gradient-to-t from-blue-500/50 to-cyan-500/30"
                  style={{ height: `${(m / 5) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {["M","T","W","T","F","S","S"].map((d) => (
                <span key={d} className="text-[10px] text-white/30">{d}</span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Overview</h2>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const moodVal = [null, null, null, 4, 5, 3, 4, 2, 5, 4, 3, 4, 5, 3, 4, 2, 3, 5, 4, 3, 4, 5, 3, 4, 2, 4, 5, 3, 4, null][i]
              const isToday = i === 15
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs transition-all ${
                    isToday
                      ? "ring-2 ring-blue-500/50"
                      : ""
                  } ${
                    moodVal === null
                      ? "bg-white/5"
                      : moodVal >= 4
                      ? "bg-emerald-500/40"
                      : moodVal >= 3
                      ? "bg-blue-500/30"
                      : moodVal >= 2
                      ? "bg-amber-500/30"
                      : "bg-rose-500/30"
                  }`}
                >
                  {i + 1}
                </div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
