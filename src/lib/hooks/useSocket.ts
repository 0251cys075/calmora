"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import type { Topic } from "@/lib/safe-circle-utils"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface MatchedPayload {
  sessionId: string
  peerUsername: string
  topic: Topic
  isPeerA: boolean
}

interface PeerMessagePayload {
  text: string
  timestamp: number
}

interface QueuedPayload {
  topic: Topic
  position: number
}

interface SocketHandlers {
  onMatched: (data: MatchedPayload) => void
  onQueued: (data: QueuedPayload) => void
  onMatchTimeout: (data: { message: string }) => void
  onMatchCancelled: () => void
  onPeerMessage: (data: PeerMessagePayload) => void
  onPeerTyping: () => void
  onPeerLeft: (data: { reason: string }) => void
  onSessionEnded: () => void
  onVoiceOffer: (data: { sdp: any }) => void
  onVoiceAnswer: (data: { sdp: any }) => void
  onVoiceIce: (data: { candidate: any }) => void
  onVoiceAccepted: () => void
  onVoiceDeclined: () => void
  onVoiceEnded: () => void
  onVideoOffer: (data: { sdp: any }) => void
  onVideoAnswer: (data: { sdp: any }) => void
  onVideoIce: (data: { candidate: any }) => void
  onVideoAccepted: () => void
  onVideoDeclined: () => void
  onVideoEnded: () => void
  onError: (data: { message: string }) => void
}

export function useSocket(handlers: SocketHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/safe-circle`, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket
    setStatus("connecting")

    socket.on("connect", () => {
      setStatus("connected")
      setErrorMsg(null)
    })

    socket.on("connect_error", (err) => {
      setStatus("error")
      setErrorMsg(err.message)
    })

    socket.on("disconnect", () => {
      setStatus("disconnected")
    })

    socket.on("matched", (data: MatchedPayload) => handlersRef.current.onMatched(data))
    socket.on("queued", (data: QueuedPayload) => handlersRef.current.onQueued(data))
    socket.on("match_timeout", (data: { message: string }) => handlersRef.current.onMatchTimeout(data))
    socket.on("match_cancelled", () => handlersRef.current.onMatchCancelled())
    socket.on("peer_message", (data: PeerMessagePayload) => handlersRef.current.onPeerMessage(data))
    socket.on("peer_typing", () => handlersRef.current.onPeerTyping())
    socket.on("peer_left", (data: { reason: string }) => handlersRef.current.onPeerLeft(data))
    socket.on("session_ended", () => handlersRef.current.onSessionEnded())
    socket.on("error", (data: { message: string }) => handlersRef.current.onError(data))

    socket.on("voice_offer", (data: { sdp: any }) => handlersRef.current.onVoiceOffer(data))
    socket.on("voice_answer", (data: { sdp: any }) => handlersRef.current.onVoiceAnswer(data))
    socket.on("voice_ice", (data: { candidate: any }) => handlersRef.current.onVoiceIce(data))
    socket.on("voice_accepted", () => handlersRef.current.onVoiceAccepted())
    socket.on("voice_declined", () => handlersRef.current.onVoiceDeclined())
    socket.on("voice_ended", () => handlersRef.current.onVoiceEnded())

    socket.on("video_offer", (data: { sdp: any }) => handlersRef.current.onVideoOffer(data))
    socket.on("video_answer", (data: { sdp: any }) => handlersRef.current.onVideoAnswer(data))
    socket.on("video_ice", (data: { candidate: any }) => handlersRef.current.onVideoIce(data))
    socket.on("video_accepted", () => handlersRef.current.onVideoAccepted())
    socket.on("video_declined", () => handlersRef.current.onVideoDeclined())
    socket.on("video_ended", () => handlersRef.current.onVideoEnded())

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data)
  }, [])

  const findMatch = useCallback((topic: Topic, username: string) => {
    emit("find_match", { topic, username })
  }, [emit])

  const cancelMatch = useCallback(() => emit("cancel_match"), [emit])
  const sendMessage = useCallback((sessionId: string, text: string) => emit("send_message", { sessionId, text }), [emit])
  const sendTyping = useCallback((sessionId: string) => emit("typing", { sessionId }), [emit])
  const endSession = useCallback((sessionId: string) => emit("end_session", { sessionId }), [emit])
  const reportSession = useCallback((sessionId: string, keywords?: string[]) => emit("report_session", { sessionId, keywords }), [emit])

  const voiceOffer = useCallback((sessionId: string, sdp: any) => emit("voice_offer", { sessionId, sdp }), [emit])
  const voiceAnswer = useCallback((sessionId: string, sdp: any) => emit("voice_answer", { sessionId, sdp }), [emit])
  const voiceIce = useCallback((sessionId: string, candidate: any) => emit("voice_ice", { sessionId, candidate }), [emit])
  const voiceAccept = useCallback((sessionId: string) => emit("voice_accept", { sessionId }), [emit])
  const voiceDecline = useCallback((sessionId: string) => emit("voice_decline", { sessionId }), [emit])
  const voiceEnd = useCallback((sessionId: string) => emit("voice_end", { sessionId }), [emit])

  const videoOffer = useCallback((sessionId: string, sdp: any) => emit("video_offer", { sessionId, sdp }), [emit])
  const videoAnswer = useCallback((sessionId: string, sdp: any) => emit("video_answer", { sessionId, sdp }), [emit])
  const videoIce = useCallback((sessionId: string, candidate: any) => emit("video_ice", { sessionId, candidate }), [emit])
  const videoAccept = useCallback((sessionId: string) => emit("video_accept", { sessionId }), [emit])
  const videoDecline = useCallback((sessionId: string) => emit("video_decline", { sessionId }), [emit])
  const videoEnd = useCallback((sessionId: string) => emit("video_end", { sessionId }), [emit])

  return {
    status, errorMsg, isConnected: status === "connected",
    findMatch, cancelMatch, sendMessage, sendTyping, endSession, reportSession,
    voiceOffer, voiceAnswer, voiceIce, voiceAccept, voiceDecline, voiceEnd,
    videoOffer, videoAnswer, videoIce, videoAccept, videoDecline, videoEnd,
  }
}
