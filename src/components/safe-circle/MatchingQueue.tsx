"use client"

import { motion } from "framer-motion"
import { Users, Search, Loader2, ArrowLeft } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TOPICS, type Topic } from "@/lib/safe-circle-utils"

interface MatchingQueueProps {
  isQueuing: boolean
  onSelectTopic: (topic: Topic) => void
  onCancel: () => void
}

const topicColors: Record<Topic, string> = {
  Anxiety: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300",
  Depression: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300",
  Stress: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
  Loneliness: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-300",
  Grief: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-300",
}

const topicEmojis: Record<Topic, string> = {
  Anxiety: "🧠",
  Depression: "💙",
  Stress: "💆",
  Loneliness: "🤝",
  Grief: "🕊️",
}

function QueuingState({ topic, onCancel }: { topic: Topic; onCancel: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">Finding someone to talk to...</h3>
      <p className="text-sm text-white/50 mb-1">Topic: <span className="text-white/80">{topicEmojis[topic]} {topic}</span></p>
      <p className="text-xs text-white/30 mb-6">You'll be paired with someone who also wants to talk about {topic.toLowerCase()}.</p>

      <div className="flex items-center gap-2 justify-center mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-400/80">Looking for peers...</span>
      </div>

      <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

export function MatchingQueue({ isQueuing, onSelectTopic, onCancel }: MatchingQueueProps) {
  if (isQueuing) {
    return (
      <GlassCard>
        <QueuingState topic={TOPICS[0]} onCancel={onCancel} />
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30 flex items-center justify-center">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Safe Circle</h2>
        <p className="text-sm text-white/50 max-w-md mx-auto">
          Anonymous 1-on-1 peer support. You'll be randomly paired with someone who shares your topic.
          No names, no profiles — just a safe conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {TOPICS.map((topic) => (
          <motion.button
            key={topic}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTopic(topic)}
            className={cn(
              "p-5 rounded-2xl border bg-gradient-to-br text-left transition-all",
              topicColors[topic]
            )}
          >
            <span className="text-2xl block mb-2">{topicEmojis[topic]}</span>
            <h3 className="text-base font-semibold text-white mb-1">{topic}</h3>
            <p className="text-xs text-white/50">
              {topic === "Anxiety" && "Find calm with someone who understands"}
              {topic === "Depression" && "Share the weight with a listening ear"}
              {topic === "Stress" && "Unwind with a supportive peer"}
              {topic === "Loneliness" && "Connect with someone who gets it"}
              {topic === "Grief" && "Carry the burden together"}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <Search className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs text-white/30">
            Anonymous · No personal info shared · Leave anytime
          </span>
        </div>
      </div>
    </div>
  )
}
