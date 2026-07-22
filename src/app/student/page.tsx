"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import {
  GraduationCap, BookOpen, Brain, Timer,
  Target, Clock, Calendar, AlertTriangle,
  Sparkles, CheckCircle, ArrowRight, Play, Pause, RotateCcw
} from "lucide-react"
import Link from "next/link"

export default function StudentPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [completedSessions, setCompletedSessions] = useState<Record<string, boolean>>({})

  const toggleSession = (subject: string) => {
    setCompletedSessions((prev) => ({ ...prev, [subject]: !prev[subject] }))
  }

  const startTimer = () => {
    if (timeLeft <= 0) {
      setTimeLeft(timerMode === "focus" ? 25 * 60 : 5 * 60)
    }
    setTimerActive(true)
  }

  const pauseTimer = () => {
    setTimerActive(false)
  }

  const resetTimer = () => {
    setTimerActive(false)
    setTimerMode("focus")
    setTimeLeft(25 * 60)
  }

  const setDuration = (minutes: number) => {
    setTimerActive(false)
    setTimerMode("focus")
    setTimeLeft(minutes * 60)
  }

  const startBreak = () => {
    setTimerActive(false)
    const breakMinutes = timerMode === "focus" ? 5 : 15
    setTimerMode("break")
    setTimeLeft(breakMinutes * 60)
  }

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerActive, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
      if (timerMode === "focus") {
        setTimerMode("break")
        setTimeLeft(5 * 60)
      } else {
        setTimerMode("focus")
        setTimeLeft(25 * 60)
      }
    }
  }, [timeLeft, timerActive, timerMode])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const resources = [
    { title: "Exam Stress Guide", desc: "Strategies to stay calm during exams", icon: Brain, color: "text-purple-400", gradient: "from-purple-500 to-indigo-500" },
    { title: "Career Anxiety", desc: "Navigate career decisions with confidence", icon: Target, color: "text-blue-400", gradient: "from-blue-500 to-cyan-500" },
    { title: "Burnout Recovery", desc: "Recognize and recover from burnout", icon: AlertTriangle, color: "text-rose-400", gradient: "from-rose-500 to-pink-500" },
    { title: "Interview Prep", desc: "Mental preparation for interviews", icon: BookOpen, color: "text-amber-400", gradient: "from-amber-500 to-orange-500" },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Student Wellness</h1>
            <p className="text-white/50 mt-1">Thrive academically with mental wellness tools</p>
          </div>
          <Badge variant="info" size="md">
            <GraduationCap className="w-3.5 h-3.5" /> Student Mode
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard glow>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">Your Study Dashboard</h2>
              <p className="text-white/60 text-sm mt-1">You have 3 upcoming exams. Stay focused and calm.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-white">3</p>
                  <p className="text-[10px] text-white/40">Upcoming Exams</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-gradient">12</p>
                  <p className="text-[10px] text-white/40">Study Hours</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-gradient-emerald">8</p>
                  <p className="text-[10px] text-white/40">Tasks Done</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-gradient-amber">85%</p>
                  <p className="text-[10px] text-white/40">Focus Score</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Study Planner</h2>
            <div className="space-y-3">
              {[
                { subject: "Mathematics", time: "9:00 - 10:30", progress: 75, color: "from-blue-500 to-cyan-500" },
                { subject: "Physics", time: "11:00 - 12:30", progress: 40, color: "from-purple-500 to-indigo-500" },
                { subject: "Literature", time: "14:00 - 15:00", progress: 90, color: "from-emerald-500 to-teal-500" },
              ].map((session) => {
                const isCompleted = completedSessions[session.subject]
                return (
                  <div
                    key={session.subject}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => toggleSession(session.subject)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-white/30"
                        }`}>
                          {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
                          {session.subject}
                        </span>
                      </div>
                      <span className="text-xs text-white/40"><Clock className="w-3 h-3 inline mr-1" />{session.time}</span>
                    </div>
                    <Progress value={session.progress} size="sm" variant="gradient" />
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Focus Timer</h2>
            <div className="text-center py-4 sm:py-6">
              <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full border-4 border-white/10 flex items-center justify-center mb-4 relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    fill="none"
                    stroke="rgba(59,130,246,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    fill="none"
                    stroke="url(#timerGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - timeLeft / (timerMode === "focus" ? 25 * 60 : 5 * 60))}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{formatTime(timeLeft)}</p>
                  <p className="text-xs text-white/40 capitalize">{timerMode}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-center mb-4">
                {timerActive ? (
                  <Button size="sm" variant="secondary" onClick={pauseTimer} icon={<Pause className="w-4 h-4" />}>
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" onClick={startTimer} icon={<Play className="w-4 h-4" />}>
                    {timeLeft === 0 ? "Restart" : "Start"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={startBreak} icon={<Timer className="w-4 h-4" />}>
                  Break
                </Button>
                <Button size="sm" variant="ghost" onClick={resetTimer} icon={<RotateCcw className="w-4 h-4" />}>
                  Reset
                </Button>
              </div>

              <div className="flex justify-center gap-4 text-sm">
                {[
                  { label: "5 min", minutes: 5 },
                  { label: "25 min", minutes: 25 },
                  { label: "50 min", minutes: 50 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setDuration(preset.minutes)}
                    className={`transition-all ${
                      timeLeft === preset.minutes * 60 && !timerActive
                        ? "text-white font-medium border-b-2 border-blue-500 pb-0.5"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-4 mt-3 text-xs text-white/30">
                <span>Focus: {timerMode === "focus" ? formatTime(timeLeft) : "25m"}</span>
                <span>Break: 5m</span>
                <span>Long break: 15m</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-3">Wellness Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <GlassCard key={resource.title} hover>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${resource.gradient} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-white`} />
                </div>
                <h3 className="text-sm font-semibold text-white">{resource.title}</h3>
                <p className="text-xs text-white/50 mt-1">{resource.desc}</p>
              </GlassCard>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
