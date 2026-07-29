/**
 * @file badge.tsx
 * @description Reusable inline badge component.
 * Renders small status badges or labels with customized variant highlights
 * (success, warning, danger, info, or premium golden gradients).
 */

"use client"

import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info" | "premium"
  size?: "sm" | "md"
  className?: string
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium backdrop-blur-sm",
        {
          // Size configurations
          "px-2 py-0.5 text-xs": size === "sm",
          "px-3 py-1 text-sm": size === "md",
        },
        {
          // Color variant mappings
          "bg-white/10 text-white/80 border border-white/10": variant === "default",
          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30": variant === "success",
          "bg-amber-500/20 text-amber-300 border border-amber-500/30": variant === "warning",
          "bg-rose-500/20 text-rose-300 border border-rose-500/30": variant === "danger",
          "bg-blue-500/20 text-blue-300 border border-blue-500/30": variant === "info",
          "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30": variant === "premium",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
