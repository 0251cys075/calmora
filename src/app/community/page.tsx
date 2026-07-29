/**
 * @file page.tsx
 * @description React page component for Community Feed.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00e5ff] font-heading">Community Feed</h1>
          <p className="text-xs text-white/50">Connect & grow with student peers</p>
        </div>
        <Badge variant="premium" size="sm" className="bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Active Forum
        </Badge>
      </div>

      {/* ── Stitch Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["#Meditation", "#StudyStress", "#Mindfulness", "#Growth", "#StudentLife"].map((tag, idx) => (
          <button
            key={tag}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              idx === 0
                ? "bg-[#00e5ff] text-[#00363d] shadow-md shadow-cyan-500/20"
                : "glass-strong text-white/70 hover:text-white border border-white/10"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Stitch Share Mood Composer Trigger ── */}
      <GlassCard className="p-4 border border-white/10 flex items-center gap-3 cursor-pointer hover:border-cyan-400/40 transition-all">
        <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#00e5ff]" />
        </div>
        <span className="text-xs text-white/40 font-medium">Share your current mood...</span>
      </GlassCard>

      {/* ── Post Feed Cards ── */}
      <div className="space-y-4">
        <GlassCard className="p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">
                SJ
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-heading">Sarah J.</h4>
                <span className="text-[10px] text-white/40">2 hours ago</span>
              </div>
            </div>
            <Badge size="sm" className="bg-[#00e5ff]/10 text-[#00e5ff] text-[10px]">#Meditation</Badge>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            Finally managed to keep a consistent 15-minute morning routine for an entire week. The difference in my focus levels during lectures is incredible. Has anyone else noticed the &quot;flow state&quot; kick in earlier with meditation? 🧘✨
          </p>
        </GlassCard>
      </div>

      {/* ── Stitch Top Contributors ── */}
      <GlassCard className="p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">Top Contributors</h3>
          <span className="text-[10px] text-white/40">This Week</span>
        </div>

        <div className="space-y-2">
          {[
            { name: "Maya Angel", score: "982", rank: "1" },
            { name: "Leo Chen", score: "845", rank: "2" },
            { name: "S. Kumar", score: "781", rank: "3" },
          ].map((user) => (
            <div key={user.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#00e5ff] w-4 text-center font-mono">#{user.rank}</span>
                <span className="text-xs font-semibold text-white font-heading">{user.name}</span>
              </div>
              <span className="text-xs font-bold text-purple-300 font-mono">{user.score} pts</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Stitch AI Match Recommendation ── */}
      <GlassCard className="p-5 border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-widest font-mono">
          <Sparkles className="w-4 h-4 text-purple-300" />
          AI MATCH
        </div>
        <p className="text-xs text-white/70 leading-relaxed max-w-sm mx-auto">
          Based on your mood log, we think you&apos;d enjoy connecting with <strong className="text-cyan-300">Maya Angel</strong> who also practices morning focus.
        </p>
        <Button className="btn-stitch-primary text-xs py-2 px-6 shadow-md shadow-cyan-500/20">
          Connect Now
        </Button>
      </GlassCard>
    </div>
  )
}
