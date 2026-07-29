/**
 * @file page.tsx
 * @description React page component for Reports & Analytics.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Download, Sparkles } from "lucide-react"

export default function ReportsPage() {
  const downloadCSV = () => {
    const data = "Date,Mood,HabitScore\n2026-07-29,Peaceful,92"
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "calmora-report.csv"
    link.click()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00e5ff] font-heading">Reports & Analytics</h1>
          <p className="text-xs text-white/50">Review your progress over the last 14 days</p>
        </div>
        <Button onClick={downloadCSV} variant="glass" size="sm">
          <Download className="w-3.5 h-3.5 mr-1 text-[#00e5ff]" />
          Export
        </Button>
      </div>

      {/* ── Stitch Your Insights (4 Stat Grid) ── */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Avg Mood</span>
          <span className="text-xl font-bold text-white font-heading">Peaceful</span>
        </GlassCard>
        <GlassCard className="p-4 border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Habit Score</span>
          <span className="text-xl font-bold text-[#00e5ff] font-heading">92</span>
        </GlassCard>
        <GlassCard className="p-4 border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Journal Days</span>
          <span className="text-xl font-bold text-white font-heading">14</span>
        </GlassCard>
        <GlassCard className="p-4 border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Calm Score</span>
          <span className="text-xl font-bold text-[#00e5ff] font-heading">450</span>
        </GlassCard>
      </div>

      {/* ── Stitch AI Reflection Card ── */}
      <GlassCard className="p-6 border border-[#a855f7]/30 bg-gradient-to-br from-[#a855f7]/15 via-transparent to-[#00e5ff]/10 relative overflow-hidden text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
          <Sparkles className="w-5 h-5 text-purple-300" />
        </div>
        <h3 className="text-sm font-bold text-white font-heading">AI Reflection</h3>
        <p className="text-xs text-white/70 leading-relaxed max-w-md mx-auto">
          Based on your journal entries, you feel most creative in the evenings. Try scheduling reflection then.
        </p>
        <Button className="btn-stitch-ai text-xs py-2 px-6 shadow-md shadow-purple-500/20">
          Schedule Now
        </Button>
      </GlassCard>

      {/* ── Stitch Mood Trend Line Graph ── */}
      <GlassCard className="p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">Mood Trend</h3>
          <span className="text-[10px] text-white/40 font-mono">Last 7 Days</span>
        </div>

        <div className="h-32 w-full flex items-end justify-between gap-2 pt-4 px-2">
          {[40, 65, 30, 80, 50, 90, 75].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ duration: 0.8, delay: idx * 0.08 }}
                className="w-full bg-gradient-to-t from-cyan-500/20 via-cyan-400 to-[#00e5ff] rounded-t-md shadow-md shadow-cyan-500/20"
              />
              <span className="text-[10px] font-mono text-white/40">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Stitch Recent Assessments ── */}
      <GlassCard className="p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">Recent Assessments</h3>
          <span className="text-[10px] text-[#00e5ff] cursor-pointer hover:underline">View All</span>
        </div>

        <div className="space-y-2">
          {[
            { title: "Deep Focus & Clarity", time: "Today, 08:30 AM" },
            { title: "Mild Stress", time: "Yesterday, 06:15 PM" },
            { title: "Creative Energy", time: "Oct 24, 09:00 PM" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div>
                <h4 className="text-xs font-semibold text-white font-heading">{item.title}</h4>
                <span className="text-[10px] text-white/40">{item.time}</span>
              </div>
              <span className="text-xs text-[#00e5ff] font-bold">&rsaquo;</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
