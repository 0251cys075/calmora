"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, Sparkles, Timer, BarChart3, AlertTriangle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: number
  text: string
  options: { label: string; value: number }[]
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "How was your day?",
    options: [
      { label: "Great", value: 5 },
      { label: "Good", value: 4 },
      { label: "Okay", value: 3 },
      { label: "Tough", value: 2 },
      { label: "Terrible", value: 1 },
    ],
  },
  {
    id: 2,
    text: "How are you feeling right now?",
    options: [
      { label: "Happy", value: 5 },
      { label: "Calm", value: 4 },
      { label: "Neutral", value: 3 },
      { label: "Anxious", value: 2 },
      { label: "Sad", value: 1 },
    ],
  },
  {
    id: 3,
    text: "How well did you sleep?",
    options: [
      { label: "Great", value: 5 },
      { label: "Good", value: 4 },
      { label: "Okay", value: 3 },
      { label: "Badly", value: 2 },
      { label: "Terribly", value: 1 },
    ],
  },
  {
    id: 4,
    text: "How stressed do you feel?",
    options: [
      { label: "Not at all", value: 5 },
      { label: "A little", value: 4 },
      { label: "Somewhat", value: 3 },
      { label: "Quite", value: 2 },
      { label: "Very", value: 1 },
    ],
  },
  {
    id: 5,
    text: "How connected do you feel to others today?",
    options: [
      { label: "Very connected", value: 5 },
      { label: "Somewhat", value: 4 },
      { label: "Neutral", value: 3 },
      { label: "Distant", value: 2 },
      { label: "Alone", value: 1 },
    ],
  },
]

const TIMER_SECONDS = 10
const R = 18
const CIRCUMFERENCE = 2 * Math.PI * R

const SCORE_TO_MOOD: { min: number; max: number; mood: string; emoji: string; label: string; color: string }[] = [
  { min: 80, max: 100, mood: "excited", emoji: "🎉", label: "Excited", color: "from-amber-400 to-yellow-500" },
  { min: 65, max: 79, mood: "happy", emoji: "😊", label: "Happy", color: "from-emerald-400 to-green-500" },
  { min: 50, max: 64, mood: "calm", emoji: "😌", label: "Calm", color: "from-cyan-400 to-blue-500" },
  { min: 35, max: 49, mood: "neutral", emoji: "😐", label: "Neutral", color: "from-slate-400 to-slate-500" },
  { min: 20, max: 34, mood: "stressed", emoji: "😫", label: "Stressed", color: "from-orange-400 to-red-500" },
  { min: 0, max: 19, mood: "anxious", emoji: "😰", label: "Anxious", color: "from-rose-400 to-pink-500" },
]

interface HybridMoodQuizProps {
  onComplete: (moodId: string) => void
  autoStart?: boolean
}

export function HybridMoodQuiz({ onComplete, autoStart = true }: HybridMoodQuizProps) {
  const [phase, setPhase] = useState<"loading" | "quiz" | "scanning" | "results">("loading")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [cameraAvailable, setCameraAvailable] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [quizScore, setQuizScore] = useState(0)
  const [expressionScore, setExpressionScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [resultMood, setResultMood] = useState("")
  const [expressionNote, setExpressionNote] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceapiRef = useRef<typeof import("face-api.js") | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accumulatedRef = useRef<Record<string, number[]>>({})
  const scanFramesRef = useRef(0)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answersRef = useRef<number[]>([])
  const startedRef = useRef(false)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null }
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

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
      return true
    } catch {
      return false
    }
  }, [])

  const startScanning = useCallback(() => {
    const faceapi = faceapiRef.current
    if (!faceapi || !videoRef.current) return

    accumulatedRef.current = {}
    scanFramesRef.current = 0

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current) return
      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
          .withFaceExpressions()
        if (detections?.expressions) {
          const arr = detections.expressions.asSortedArray()
          for (const { expression, probability } of arr) {
            if (!accumulatedRef.current[expression]) accumulatedRef.current[expression] = []
            accumulatedRef.current[expression].push(probability)
          }
        }
      } catch { /* skip frame */ }

      scanFramesRef.current++
    }, 250)
  }, [])

  const computeExpressionScore = useCallback((): number => {
    const totals = accumulatedRef.current
    const averages: Record<string, number> = {}
    for (const [expr, vals] of Object.entries(totals)) {
      if (vals.length > 0) {
        averages[expr] = vals.reduce((a, b) => a + b, 0) / vals.length
      }
    }

    const posEmotions = ["happy", "surprised", "neutral"]
    let posScore = 0
    let totalWeight = 0
    for (const [expr, avg] of Object.entries(averages)) {
      if (posEmotions.includes(expr)) posScore += avg
      else posScore -= avg * 0.5
      totalWeight += avg
    }

    if (totalWeight === 0) return 25
    const normalized = ((posScore / totalWeight) + 1) / 2
    return Math.round(Math.min(Math.max(normalized * 50, 0), 50))
  }, [])

  const finishQuiz = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    const rawQuizScore = answersRef.current.reduce((sum, v) => sum + Math.max(v, 0), 0)
    const normalizedQuizScore = Math.round((rawQuizScore / (QUESTIONS.length * 5)) * 50)
    setQuizScore(normalizedQuizScore)

    const expScore = computeExpressionScore()
    setExpressionScore(expScore)

    stopCamera()
    setPhase("scanning")

    setTimeout(() => {
      const combined = normalizedQuizScore + expScore
      setTotalScore(combined)

      const match = SCORE_TO_MOOD.find((r) => combined >= r.min && combined <= r.max)
      setResultMood(match?.mood || "neutral")
      setPhase("results")
    }, 800)
  }, [computeExpressionScore, stopCamera])

  const advanceQuestion = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCurrentQuestion((prev) => {
      const next = prev + 1
      if (next >= QUESTIONS.length) {
        finishQuiz()
        return prev
      }
      setTimeLeft(TIMER_SECONDS)
      return next
    })
  }, [finishQuiz])

  const handleAnswer = useCallback((value: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    answersRef.current[currentQuestion] = value
    setCurrentQuestion((prev) => {
      const next = prev + 1
      if (next >= QUESTIONS.length) {
        setTimeout(() => finishQuiz(), 100)
        return prev
      }
      setTimeLeft(TIMER_SECONDS)
      return next
    })
  }, [currentQuestion, finishQuiz])

  useEffect(() => {
    if (phase !== "quiz") return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          advanceQuestion()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, currentQuestion, advanceQuestion])

  useEffect(() => {
    if (!autoStart || startedRef.current) return
    startedRef.current = true

    const load = async () => {
      let faceapi: typeof import("face-api.js") | null = null
      let camOk = false

      try {
        faceapi = await import("face-api.js")
        faceapiRef.current = faceapi
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ])
      } catch {
        setErrorMsg("Could not load face detection models. Quiz will proceed with text input only.")
      }

      if (faceapi) {
        camOk = await startCamera()
        if (camOk) setCameraAvailable(true)
      }

      if (!camOk) {
        setCameraAvailable(false)
        setExpressionNote("Camera unavailable — mood will be based on your quiz answers only.")
      } else {
        setTimeout(startScanning, 600)
      }

      answersRef.current = new Array(QUESTIONS.length).fill(0)
      setPhase("quiz")
      setCurrentQuestion(0)
      setTimeLeft(TIMER_SECONDS)
    }

    load()
  }, [autoStart, startCamera, startScanning])

  const handleConfirm = useCallback(() => {
    onComplete(resultMood)
  }, [resultMood, onComplete])

  const q = QUESTIONS[currentQuestion]
  const timerFraction = timeLeft / TIMER_SECONDS
  const timerOffset = CIRCUMFERENCE * (1 - timerFraction)
  const isLowTime = timeLeft <= 3

  if (phase === "loading") {
    return (
      <GlassCard glow className="border-purple-500/20">
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-white/70 font-medium">Initializing Hybrid Assessment</p>
          <p className="text-xs text-white/40">Loading models and camera...</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard glow className="border-purple-500/20 overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center",
          phase === "results" && "animate-pulse"
        )}>
          {phase === "results" ? (
            <span className="text-lg">{SCORE_TO_MOOD.find((r) => r.mood === resultMood)?.emoji}</span>
          ) : (
            <BarChart3 className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <p className="text-base font-semibold text-white">Hybrid Mood Assessment</p>
          {phase === "quiz" && (
            <p className="text-xs text-white/40">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </p>
          )}
        </div>
        {!cameraAvailable && phase !== "results" && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/20 text-[9px] text-amber-300 font-medium border border-amber-500/20">
            Quiz only
          </span>
        )}
      </div>

      {expressionNote && phase !== "results" && (
        <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{expressionNote}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300">{errorMsg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <div className={cn(
            "relative rounded-2xl overflow-hidden bg-black/80 border-2 transition-all duration-500",
            phase === "quiz" && cameraAvailable
              ? "border-purple-500/40 shadow-[0_0_30px_-6px_rgba(168,85,247,0.3)]"
              : "border-white/10",
            phase === "quiz" && cameraAvailable && "animate-pulse-glow"
          )}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "w-full object-cover scale-x-[-1]",
                cameraAvailable ? "aspect-[4/3]" : "h-40",
              )}
            />
            {!cameraAvailable && !expressionNote && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
                <span className="text-xs text-white/60">Starting camera...</span>
              </div>
            )}
            {!cameraAvailable && expressionNote && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-xs text-amber-300/80">Camera unavailable</p>
                  <p className="text-[10px] text-white/40 mt-1">Quiz-only mode active</p>
                </div>
              </div>
            )}
            {cameraAvailable && (
              <div className={cn(
                "absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-medium backdrop-blur-sm border transition-colors",
                phase === "quiz"
                  ? "bg-emerald-500/30 border-emerald-400/40 text-emerald-200"
                  : "bg-white/10 border-white/20 text-white/50"
              )}>
                {phase === "quiz" ? "● Live analysis" : "Analysis complete"}
              </div>
            )}
          </div>

          {phase === "quiz" && q && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-white/30">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    i === currentQuestion ? "bg-purple-400 w-3" : i < currentQuestion ? "bg-purple-400/40" : "bg-white/10"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center min-h-[260px]">
          <AnimatePresence mode="wait">
            {phase === "quiz" && q && (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-medium text-white">{q.text}</p>
                  <div className="relative w-10 h-10 shrink-0 ml-3">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                      <motion.circle
                        cx="20" cy="20" r={R}
                        fill="none"
                        stroke={isLowTime ? "#f43f5e" : "#a78bfa"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={timerOffset}
                        animate={{ strokeDashoffset: timerOffset }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </svg>
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center text-xs font-mono",
                      isLowTime ? "text-rose-400" : "text-white/60"
                    )}>
                      {timeLeft}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <motion.button
                      key={opt.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all text-sm text-white/70 hover:text-white"
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            )}

            {phase === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-400/30 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  </div>
                </div>
                <p className="text-sm text-white/70 font-medium mb-1">Analyzing your responses</p>
                <p className="text-xs text-white/40">Combining quiz answers with expression data...</p>
              </motion.div>
            )}

            {phase === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="text-center mb-4"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30 mb-2"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(168,85,247,0)",
                        "0 0 30px 0 rgba(168,85,247,0.3)",
                        "0 0 0 0 rgba(168,85,247,0)",
                      ],
                    }}
                    transition={{ delay: 0.3, duration: 1.5, repeat: 2 }}
                  >
                    <span className="text-4xl">{SCORE_TO_MOOD.find((r) => r.mood === resultMood)?.emoji}</span>
                  </motion.div>
                  <p className="text-2xl font-bold text-white capitalize">{resultMood}</p>
                  <p className="text-xs text-white/40 mt-1">Combined score: {totalScore}/100</p>
                </motion.div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Quiz score</span>
                      <span className="text-white font-medium">{quizScore}/50</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${quizScore * 2}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Expression score</span>
                      <span className="text-white font-medium">{expressionScore}/50</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${expressionScore * 2}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                      />
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.3 }}
                >
                  <Button
                    variant="primary"
                    className="w-full"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleConfirm}
                  >
                    Confirm as {SCORE_TO_MOOD.find((r) => r.mood === resultMood)?.label || resultMood}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  )
}
