"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, CameraOff, Scan, CheckCircle2, AlertTriangle, RefreshCw, Loader2, Lock, ArrowLeft } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DetectionState = "idle" | "permission-prompt" | "initializing" | "scanning" | "detected" | "success" | "error"

interface ExpressionResult {
  expression: string
  probability: number
}

const EXPRESSION_MOOD_MAP: Record<string, string> = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  fearful: "anxious",
  surprised: "excited",
  neutral: "neutral",
  disgusted: "stressed",
}

const EXPRESSION_LABELS: Record<string, string> = {
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  fearful: "Anxious",
  surprised: "Excited",
  neutral: "Neutral",
  disgusted: "Stressed",
}

interface CameraMoodDetectorProps {
  onMoodDetected: (moodId: string) => void
  disabled?: boolean
  onFallbackToManual?: () => void
}

export function CameraMoodDetector({ onMoodDetected, disabled, onFallbackToManual }: CameraMoodDetectorProps) {
  const [state, setState] = useState<DetectionState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [detectedExpressions, setDetectedExpressions] = useState<ExpressionResult[]>([])
  const [bestMood, setBestMood] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [showGuide, setShowGuide] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accumulatedRef = useRef<Record<string, number[]>>({})
  const scanFramesRef = useRef(0)
  const faceapiRef = useRef<typeof import("face-api.js") | null>(null)

  const scanDuration = 2500
  const totalFrames = 12

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }, [])

  const cleanup = useCallback(() => {
    stopCamera()
    accumulatedRef.current = {}
    scanFramesRef.current = 0
    setScanProgress(0)
    setShowGuide(false)
  }, [stopCamera])

  useEffect(() => {
    return () => { cleanup() }
  }, [cleanup])

  const loadModels = useCallback(async () => {
    if (faceapiRef.current) return
    const faceapi = await import("face-api.js")
    faceapiRef.current = faceapi
    const PATH = "/models"
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(PATH),
      faceapi.nets.faceExpressionNet.loadFromUri(PATH),
    ])
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      throw new Error("Camera access denied or unavailable.")
    }
  }, [])

  const runDetection = useCallback(async () => {
    const faceapi = faceapiRef.current
    if (!faceapi || !videoRef.current) return null
    try {
      return await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceExpressions()
    } catch {
      return null
    }
  }, [])

  const aggregateExpression = useCallback((detections: Awaited<ReturnType<typeof runDetection>>) => {
    if (!detections?.expressions) return
    const arr = detections.expressions.asSortedArray()
    for (const { expression, probability } of arr) {
      if (!accumulatedRef.current[expression]) accumulatedRef.current[expression] = []
      accumulatedRef.current[expression].push(probability)
    }
    if (arr.length > 0) setShowGuide(false)
  }, [])

  const computeBestMood = useCallback(() => {
    const averages: Record<string, number> = {}
    for (const [expr, vals] of Object.entries(accumulatedRef.current)) {
      if (vals.length > 0) {
        averages[expr] = vals.reduce((a, b) => a + b, 0) / vals.length
      }
    }
    const sorted = Object.entries(averages).sort((a, b) => b[1] - a[1])
    const results: ExpressionResult[] = sorted.map(([expression, probability]) => ({ expression, probability }))
    setDetectedExpressions(results)
    if (results.length > 0) {
      const top = results[0]
      const mapped = EXPRESSION_MOOD_MAP[top.expression]
      setBestMood(mapped || "neutral")
    }
  }, [])

  const handleStart = useCallback(async () => {
    setErrorMsg("")
    setDetectedExpressions([])
    setBestMood(null)
    accumulatedRef.current = {}
    scanFramesRef.current = 0
    setScanProgress(0)
    setState("initializing")

    try {
      await loadModels()
      await startCamera()
      setShowGuide(true)
      setState("scanning")

      const intervalTime = scanDuration / totalFrames
      scanIntervalRef.current = setInterval(async () => {
        const detections = await runDetection()
        if (detections) {
          aggregateExpression(detections)
        }
        scanFramesRef.current++
        const progress = Math.min((scanFramesRef.current / totalFrames) * 100, 100)
        setScanProgress(progress)

        if (scanFramesRef.current >= totalFrames) {
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current)
            scanIntervalRef.current = null
          }
          computeBestMood()
          stopCamera()
          setState("success")
          setTimeout(() => setState("detected"), 800)
        }
      }, intervalTime)
    } catch (err: unknown) {
      stopCamera()
      setState("error")
      const msg = err instanceof Error ? err.message : "Failed to access camera."
      setErrorMsg(msg)
    }
  }, [loadModels, startCamera, runDetection, aggregateExpression, computeBestMood, stopCamera])

  const handleRetry = useCallback(() => {
    cleanup()
    setState("idle")
  }, [cleanup])

  const handleConfirm = useCallback(() => {
    if (bestMood) onMoodDetected(bestMood)
    cleanup()
    setState("idle")
  }, [bestMood, onMoodDetected, cleanup])

  const handleCancel = useCallback(() => {
    cleanup()
    setState("idle")
  }, [cleanup])

  const handleFallback = useCallback(() => {
    cleanup()
    setState("idle")
    onFallbackToManual?.()
  }, [cleanup, onFallbackToManual])

  const topExpressions = detectedExpressions.slice(0, 3)
  const secondsLeft = ((totalFrames - scanFramesRef.current) * (scanDuration / totalFrames) / 1000).toFixed(1)
  const hasFaceDetected = Object.keys(accumulatedRef.current).length > 0

  return (
    <div className="space-y-3">
      {state === "idle" && (
        <Button
          variant="glass"
          size="sm"
          className="w-full"
          icon={<Camera className="w-4 h-4" />}
          onClick={() => setState("permission-prompt")}
          disabled={disabled}
        >
          Scan My Mood with Camera
        </Button>
      )}

      <AnimatePresence mode="wait">
        {state === "permission-prompt" && (
          <motion.div
            key="permission"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="border-yellow-500/30">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-white">Privacy Notice</p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    This scans your expression locally in your browser. No image or video is saved or sent to any
                    server. Only your final mood selection is stored.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button variant="primary" size="sm" icon={<Camera className="w-4 h-4" />} onClick={handleStart}>
                      I Understand, Start Scan
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {(state === "initializing" || state === "scanning") && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <GlassCard>
              <div className="relative rounded-xl overflow-hidden bg-black/60">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 md:h-80 object-cover scale-x-[-1]"
                />

                {showGuide && state === "scanning" && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <ellipse
                      cx="50" cy="45" rx="22" ry="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <ellipse
                      cx="50" cy="45" rx="22" ry="28"
                      fill="none"
                      stroke="rgba(59,130,246,0.5)"
                      strokeWidth="0.5"
                    />
                  </svg>
                )}

                {state === "initializing" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                      <p className="text-xs text-white/70">Setting up camera...</p>
                    </div>
                  </div>
                )}

                {state === "scanning" && (
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-white/60 flex items-center gap-1">
                        <Scan className="w-3 h-3" />
                        {hasFaceDetected ? "Face detected" : "Position your face in the frame"}
                      </span>
                      <span className="text-[10px] text-white/60 font-mono">{secondsLeft}s left</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-white/40 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  No images are saved or uploaded — all processing is local
                </p>
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleCancel}>
                  <CameraOff className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
          </motion.div>
        )}

        {state === "detected" && bestMood && (
          <motion.div
            key="detected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <GlassCard className="border-emerald-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Mood Detected</p>
                  <p className="text-xs text-white/50">Detected based on facial expression</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {topExpressions.map((e) => {
                  const moodId = EXPRESSION_MOOD_MAP[e.expression]
                  const isBest = bestMood === moodId
                  return (
                    <button
                      key={e.expression}
                      onClick={() => setBestMood(moodId || "neutral")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        isBest
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      )}
                    >
                      {EXPRESSION_LABELS[e.expression] || e.expression}
                      <span className="ml-1 opacity-60">{(e.probability * 100).toFixed(0)}%</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Button variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleConfirm}>
                  Confirm as {EXPRESSION_LABELS[detectedExpressions[0]?.expression] || bestMood}
                </Button>
                <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={handleRetry}>
                  Retry Scan
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard className="border-rose-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-medium text-white">Camera Unavailable</p>
                  <p className="text-xs text-white/50">
                    {errorMsg || "Could not access camera. Please check your browser permissions."}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={handleRetry}>
                      Try Again
                    </Button>
                    {onFallbackToManual && (
                      <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={handleFallback}>
                        Pick Mood Manually
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
