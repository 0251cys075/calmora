"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { VideoOff } from "lucide-react"

interface VideoCallProps {
  sessionId: string
  isPeerA: boolean
  active: boolean
  videoOffer: (sdp: any) => void
  videoAnswer: (sdp: any) => void
  videoIce: (candidate: any) => void
  onRemoteSdp: ((sdp: any) => void) | null
  onRemoteIce: ((candidate: any) => void) | null
  setOnRemoteSdp: (fn: ((sdp: any) => void) | null) => void
  setOnRemoteIce: (fn: ((candidate: any) => void) | null) => void
}

export function VideoCall({
  active, isPeerA, videoOffer, videoAnswer, videoIce,
  onRemoteSdp, onRemoteIce, setOnRemoteSdp, setOnRemoteIce,
}: VideoCallProps) {
  const [error, setError] = useState<string | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

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

    setError(null)
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
    pcRef.current = pc

    pc.onicecandidate = (e) => {
      if (e.candidate) videoIce(e.candidate)
    }

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0]
      }
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => {
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      })
      .catch((err) => {
        setError("Camera access denied. Video requires camera permission.")
      })

    setOnRemoteSdp(() => async (sdp: any) => {
      if (!pcRef.current) return
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp))
      if (!isPeerA) {
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        videoAnswer(answer)
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
          if (pcRef.current?.localDescription) videoOffer(pcRef.current.localDescription)
        })
    }

    return cleanup
  }, [active])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center">
      <div className="relative w-full max-w-4xl aspect-video mx-4 rounded-2xl overflow-hidden bg-black/50 border border-white/10">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-black">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-12 h-12 text-rose-400 mx-auto mb-2" />
              <p className="text-sm text-white/60">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
