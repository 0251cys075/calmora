/**
 * @file page.tsx
 * @description React page component for the Emergency Calm helper page.
 * Offers breathing guidance timers, an interactive 5-4-3-2-1 grounding exercise
 * with step trackers, and a list of emergency hotlines/SMS numbers for users experiencing
 * immediate distress.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import {
  AlertTriangle, Phone, Heart, Brain,
  Wind, Music, Shield, ArrowLeft,
  Volume2, MessageCircle, ExternalLink
} from "lucide-react"
import Link from "next/link"

// Box breathing steps configuration
const breathingSteps = [
  { text: "Breathe In", duration: 4000, color: "from-blue-500 to-cyan-500" },
  { text: "Hold", duration: 4000, color: "from-cyan-500 to-teal-500" },
  { text: "Breathe Out", duration: 6000, color: "from-teal-500 to-emerald-500" },
]

// Grounding checklist guidelines
const groundingExercise = [
  "Look around and name 5 things you can see",
  "Name 4 things you can feel right now",
  "Name 3 things you can hear",
  "Name 2 things you can smell",
  "Name 1 thing you can taste",
]

// Professional emergency contacts
const emergencyResources = [
  { name: "National Crisis Hotline", number: "988", description: "24/7 support for mental health crises" },
  { name: "Crisis Text Line", number: "741741", description: "Text HOME to connect with a crisis counselor" },
  { name: "SAMHSA Helpline", number: "1-800-662-4357", description: "Substance abuse and mental health support" },
  { name: "National Suicide Prevention", number: "1-800-273-8255", description: "Confidential support for people in distress" },
]

export default function EmergencyPage() {
  const [activeTab, setActiveTab] = useState<"breathing" | "grounding" | "resources">("breathing")
  const [breathPhase, setBreathPhase] = useState(0)
  const [isBreathing, setIsBreathing] = useState(false)
  const [groundingStep, setGroundingStep] = useState(0)
  const breathInterval = useRef<NodeJS.Timeout | null>(null)

  // Manage breathing phase sequence timers
  useEffect(() => {
    if (!isBreathing) {
      if (breathInterval.current) {
        clearInterval(breathInterval.current)
        breathInterval.current = null
      }
      return
    }

    const duration = breathingSteps[breathPhase]?.duration || 4000
    breathInterval.current = setInterval(() => {
      setBreathPhase((prev) => (prev + 1) % breathingSteps.length)
    }, duration)

    return () => {
      if (breathInterval.current) {
        clearInterval(breathInterval.current)
        breathInterval.current = null
      }
    }
  }, [isBreathing, breathPhase])

  const currentStep = breathingSteps[breathPhase]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h1 className="text-2xl font-bold text-white">Emergency Calm</h1>
              </div>
              <p className="text-white/50 text-sm mt-1">Take a moment. You are safe. Help is here.</p>
            </div>
          </div>
          <Badge variant="danger" size="md">
            <Shield className="w-3.5 h-3.5" /> Immediate Support
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2"
      >
        {[
          { id: "breathing", label: "Breathe", icon: Wind },
          { id: "grounding", label: "Grounding", icon: Brain },
          { id: "resources", label: "Helplines", icon: Phone },
        ].map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                activeTab === tab.id
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      {/* Guided Breathing Subview */}
      {activeTab === "breathing" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key="breathing"
        >
          <GlassCard className="text-center py-12 relative overflow-hidden" glow>
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5" />
            <div className="relative z-10">
              <div className="w-56 h-56 mx-auto relative mb-8">
                {/* Expansive animated scale border ring */}
                <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  isBreathing
                    ? currentStep?.text === "Breathe In"
                      ? "border-blue-400 scale-110 opacity-80"
                      : currentStep?.text === "Hold"
                      ? "border-cyan-400 scale-100 opacity-100"
                      : "border-emerald-400 scale-90 opacity-60"
                    : "border-white/20 scale-100 opacity-40"
                }`} style={{ borderWidth: "3px" }} />
                <div className="absolute inset-4 rounded-full border-2 border-white/10" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isBreathing ? (
                    <motion.div
                      key={breathPhase}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <p className="text-2xl font-bold text-white">{currentStep?.text}</p>
                      <p className="text-sm text-white/50 mt-1">
                        {currentStep?.text === "Breathe In" ? "4" : currentStep?.text === "Hold" ? "4" : "6"} seconds
                      </p>
                    </motion.div>
                  ) : (
                    <Wind className="w-14 h-14 text-white/30" />
                  )}
                </div>
              </div>

              <Button
                size="lg"
                variant={isBreathing ? "secondary" : "danger"}
                onClick={() => setIsBreathing(!isBreathing)}
                icon={isBreathing ? undefined : <Heart className="w-5 h-5" />}
              >
                {isBreathing ? "Stop" : "Start Guided Breathing"}
              </Button>

              <p className="text-sm text-white/40 mt-4">Follow the circle. Breathe in, hold, breathe out.</p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* 5-4-3-2-1 Grounding Subview */}
      {activeTab === "grounding" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key="grounding"
        >
          <GlassCard className="py-10">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">5-4-3-2-1 Grounding</h2>
              <p className="text-white/50 mb-8">Use your senses to anchor yourself in the present moment</p>

              <div className="space-y-3 mb-8">
                {groundingExercise.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      groundingStep === i
                        ? "bg-purple-500/20 border-purple-500/30"
                        : groundingStep > i
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => setGroundingStep(i)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        groundingStep > i
                          ? "bg-emerald-500/20 text-emerald-400"
                          : groundingStep === i
                          ? "bg-purple-500/30 text-purple-300"
                          : "bg-white/10 text-white/40"
                      }`}>
                        {groundingStep > i ? "✓" : i + 1}
                      </div>
                      <span className={`text-sm ${groundingStep > i ? "text-white/50" : groundingStep === i ? "text-white font-medium" : "text-white/70"}`}>
                        {step}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="secondary" size="sm" onClick={() => setGroundingStep(Math.max(0, groundingStep - 1))}>Previous</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (groundingStep < groundingExercise.length - 1) {
                      setGroundingStep(groundingStep + 1)
                    } else {
                      setGroundingStep(0)
                    }
                  }}
                >
                  {groundingStep >= groundingExercise.length - 1 ? "Start Over" : "Next Step"}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Hotline Support Directory Subview */}
      {activeTab === "resources" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key="resources"
        >
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-2">Crisis Resources</h2>
            <p className="text-sm text-white/50 mb-6">If you're in immediate danger, please call 911 or your local emergency services.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyResources.map((resource) => (
                <div key={resource.name} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold text-white">{resource.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-300 mb-1">{resource.number}</p>
                  <p className="text-xs text-white/50">{resource.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard className="bg-rose-500/10 border-rose-500/20">
        <div className="flex items-center gap-4">
          <Heart className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">You are not alone. Help is available 24/7.</p>
            <p className="text-xs text-white/50 mt-1">
              These resources provide free, confidential support from trained professionals.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
