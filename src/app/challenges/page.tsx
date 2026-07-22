"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { challenges, type Challenge } from "@/lib/data/challenges"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Trophy, Clock, Star, Sparkles, Users, Target, Zap } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ChallengesPage() {
  const activeChallenges = challenges.slice(0, 2)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-white">21-Day Transformation</h1>
        <p className="text-white/50 mt-1">Guided programs to transform your life, one day at a time</p>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard className="relative overflow-hidden" glow>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Your Journey Starts Today</h2>
              <p className="text-white/60 text-sm mt-1">Complete challenges, earn XP, unlock badges, and transform your life.</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient-emerald">1,250</p>
                <p className="text-xs text-white/40">Total XP Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient-amber">5</p>
                <p className="text-xs text-white/40">Badges Unlocked</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-3">Active Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeChallenges.map((challenge) => (
            <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
              <GlassCard hover>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${challenge.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                    {challenge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                    <p className="text-sm text-white/50 mt-1 line-clamp-2">{challenge.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        {challenge.duration}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <Star className="w-3 h-3" />
                        +{challenge.xpReward} XP
                      </div>
                    </div>
                    <Progress value={Math.floor(Math.random() * 100)} size="sm" variant="gradient" className="mt-3" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/30 mt-2 flex-shrink-0" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-3">All Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.slice(2).map((challenge) => (
            <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
              <GlassCard hover>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.gradient} flex items-center justify-center text-xl mb-3`}>
                  {challenge.icon}
                </div>
                <h3 className="text-base font-semibold text-white">{challenge.title}</h3>
                <p className="text-sm text-white/50 mt-1 line-clamp-2">{challenge.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    {challenge.duration}
                  </div>
                  <Badge variant="premium" size="sm">
                    <Star className="w-3 h-3" />
                    {challenge.xpReward} XP
                  </Badge>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
