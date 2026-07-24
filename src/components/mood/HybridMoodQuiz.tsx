"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertTriangle, Loader2, Sparkles, Timer, BarChart3 } from "lucide-react"
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

const SCORE_TO_MOOD: { min: number; max: number; mood: string; emoji: string; label: string }[] = [
  { min: 80, max: 100, mood: "excited", emoji: "🎉", label: "Excited" },
  { min: 65, max: 79, mood: "happy", emoji: "😊", label: "Happy" },
  { min: 50, max: 64, mood: "calm", emoji: "😌", label: "Calm" },
  { min: 35, max: 49, mood: "neutral", emoji: "😐", label: "Neutral" },
  { min: 20, max: 34, mood: "stressed", emoji: "😫", label: "Stressed" },
  { min: 0, max: 19, mood: "anxious", emoji: "😰", label: "Anxious" },
]

interface HybridMoodQuizProps {
  onComplete: (moodId: string, quizScore: number, expressionScore: number, totalScore: number) => void
}

export function HybridMoodQuiz({ onComplete }: HybridMoodQuizProps) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "scanning" | "results">("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [cameraReady, setCameraReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [quizScore, setQuizScore] = useState(0)
  const [expressionScore, setExpressionScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [resultMood, setResultMood] = useState("")
  const [scanProgress, setScanProgress] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceapiRef = useRef<typeof import("face-api.js") | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accumulatedRef = useRef<Record<string, number[]>>({})
  const scanFramesRef = useRef(0)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answersRef = useRef<number[]>([])

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
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
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
      const pct = Math.min((scanFramesRef.current / 10) * 100, 100)
      setScanProgress(pct)
    }, 250)
  }, [])

  const initQuiz = useCallback(async () => {
    setErrorMsg("")

    const faceapi = await import("face-api.js")
    faceapiRef.current = faceapi
    const PATH = "/models"
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(PATH),
        faceapi.nets.faceExpressionNet.loadFromUri(PATH),
      ])
    } catch {
      setErrorMsg("Failed to load face detection models.")
      return
    }

    const camOk = await startCamera()
    if (!camOk) {
      setErrorMsg("Camera access denied. Quiz will continue without expression analysis.")
    } else {
      setCameraReady(true)
    }

    answersRef.current = new Array(QUESTIONS.length).fill(0)
    setPhase("quiz")
    setCurrentQuestion(0)
    setTimeLeft(TIMER_SECONDS)
    setTimeout(startScanning, 800)
  }, [startCamera, startScanning])

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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, currentQuestion])

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
  }, [])

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
  }, [currentQuestion])

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
    }, 600)
  }, [computeExpressionScore, stopCamera])

  const handleConfirm = useCallback(() => {
    onComplete(resultMood, quizScore, expressionScore, totalScore)
  }, [resultMood, quizScore, expressionScore, totalScore, onComplete])

  const q = QUESTIONS[currentQuestion]
  const progressPercent = ((currentQuestion + (phase === "results" ? 1 : phase === "quiz" ? 0 : 0)) / QUESTIONS.length) * 100

  if (phase === "intro") {
    return (
      <GlassCard glow>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Hybrid Mood Assessment</p>
            <p className="text-xs text-white/50">Quiz + facial expression analysis</p>
          </div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed mb-4">
          Answer 5 quick questions while your camera reads your expression in the background.
          Your final mood is calculated from both sources for a more accurate result.
        </p>
        <Button variant="primary" className="w-full" icon={<Sparkles className="w-4 h-4" />} onClick={initQuiz}>
          Start Assessment
        </Button>
      </GlassCard>
    )
  }

  return (
    <GlassCard glow className="border-purple-500/20">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-white">Hybrid Mood Assessment</span>
        {phase === "quiz" && (
          <span className="ml-auto text-xs text-white/40">
            Question {currentQuestion + 1}/{QUESTIONS.length}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <div className="relative rounded-xl overflow-hidden bg-black/60">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn("w-full object-cover scale-x-[-1]", cameraReady ? "h-32" : "h-24")}
            />
            {!cameraReady && !errorMsg && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
            {cameraReady && (
              <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/60 text-[9px] text-white font-medium">
                  Camera active
                </span>
              </div>
            )}
          </div>
          <p className="text-[9px] text-white/40 mt-1 text-center">
            Camera stays on for the full assessment
          </p>
        </div>

        <div className="md:col-span-3">
          {phase === "quiz" && q && (
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{q.text}</p>
                  <span className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded-full",
                    timeLeft <= 3 ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white/50"
                  )}>
                    <Timer className="w-3 h-3 inline mr-1" />
                    {timeLeft}s
                  </span>
                </div>

                <div className="space-y-1.5">
                  {q.options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs text-white/70 hover:text-white"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
                    style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {phase === "scanning" && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin mb-2" />
              <p className="text-xs text-white/60">Analyzing results...</p>
            </div>
          )}

          {phase === "results" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-3">
                <span className="text-3xl block mb-1">{SCORE_TO_MOOD.find((r) => r.mood === resultMood)?.emoji}</span>
                <p className="text-base font-semibold text-white capitalize">{resultMood}</p>
                <p className="text-xs text-white/50">Combined score: {totalScore}/100</p>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Quiz score</span>
                  <span className="text-white font-medium">{quizScore}/50</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${quizScore * 2}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Expression score</span>
                  <span className="text-white font-medium">{expressionScore}/50</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${expressionScore * 2}%` }} />
                </div>
              </div>

              <Button variant="primary" size="sm" className="w-full" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleConfirm}>
                Confirm as {SCORE_TO_MOOD.find((r) => r.mood === resultMood)?.label || resultMood}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
