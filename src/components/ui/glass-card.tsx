"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = true, glow = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        hover && "cursor-pointer",
        glow && "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function GlassCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 animate-pulse", className)}>
      <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
      <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
      <div className="h-3 bg-white/10 rounded w-2/3" />
    </div>
  )
}
