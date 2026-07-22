"use client"

import { useParams } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { challenges, type ChallengeDay } from "@/lib/data/challenges"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Check, Clock, Trophy, Star, Target, BookOpen, Brain, Heart, Sparkles, Zap } from "lucide-react"
import { useState } from "react"

const typeIcons: Record<string, React.ReactNode> = {
  task: <Target className="w-4 h-4" />,
  reflection: <Brain className="w-4 h-4" />,
  meditation: <Sparkles className="w-4 h-4" />,
  exercise: <Zap className="w-4 h-4" />,
  reading: <BookOpen className="w-4 h-4" />,
  gratitude: <Heart className="w-4 h-4" />,
}

const typeColors: Record<string, string> = {
  task: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  reflection: "text-purple-400 bg-purple-500/20 border-purple-500/30",
  meditation: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
  exercise: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  reading: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  gratitude: "text-rose-400 bg-rose-500/20 border-rose-500/30",
}

export default function ChallengeDetailPage() {
  const params = useParams()
  const challenge = challenges.find((c) => c.id === params.id)
  const [completedDays, setCompletedDays] = useState<number[]>([])

  if (!challenge) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50">Challenge not found</p>
        <Link href="/challenges">
          <Button variant="glass" className="mt-4">Back to Challenges</Button>
        </Link>
      </div>
    )
  }

  const progress = (completedDays.length / challenge.days.length) * 100

  return (
    <div className="space-y-6">
      <Link href="/challenges" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Challenges
      </Link>

      <GlassCard className={`relative overflow-hidden`} glow>
        <div className={`absolute inset-0 bg-gradient-to-br ${challenge.gradient} opacity-10`} />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${challenge.gradient} flex items-center justify-center text-3xl shadow-lg`}>
              {challenge.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="premium">{challenge.duration}</Badge>
                <Badge variant="info">
                  <Star className="w-3 h-3" /> {challenge.xpReward} XP
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
              <p className="text-white/60 mt-1">{challenge.description}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-2xl font-bold text-gradient">{completedDays.length}</p>
              <p className="text-xs text-white/40 mt-1">Days Done</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-2xl font-bold text-gradient-emerald">{challenge.days.length}</p>
              <p className="text-xs text-white/40 mt-1">Total Days</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-2xl font-bold text-gradient-amber">{Math.round(progress)}%</p>
              <p className="text-xs text-white/40 mt-1">Progress</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-2xl font-bold text-white">{completedDays.length * 25}</p>
              <p className="text-xs text-white/40 mt-1">XP Earned</p>
            </div>
          </div>

          <Progress value={progress} size="lg" variant="gradient" showLabel label="Challenge Progress" className="mt-6" />
        </div>
      </GlassCard>

      <h2 className="text-lg font-semibold text-white">Daily Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {challenge.days.map((day, i) => {
          const isCompleted = completedDays.includes(day.day)
          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GlassCard
                className={`flex items-start gap-4 ${isCompleted ? "opacity-60" : ""}`}
                hover={!isCompleted}
                onClick={() => {
                  if (isCompleted) {
                    setCompletedDays((prev) => prev.filter((d) => d !== day.day))
                  } else {
                    setCompletedDays((prev) => [...prev, day.day])
                  }
                }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    isCompleted
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : typeColors[day.type] || "bg-white/10 border-white/20 text-white/60"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : typeIcons[day.type] || <Target className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">Day {day.day}: {day.title}</p>
                    {isCompleted && <Badge variant="success" size="sm">Done</Badge>}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{day.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="w-3 h-3 text-white/30" />
                    <span className="text-xs text-white/30">{day.duration}</span>
                    <Badge variant="default" size="sm">{day.type}</Badge>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {progress === 100 && (
        <GlassCard className="text-center py-8" glow>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Challenge Complete!</h2>
          <p className="text-white/60 mt-2">You've completed all {challenge.days.length} days. Amazing dedication!</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Badge variant="premium" size="md">
              <Trophy className="w-4 h-4" /> +{challenge.xpReward} XP
            </Badge>
            <Badge variant="success" size="md">
              +{challenge.coinReward} Coins
            </Badge>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
