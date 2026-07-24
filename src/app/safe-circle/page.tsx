"use client"

import { motion } from "framer-motion"
import { Shield, Clock, History } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { useSafeCircle } from "@/lib/hooks/useSafeCircle"
import { MatchingQueue } from "@/components/safe-circle/MatchingQueue"
import { ChatRoom } from "@/components/safe-circle/ChatRoom"
import { format } from "date-fns"

export default function SafeCirclePage() {
  const { anonUsername, sessions, activeSession, state, startMatching, cancelMatching, endSession, flagSession } = useSafeCircle()

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Safe Circle</h1>
              <p className="text-sm text-white/50">Anonymous peer support — you are <span className="text-white font-medium">{anonUsername}</span></p>
            </div>
          </div>
          <Badge variant="info" size="sm">
            <Shield className="w-3 h-3" /> Anonymous
          </Badge>
        </div>
      </motion.div>

      {(state.status === "idle" || state.status === "queuing") && !activeSession ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MatchingQueue
            isQueuing={state.status === "queuing"}
            onSelectTopic={(topic) => startMatching(topic)}
            onCancel={cancelMatching}
          />
        </motion.div>
      ) : activeSession ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ChatRoom
            username={activeSession.username}
            peerUsername={activeSession.peerUsername}
            topic={activeSession.topic}
            onEndSession={endSession}
            onFlagged={(keywords) => flagSession(keywords)}
          />
        </motion.div>
      ) : null}

      {sessions.length > 0 && state.status === "idle" && !activeSession && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-white/40" />
              <h2 className="text-sm font-semibold text-white">Past Sessions</h2>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {[...sessions].reverse().map((s) => (
                <div key={s.sessionId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-300">{s.peerUsername.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">{s.topic} · {s.peerUsername}</p>
                      <p className="text-xs text-white/30">{format(s.startTime, "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.flagged && <Badge variant="warning" size="sm">Flagged</Badge>}
                    <Badge size="sm">{s.endedBy === "self" ? "Ended" : "Completed"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
