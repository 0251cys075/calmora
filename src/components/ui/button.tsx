"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef, useCallback } from "react"

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glass"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, loading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40":
              variant === "primary",
            "bg-white/10 text-white border border-white/10 hover:bg-white/20": variant === "secondary",
            "text-white/70 hover:text-white hover:bg-white/10": variant === "ghost",
            "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/25": variant === "danger",
            "bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10": variant === "glass",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-7 py-3.5 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"
