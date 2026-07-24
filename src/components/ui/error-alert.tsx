/**
 * @file error-alert.tsx
 * @description Reusable ErrorAlert UI component.
 * Displays error notice blocks with custom color layouts (warning, danger, info),
 * including optional callback triggers for retrying actions or dismissing notifications.
 */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X, RefreshCw } from "lucide-react"
import { Button } from "./button"

interface ErrorAlertProps {
  error: string | null
  onDismiss?: () => void
  onRetry?: () => void
  variant?: "warning" | "danger" | "info"
}

export function ErrorAlert({ error, onDismiss, onRetry, variant = "warning" }: ErrorAlertProps) {
  if (!error) return null

  const variantStyles = {
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  }

  const iconColors = {
    warning: "text-amber-400",
    danger: "text-rose-400",
    info: "text-blue-400",
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-4 rounded-xl border ${variantStyles[variant]} flex items-start gap-3`}
      >
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[variant]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{error}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Optional Action Retry Trigger Button */}
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              icon={<RefreshCw className="w-4 h-4" />}
              className="h-8 px-2"
            />
          )}
          {/* Optional Action Dismiss Trigger Button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
