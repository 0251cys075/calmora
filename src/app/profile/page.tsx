"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  Trophy, Star, Medal, Flame, Zap,
  Shield, Heart, Brain, Target,
  Settings, LogOut, Edit3
} from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import Link from "next/link"

const badges = [
  { name: "7-Day Streak", icon: Flame, color: "from-orange-500 to-red-500", earned: true },
  { name: "Mindful Master", icon: Brain, color: "from-purple-500 to-indigo-500", earned: true },
  { name: "Journal Juggernaut", icon: Heart, color: "from-rose-500 to-pink-500", earned: true },
  { name: "Challenge Champion", icon: Trophy, color: "from-amber-500 to-yellow-500", earned: false },
  { name: "Habit Hero", icon: Zap, color: "from-cyan-500 to-blue-500", earned: false },
  { name: "Meditation Guru", icon: Shield, color: "from-emerald-500 to-teal-500", earned: false },
]

const achievements = [
  { name: "First Journal Entry", progress: 100, icon: Heart },
  { name: "Complete 7-Day Streak", progress: 100, icon: Flame },
  { name: "Finish 21-Day Challenge", progress: 33, icon: Trophy },
  { name: "100 Mindfulness Minutes", progress: 65, icon: Brain },
  { name: "Connect 30 Days", progress: 80, icon: Target },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const xpInLevel = (user?.xp ?? 0) % 500
  const nextLevelXp = ((user?.level ?? 1) * 500)
  const xpPercent = Math.min(Math.round((xpInLevel / (user?.level ? 500 : 1)) * 100), 100)

  const calmPercent = Math.min(Math.round(((user?.calmScore ?? 0) / 1000) * 100), 100)

  const memberDate = user?.id
    ? new Date(parseInt(user.id.replace(/\D/g, "").slice(0, 12), 10) || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "July 2026"

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/25">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name ?? "Guest"}</h1>
              <p className="text-white/50 text-sm">Member since {memberDate}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="premium" size="sm">
                  <Trophy className="w-3 h-3" /> Level {user?.level ?? 1}
                </Badge>
                <Badge variant="success" size="sm">
                  <Flame className="w-3 h-3" /> {user?.streak ?? 0} Day Streak
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" size="sm" icon={<Settings className="w-4 h-4" />}>Settings</Button>
            <Button variant="glass" size="sm" icon={<LogOut className="w-4 h-4" />} onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Calm Score</span>
                  <span className="text-white font-medium">{user?.calmScore ?? 0}</span>
                </div>
                <Progress value={calmPercent} variant="gradient" size="md" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">XP Progress</span>
                  <span className="text-white font-medium">{xpInLevel} / {nextLevelXp}</span>
                </div>
                <Progress value={xpPercent} variant="success" size="md" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-gradient-amber">{user?.badges?.length ?? 0}</p>
                  <p className="text-xs text-white/40">Badges</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-gradient-emerald">{(user?.xp ?? 0) * 2}</p>
                  <p className="text-xs text-white/40">Calm Coins</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Badges</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {badges.map((badge) => {
                const BadgeIcon = badge.icon
                return (
                  <div key={badge.name} className="text-center">
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-2 ${
                      badge.earned ? "shadow-lg" : "opacity-30 grayscale"
                    }`}>
                      <BadgeIcon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-xs text-white/60">{badge.name}</p>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">
            <Trophy className="w-5 h-5 inline text-amber-400 mr-2" />
            Achievements
          </h2>
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const AchIcon = achievement.icon
              return (
                <div key={achievement.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                    <AchIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{achievement.name}</p>
                    <Progress value={achievement.progress} size="sm" variant="warning" />
                  </div>
                  <span className="text-sm font-medium text-white/60">{achievement.progress}%</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
