"use client"

import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Shield, History } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { useSocket } from "@/lib/hooks/useSocket"
import { generateAnonUsername } from "@/lib/safe-circle-utils"
import type { SafeCircleSession, Topic } from "@/lib/safe-circle-utils"
import { MatchingQueue } from "@/components/safe-circle/MatchingQueue"
import { ChatRoom } from "@/components/safe-circle/ChatRoom"
import { VoiceCall } from "@/components/safe-circle/VoiceCall"
import { VideoCall } from "@/components/safe-circle/VideoCall"
import { format } from "date-fns"

type Phase = "idle" | "queuing" | "matched"

export default function SafeCirclePage() {
  const [anonUsername] = useState(generateAnonUsername)
  const [sessions, setSessions] = useLocalStorage<SafeCircleSession[]>("calmora_safe_circle_sessions", [])
  const [phase, setPhase] = useState<Phase>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [peerUsername, setPeerUsername] = useState<string | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [isPeerA, setIsPeerA] = useState(false)
  const [matchTimeout, setMatchTimeout] = useState<string | null>(null)

  // Voice call state
  const [voiceCallActive, setVoiceCallActive] = useState(false)
  const [voiceCallRequested, setVoiceCallRequested] = useState(false)
  const [voiceCallPeerRequested, setVoiceCallPeerRequested] = useState(false)

  // Video call state
  const [videoCallActive, setVideoCallActive] = useState(false)
  const [videoCallRequested, setVideoCallRequested] = useState(false)
  const [videoCallPeerRequested, setVideoCallPeerRequested] = useState(false)

  // WebRTC signaling callback refs
  const [onRemoteVoiceSdp, setOnRemoteVoiceSdp] = useState<((sdp: any) => void) | null>(null)
  const [onRemoteVoiceIce, setOnRemoteVoiceIce] = useState<((candidate: any) => void) | null>(null)
  const [onRemoteVideoSdp, setOnRemoteVideoSdp] = useState<((sdp: any) => void) | null>(null)
  const [onRemoteVideoIce, setOnRemoteVideoIce] = useState<((candidate: any) => void) | null>(null)

  // Chat message ref for imperative peer message injection
  const chatAddPeerMessage = useRef<((text: string, timestamp: number) => void) | null>(null)
  const chatSetPeerTyping = useRef<((typing: boolean) => void) | null>(null)

  const persistSession = useCallback((session: SafeCircleSession) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.sessionId === session.sessionId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = session
        return next
      }
      return [...prev, session]
    })
  }, [setSessions])

  const handleEndSession = useCallback(() => {
    if (sessionId) socket.endSession(sessionId)
    if (sessionId) {
      persistSession({
        sessionId, username: anonUsername,
        peerUsername: peerUsername || "Unknown",
        topic: topic || "Stress",
        startTime: Date.now(), endTime: Date.now(), endedBy: "self", flagged: false, flaggedKeywords: [],
      })
    }
    if (voiceCallActive) setVoiceCallActive(false)
    if (videoCallActive) setVideoCallActive(false)
    setSessionId(null); setPeerUsername(null); setTopic(null); setPhase("idle"); setMatchTimeout(null)
    setVoiceCallRequested(false); setVoiceCallPeerRequested(false)
    setVideoCallRequested(false); setVideoCallPeerRequested(false)
  }, [sessionId, anonUsername, peerUsername, topic, voiceCallActive, videoCallActive, persistSession])

  const handlePeerLeft = useCallback(() => {
    if (sessionId) {
      persistSession({
        sessionId, username: anonUsername,
        peerUsername: peerUsername || "Unknown",
        topic: topic || "Stress",
        startTime: Date.now(), endTime: Date.now(), endedBy: "peer", flagged: false, flaggedKeywords: [],
      })
    }
    if (voiceCallActive) setVoiceCallActive(false)
    if (videoCallActive) setVideoCallActive(false)
    setSessionId(null); setPeerUsername(null); setTopic(null); setPhase("idle")
    setVoiceCallRequested(false); setVoiceCallPeerRequested(false)
    setVideoCallRequested(false); setVideoCallPeerRequested(false)
  }, [sessionId, anonUsername, peerUsername, topic, voiceCallActive, videoCallActive, persistSession])

  const socket = useSocket({
    onMatched: (data) => {
      setPhase("matched")
      setSessionId(data.sessionId)
      setPeerUsername(data.peerUsername)
      setTopic(data.topic)
      setIsPeerA(data.isPeerA)
      setMatchTimeout(null)
    },
    onQueued: () => setPhase("queuing"),
    onMatchTimeout: (data) => {
      setPhase("idle")
      setMatchTimeout(data.message)
    },
    onMatchCancelled: () => setPhase("idle"),
    onPeerMessage: (data) => {
      chatAddPeerMessage.current?.(data.text, data.timestamp)
    },
    onPeerTyping: () => {
      chatSetPeerTyping.current?.(true)
      setTimeout(() => chatSetPeerTyping.current?.(false), 3000)
    },
    onPeerLeft: () => handlePeerLeft(),
    onSessionEnded: () => handlePeerLeft(),
    onError: () => {},

    // Voice signaling
    onVoiceOffer: (data) => onRemoteVoiceSdp?.(data.sdp),
    onVoiceAnswer: (data) => onRemoteVoiceSdp?.(data.sdp),
    onVoiceIce: (data) => onRemoteVoiceIce?.(data.candidate),
    onVoiceAccepted: () => { setVoiceCallPeerRequested(false); setVoiceCallActive(true) },
    onVoiceDeclined: () => { setVoiceCallRequested(false); setVoiceCallPeerRequested(false) },
    onVoiceEnded: () => { setVoiceCallActive(false); setVoiceCallRequested(false) },

    // Video signaling
    onVideoOffer: (data) => onRemoteVideoSdp?.(data.sdp),
    onVideoAnswer: (data) => onRemoteVideoSdp?.(data.sdp),
    onVideoIce: (data) => onRemoteVideoIce?.(data.candidate),
    onVideoAccepted: () => { setVideoCallPeerRequested(false); setVideoCallActive(true) },
    onVideoDeclined: () => { setVideoCallRequested(false); setVideoCallPeerRequested(false) },
    onVideoEnded: () => { setVideoCallActive(false); setVideoCallRequested(false) },
  })

  const handleSelectTopic = (t: Topic) => {
    setTopic(t)
    socket.findMatch(t, anonUsername)
    setPhase("queuing")
    setMatchTimeout(null)
  }

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
              <p className="text-sm text-white/50">You are <span className="text-white font-medium">{anonUsername}</span></p>
            </div>
          </div>
          <Badge variant="info" size="sm">
            <Shield className="w-3 h-3" /> Anonymous
          </Badge>
        </div>
      </motion.div>

      {(phase === "idle" || phase === "queuing") && !sessionId ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MatchingQueue
            isQueuing={phase === "queuing"}
            isConnected={socket.isConnected}
            socketError={socket.status === "error" ? (socket.errorMsg || "Connection failed") : null}
            onSelectTopic={handleSelectTopic}
            onCancel={() => { socket.cancelMatch(); setPhase("idle") }}
          />
          {matchTimeout && (
            <p className="text-sm text-amber-400/80 text-center mt-3">{matchTimeout}</p>
          )}
        </motion.div>
      ) : sessionId && peerUsername && topic ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ChatRoom
            sessionId={sessionId}
            username={anonUsername}
            peerUsername={peerUsername}
            topic={topic}
            onEndSession={handleEndSession}
            onSendMessage={(text) => socket.sendMessage(sessionId, text)}
            onTyping={() => socket.sendTyping(sessionId)}
            onReport={(keywords) => socket.reportSession(sessionId, keywords)}
            onVoiceAccept={() => { setVoiceCallPeerRequested(false); setVoiceCallActive(true); socket.voiceAccept(sessionId) }}
            onVoiceDecline={() => { setVoiceCallPeerRequested(false); socket.voiceDecline(sessionId) }}
            onVoiceEnd={() => { setVoiceCallActive(false); setVoiceCallRequested(false); socket.voiceEnd(sessionId) }}
            voiceCallActive={voiceCallActive}
            voiceCallRequested={voiceCallRequested}
            voiceCallPeerRequested={voiceCallPeerRequested}
            onRequestVoice={() => { setVoiceCallRequested(true); socket.voiceAccept(sessionId); }}
            onVideoAccept={() => { setVideoCallPeerRequested(false); setVideoCallActive(true); socket.videoAccept(sessionId) }}
            onVideoDecline={() => { setVideoCallPeerRequested(false); socket.videoDecline(sessionId) }}
            onVideoEnd={() => { setVideoCallActive(false); setVideoCallRequested(false); socket.videoEnd(sessionId) }}
            videoCallActive={videoCallActive}
            videoCallRequested={videoCallRequested}
            videoCallPeerRequested={videoCallPeerRequested}
            onRequestVideo={() => { setVideoCallRequested(true); socket.videoAccept(sessionId); }}
          />
          <VoiceCall
            sessionId={sessionId}
            isPeerA={isPeerA}
            active={voiceCallActive}
            voiceOffer={(sdp) => socket.voiceOffer(sessionId, sdp)}
            voiceAnswer={(sdp) => socket.voiceAnswer(sessionId, sdp)}
            voiceIce={(candidate) => socket.voiceIce(sessionId, candidate)}
            onRemoteSdp={onRemoteVoiceSdp}
            onRemoteIce={onRemoteVoiceIce}
            setOnRemoteSdp={setOnRemoteVoiceSdp}
            setOnRemoteIce={setOnRemoteVoiceIce}
          />
          <VideoCall
            sessionId={sessionId}
            isPeerA={isPeerA}
            active={videoCallActive}
            videoOffer={(sdp) => socket.videoOffer(sessionId, sdp)}
            videoAnswer={(sdp) => socket.videoAnswer(sessionId, sdp)}
            videoIce={(candidate) => socket.videoIce(sessionId, candidate)}
            onRemoteSdp={onRemoteVideoSdp}
            onRemoteIce={onRemoteVideoIce}
            setOnRemoteSdp={setOnRemoteVideoSdp}
            setOnRemoteIce={setOnRemoteVideoIce}
          />
        </motion.div>
      ) : null}

      {sessions.length > 0 && phase === "idle" && !sessionId && !matchTimeout && (
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
                    <Badge size="sm">{s.endedBy === "self" ? "Ended" : s.endedBy === "peer" ? "Peer left" : "Completed"}</Badge>
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
