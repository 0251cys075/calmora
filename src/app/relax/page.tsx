/**
 * @file page.tsx
 * @description React page component for the Relax Zone.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import { Wind, Timer, Play, SkipForward, Sparkles } from "lucide-react"

const sounds = [
  { id: "rain", name: "Rain" },
  { id: "forest", name: "Forest" },
  { id: "space", name: "Space" },
  { id: "lofi", name: "Lo-Fi" },
]

export default function RelaxPage() {
  const [activeSound, setActiveSound] = useState<string | null>("rain")
  const [timer, setTimer] = useState(25 * 60)
  const [pomodoroActive, setPomodoroActive] = useState(false)

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00e5ff] font-heading">Relax Zone</h1>
          <p className="text-xs text-white/50">Sync your heartbeat with the pulse of the light</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="premium" size="sm" className="bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30">
            <Wind className="w-3.5 h-3.5 mr-1" />
            Mindful Mode
          </Badge>
        </div>
      </div>

      {/* ── Stitch Hero: Animated Breathing Circle ── */}
      <GlassCard className="relative overflow-hidden p-8 flex flex-col items-center justify-center text-center border border-white/10 shadow-2xl">
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          {/* Cyan/Purple glowing outer rings */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00e5ff]/20 to-[#a855f7]/20 blur-2xl pointer-events-none"
          />

          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 rounded-full border-2 border-[#00e5ff] flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.4)] bg-[#10141a]/80 backdrop-blur-xl relative z-10"
          >
            <span className="text-lg font-bold tracking-widest text-[#00e5ff] uppercase font-heading">
              BREATH IN
            </span>
          </motion.div>
        </div>
        <p className="text-xs text-white/50 max-w-xs mt-2">
          Sync your heartbeat with the pulse of the light
        </p>
      </GlassCard>

      {/* ── Stitch Focus Session (25:00 Timer) ── */}
      <GlassCard className="p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-4 h-4 text-[#00e5ff]" />
          <h3 className="text-sm font-bold text-white font-heading">Focus Session</h3>
        </div>

        <div className="flex flex-col items-center justify-center my-2">
          <span className="text-5xl font-black text-white font-mono tracking-wider my-2">
            {Math.floor(timer / 60).toString().padStart(2, "0")}:
            {(timer % 60).toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-white/40">Pomodoro</span>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            onClick={() => setPomodoroActive(!pomodoroActive)}
            className="px-8 py-2.5 rounded-full btn-stitch-primary text-sm shadow-lg shadow-cyan-500/20"
          >
            {pomodoroActive ? "Pause" : "Start"}
          </Button>
          <Button
            onClick={() => { setPomodoroActive(false); setTimer(25 * 60); }}
            variant="glass"
            className="w-10 h-10 rounded-full p-0 flex items-center justify-center"
          >
            <SkipForward className="w-4 h-4 text-white/70" />
          </Button>
        </div>
      </GlassCard>

      {/* ── Stitch Soundscapes Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-[#00e5ff] uppercase tracking-wider font-heading">Soundscapes</h3>
          <span className="text-xs text-[#00e5ff]/80 cursor-pointer hover:underline">Ambient Mix</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sounds.map((snd) => {
            const isSelected = activeSound === snd.id
            return (
              <div
                key={snd.id}
                onClick={() => setActiveSound(isSelected ? null : snd.id)}
                className={`p-4 rounded-2xl glass-strong border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected ? "border-[#00e5ff] shadow-lg shadow-cyan-500/20" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-heading">{snd.name}</span>
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-400/40">
                    <Play className={`w-3.5 h-3.5 ${isSelected ? "text-[#00e5ff] fill-[#00e5ff]" : "text-white/60"}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Stitch AI Relaxation Guide Banner ── */}
      <GlassCard className="p-4 border border-[#a855f7]/30 bg-gradient-to-r from-[#a855f7]/10 to-[#00e5ff]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">AI Relaxation Guide</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Your stress levels peaked 2 hours ago. We recommend the <strong className="text-cyan-300">Deep Rain</strong> soundscape for 15 minutes.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
