/**
 * @file page.tsx
 * @description React page component for Student Mood Scanner.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Brain, Sparkles } from "lucide-react"

export default function StudentPage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00e5ff] font-heading">Mood Scanner</h1>
          <p className="text-xs text-white/50">AI Facial & Behavioral Wellness Assessment</p>
        </div>
        <Badge variant="premium" size="sm" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
          <Brain className="w-3.5 h-3.5 mr-1" />
          AI Scanner
        </Badge>
      </div>

      {/* ── Stitch Facial Scanner Preview ── */}
      <GlassCard className="p-6 relative overflow-hidden flex flex-col items-center justify-center text-center border border-white/10 shadow-2xl">
        <div className="relative w-full max-w-xs h-64 rounded-2xl overflow-hidden border-2 border-[#00e5ff]/50 bg-black/60 shadow-lg shadow-cyan-500/10 flex items-center justify-center my-2 group">
          {/* Laser scanning beam animation */}
          <motion.div
            animate={{ y: [-120, 120, -120] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-full h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent shadow-[0_0_15px_#00e5ff] z-20"
          />

          <div className="flex flex-col items-center justify-center space-y-2 z-10 p-4">
            <div className="w-16 h-16 rounded-full border border-dashed border-[#00e5ff] flex items-center justify-center animate-spin-slow">
              <Brain className="w-8 h-8 text-[#00e5ff]" />
            </div>
            <span className="text-xs font-mono text-[#00e5ff] uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-[#00e5ff]/30">
              SCANNING...
            </span>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-2 font-mono">
          Align your face within the frame
        </p>
      </GlassCard>

      {/* ── Question Card ── */}
      <GlassCard className="p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider font-mono">
          <span>Currently Analyzing</span>
          <span className="text-[#00e5ff] font-bold">Question 2 of 5</span>
        </div>

        <h3 className="text-sm font-bold text-white font-heading">
          How does your body feel in this exact moment?
        </h3>

        <div className="space-y-2 pt-2">
          {["Light and energetic", "Calm and relaxed", "A bit tense or heavy", "Restless or anxious"].map((opt, idx) => (
            <button
              key={opt}
              className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                idx === 1
                  ? "border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff] shadow-md shadow-cyan-500/10"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ── Analysis & Diagnosis Breakdown ── */}
      <GlassCard className="p-6 border border-cyan-500/30 bg-gradient-to-b from-[#00e5ff]/5 to-transparent text-center space-y-4">
        <span className="text-xs font-bold text-[#00e5ff] uppercase tracking-widest font-mono">
          ANALYSIS BREAKDOWN
        </span>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/40 block mb-1">Quiz Score</span>
            <span className="text-xl font-bold text-white font-heading">85%</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/40 block mb-1">Facial Scan</span>
            <span className="text-xl font-bold text-cyan-300 font-heading">Calm</span>
            <span className="text-[10px] text-white/30 block">Confidence 92%</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-white/50 uppercase tracking-widest block mb-1">Final Diagnosis</span>
          <h2 className="text-3xl font-extrabold text-[#00e5ff] font-heading tracking-wide">
            Your Mood: Serene
          </h2>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button className="flex-1 btn-stitch-primary text-xs py-2.5">
            Save to Journal
          </Button>
          <Button variant="glass" className="flex-1 text-xs py-2.5 border-white/10">
            Retake Assessment
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
