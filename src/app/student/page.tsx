"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  GraduationCap, BookOpen, Brain, Timer,
  Target, Clock, Calendar, AlertTriangle,
  Sparkles, CheckCircle, ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function StudentPage() {
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
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
              ].map((session) => (
                <div key={session.subject} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{session.subject}</span>
                    <span className="text-xs text-white/40"><Clock className="w-3 h-3 inline mr-1" />{session.time}</span>
                  </div>
                  <Progress value={session.progress} size="sm" variant="gradient" />
                </div>
              ))}
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
            <div className="text-center py-6">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-white/10 flex items-center justify-center mb-4">
                <div>
                  <p className="text-3xl font-bold text-white">25:00</p>
                  <p className="text-xs text-white/40">Focus</p>
                </div>
              </div>
              <div className="flex gap-2 justify-center mb-4">
                <Button size="sm" icon={<Timer className="w-4 h-4" />}>Start Focus</Button>
                <Button size="sm" variant="secondary">Break</Button>
              </div>
              <div className="flex justify-center gap-6 text-sm text-white/40">
                <span>Focus: 25m</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
