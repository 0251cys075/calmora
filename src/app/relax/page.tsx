"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import {
  Wind, Music, Headphones, Timer,
  Play, Pause, SkipForward, Volume2,
  Cloud, Waves, Flame, Sunrise,
  Trees, Moon
} from "lucide-react"

const sounds = [
  { id: "rain", name: "Rain", icon: Cloud, color: "text-blue-400", gradient: "from-blue-500 to-cyan-500" },
  { id: "ocean", name: "Ocean Waves", icon: Waves, color: "text-cyan-400", gradient: "from-cyan-500 to-teal-500" },
  { id: "fire", name: "Fireplace", icon: Flame, color: "text-orange-400", gradient: "from-orange-500 to-red-500" },
  { id: "forest", name: "Forest", icon: Trees, color: "text-emerald-400", gradient: "from-emerald-500 to-green-500" },
  { id: "night", name: "Night", icon: Moon, color: "text-indigo-400", gradient: "from-indigo-500 to-purple-500" },
  { id: "lofi", name: "Lo-fi", icon: Music, color: "text-purple-400", gradient: "from-purple-500 to-pink-500" },
]

export default function RelaxPage() {
  const [activeTab, setActiveTab] = useState("breathing")
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out" | "idle">("idle")
  const [timer, setTimer] = useState(25 * 60)
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const breathInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (breathPhase !== "idle") {
      const phases = ["in", "hold", "out", "hold"]
      let i = 0
      breathInterval.current = setInterval(() => {
        setBreathPhase(phases[i] as "in" | "hold" | "out")
        i = (i + 1) % phases.length
      }, 4000)
    }
    return () => {
      if (breathInterval.current) clearInterval(breathInterval.current)
    }
  }, [breathPhase !== "idle"])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (pomodoroActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [pomodoroActive, timer])

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const tabs = [
    { id: "breathing", label: "Breathing", icon: Wind },
    { id: "sounds", label: "Soundscapes", icon: Headphones },
    { id: "pomodoro", label: "Pomodoro", icon: Timer },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Relax Zone</h1>
        <p className="text-white/50 mt-1">Find your calm with breathing exercises, sounds, and focus tools</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2"
      >
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                activeTab === tab.id
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      {activeTab === "breathing" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="text-center py-12">
            <div className="w-48 h-48 mx-auto relative mb-8">
              <div className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                breathPhase === "in" ? "border-blue-400 scale-110 opacity-80" :
                breathPhase === "hold" ? "border-cyan-400 scale-100 opacity-100" :
                breathPhase === "out" ? "border-emerald-400 scale-90 opacity-60" :
                "border-white/20 scale-100 opacity-40"
              }`} />
              <div className="absolute inset-4 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {breathPhase === "idle" ? (
                    <Wind className="w-12 h-12 text-white/40 mx-auto mb-2" />
                  ) : (
                    <motion.div
                      key={breathPhase}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <p className="text-3xl font-light text-white">
                        {breathPhase === "in" ? "Breathe In" : breathPhase === "hold" ? "Hold" : "Breathe Out"}
                      </p>
                      <p className="text-sm text-white/40 mt-1">
                        {breathPhase === "in" ? "4 seconds" : breathPhase === "hold" ? "4 seconds" : "6 seconds"}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {breathPhase === "idle" ? (
              <Button
                size="lg"
                onClick={() => setBreathPhase("in")}
                icon={<Play className="w-5 h-5" />}
              >
                Start Breathing
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => { setBreathPhase("idle"); if (breathInterval.current) clearInterval(breathInterval.current) }}
                icon={<Pause className="w-5 h-5" />}
              >
                Stop
              </Button>
            )}

            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/40">
              <span>In: 4s</span>
              <span>Hold: 4s</span>
              <span>Out: 6s</span>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === "sounds" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sounds.map((sound) => {
              const SoundIcon = sound.icon
              const isActive = activeSound === sound.id
              return (
                <GlassCard
                  key={sound.id}
                  className={`text-center p-4 ${isActive ? "ring-2 ring-blue-500/50" : ""}`}
                  onClick={() => {
                    setActiveSound(isActive ? null : sound.id)
                    setIsPlaying(!isActive)
                  }}
                >
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${sound.gradient} flex items-center justify-center mb-2 shadow-lg ${
                    isActive ? "animate-pulse" : ""
                  }`}>
                    <SoundIcon className={`w-6 h-6 text-white ${isActive ? "animate-float" : ""}`} />
                  </div>
                  <p className="text-sm font-medium text-white">{sound.name}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {isActive ? "Playing..." : "Tap to play"}
                  </p>
                </GlassCard>
              )
            })}
          </div>
        </motion.div>
      )}

      {activeTab === "pomodoro" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="text-center py-12">
            <div className="w-48 h-48 mx-auto rounded-full border-4 border-white/10 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-2 rounded-full border border-white/5" />
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="rgba(59,130,246,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - timer / (25 * 60))}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{formatTimer(timer)}</p>
                <p className="text-sm text-white/40 mt-1">Focus Time</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              {pomodoroActive ? (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setPomodoroActive(false)}
                  icon={<Pause className="w-5 h-5" />}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => { setPomodoroActive(true); if (timer === 0) setTimer(25 * 60) }}
                  icon={<Play className="w-5 h-5" />}
                >
                  {timer === 25 * 60 ? "Start Focus" : "Resume"}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => { setPomodoroActive(false); setTimer(25 * 60) }}
              >
                Reset
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button className="text-sm text-white/40 hover:text-white transition-all">5 min</button>
              <button className="text-sm text-white font-medium border-b-2 border-blue-500 pb-0.5">25 min</button>
              <button className="text-sm text-white/40 hover:text-white transition-all">50 min</button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
