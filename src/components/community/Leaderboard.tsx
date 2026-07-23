"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Trophy, Zap, Star, Medal, Flame, Crown, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { communityApi } from "@/lib/community-api"
import type { UserProfile } from "@/lib/community-api"

interface LeaderboardProps {
  compact?: boolean
}

export function Leaderboard({ compact }: LeaderboardProps) {
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [type, setType] = useState<"xp" | "reputation" | "streak">("xp")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [type])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await communityApi.getLeaderboard(type)
      setUsers((res.users || []).slice(0, compact ? 5 : 20))
    } catch {}
    setLoading(false)
  }

  const getRankIcon = (i: number) => {
    if (i === 0) return <Crown className="w-4 h-4 text-amber-400" />
    if (i === 1) return <Medal className="w-4 h-4 text-slate-300" />
    if (i === 2) return <Medal className="w-4 h-4 text-amber-600" />
    return null
  }

  const getRankStyle = (i: number) => {
    if (i === 0) return "bg-amber-500/10 border-amber-500/20"
    if (i === 1) return "bg-white/5 border-white/10"
    if (i === 2) return "bg-amber-500/5 border-amber-500/10"
    return "bg-white/5 border-white/5"
  }

  const statLabel = type === "xp" ? "XP" : type === "reputation" ? "Rep" : "Streak"
  const statIcon = type === "xp" ? <Zap className="w-4 h-4" /> : type === "reputation" ? <Star className="w-4 h-4" /> : <Flame className="w-4 h-4" />

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
        </div>
        {!compact && (
          <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
            {(["xp", "reputation", "streak"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  type === t ? "bg-blue-500/20 text-blue-300" : "text-white/40 hover:text-white"
                }`}
              >
                {t === "xp" ? "XP" : t === "reputation" ? "Reputation" : "Streak"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {users.map((u, i) => (
          <motion.button
            key={u._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => router.push(`/profile/${u.username || u._id}`)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all hover:bg-white/10 ${getRankStyle(i)}`}
          >
            <div className="w-6 text-center text-sm font-bold">
              {getRankIcon(i) || <span className={i < 10 ? "text-white/60" : "text-white/30"}>{i + 1}</span>}
            </div>
            <Avatar src={u.avatar} name={u.displayName || u.name} size="sm" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{u.displayName || u.name}</p>
              <p className="text-xs text-white/40 truncate">@{u.username || "user"} · Level {u.level}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-amber-400">
              {statIcon}
              {type === "xp" ? u.xp : type === "reputation" ? u.reputation : u.streak}
            </div>
          </motion.button>
        ))}
        {!loading && users.length === 0 && (
          <p className="text-center text-white/30 text-sm py-4">No rankings yet. Start participating!</p>
        )}
      </div>
    </GlassCard>
  )
}
