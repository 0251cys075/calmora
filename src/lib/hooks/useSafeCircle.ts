"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./useLocalStorage"
import { generateAnonUsername, type Topic, type SafeCircleSession } from "@/lib/safe-circle-utils"

interface SessionState {
  status: "idle" | "queuing" | "connected"
  topic: Topic | null
  timeoutId: ReturnType<typeof setTimeout> | null
}

export function useSafeCircle() {
  const [anonUsername] = useState(generateAnonUsername)
  const [sessions, setSessions] = useLocalStorage<SafeCircleSession[]>("calmora_safe_circle_sessions", [])
  const [activeSession, setActiveSession] = useLocalStorage<SafeCircleSession | null>("calmora_active_session", null)
  const [state, setState] = useState<SessionState>({ status: "idle", topic: null, timeoutId: null })

  useEffect(() => {
    return () => {
      if (state.timeoutId) clearTimeout(state.timeoutId)
    }
  }, [state.timeoutId])

  const startMatching = useCallback((topic: Topic) => {
    const timeoutId = setTimeout(() => {
      setState((prev) => ({ ...prev, status: "idle", timeoutId: null }))
    }, 60000)

    setState({ status: "queuing", topic, timeoutId })

    const matchDelay = 2000 + Math.random() * 3000
    setTimeout(() => {
      setState((prev) => {
        if (prev.status !== "queuing") return prev
        if (prev.timeoutId) clearTimeout(prev.timeoutId)

        const peerUsername = generateAnonUsername()
        const session: SafeCircleSession = {
          sessionId: `sc_${Date.now()}`,
          username: anonUsername,
          peerUsername,
          topic,
          startTime: Date.now(),
          endTime: null,
          endedBy: null,
          flagged: false,
          flaggedKeywords: [],
        }
        setActiveSession(session)
        setSessions((prev) => [...prev, session])
        return { status: "connected", topic, timeoutId: null }
      })
    }, matchDelay)
  }, [anonUsername, setActiveSession, setSessions])

  const endSession = useCallback(() => {
    if (!activeSession) return
    const ended: SafeCircleSession = { ...activeSession, endTime: Date.now(), endedBy: "self" }
    setSessions((prev) => prev.map((s) => (s.sessionId === ended.sessionId ? ended : s)))
    setActiveSession(null)
    setState({ status: "idle", topic: null, timeoutId: null })
  }, [activeSession, setActiveSession, setSessions])

  const cancelMatching = useCallback(() => {
    if (state.timeoutId) clearTimeout(state.timeoutId)
    setState({ status: "idle", topic: null, timeoutId: null })
  }, [state.timeoutId])

  const flagSession = useCallback((keywords: string[]) => {
    if (!activeSession) return
    const flagged: SafeCircleSession = { ...activeSession, flagged: true, flaggedKeywords: keywords }
    setActiveSession(flagged)
    setSessions((prev) => prev.map((s) => (s.sessionId === flagged.sessionId ? flagged : s)))
  }, [activeSession, setActiveSession, setSessions])

  return {
    anonUsername,
    sessions,
    activeSession,
    state,
    startMatching,
    cancelMatching,
    endSession,
    flagSession,
  }
}
