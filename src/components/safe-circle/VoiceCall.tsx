"use client"

import { useEffect, useRef, useCallback } from "react"

interface VoiceCallProps {
  sessionId: string
  isPeerA: boolean
  active: boolean
  voiceOffer: (sdp: any) => void
  voiceAnswer: (sdp: any) => void
  voiceIce: (candidate: any) => void
  onRemoteSdp: ((sdp: any) => void) | null
  onRemoteIce: ((candidate: any) => void) | null
  setOnRemoteSdp: (fn: ((sdp: any) => void) | null) => void
  setOnRemoteIce: (fn: ((candidate: any) => void) | null) => void
}

export function VoiceCall({
  active, isPeerA, voiceOffer, voiceAnswer, voiceIce,
  onRemoteSdp, onRemoteIce, setOnRemoteSdp, setOnRemoteIce,
}: VoiceCallProps) {
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    setOnRemoteSdp(null)
    setOnRemoteIce(null)
  }, [setOnRemoteSdp, setOnRemoteIce])

  useEffect(() => {
    if (!active) {
      cleanup()
      return
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
    pcRef.current = pc

    pc.onicecandidate = (e) => {
      if (e.candidate) voiceIce(e.candidate)
    }

    pc.ontrack = (e) => {
      const audio = document.createElement("audio")
      audio.srcObject = e.streams[0]
      audio.autoplay = true
      audio.controls = false
      remoteAudioRef.current = audio
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        localStreamRef.current = stream
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      })

    setOnRemoteSdp(() => async (sdp: any) => {
      if (!pcRef.current) return
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp))
      if (!isPeerA) {
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        voiceAnswer(answer)
      }
    })

    setOnRemoteIce(() => async (candidate: any) => {
      if (!pcRef.current) return
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {}
    })

    if (isPeerA) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (pcRef.current?.localDescription) voiceOffer(pcRef.current.localDescription)
        })
    }

    return cleanup
  }, [active])

  return null
}
