"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "gradient" | "success" | "warning"
  showLabel?: boolean
  label?: string
  className?: string
}

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "gradient",
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm text-white/60">{label || "Progress"}</span>
          <span className="text-sm text-white/80 font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn("w-full rounded-full bg-white/10 overflow-hidden", {
          "h-1.5": size === "sm",
          "h-2.5": size === "md",
          "h-4": size === "lg",
        })}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", {
            "bg-gradient-to-r from-blue-500 to-cyan-500": variant === "gradient",
            "bg-white/30": variant === "default",
            "bg-gradient-to-r from-emerald-500 to-teal-500": variant === "success",
            "bg-gradient-to-r from-amber-500 to-orange-500": variant === "warning",
          })}
        />
      </div>
    </div>
  )
}
