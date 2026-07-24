"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Phone, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"

interface CrisisPopupProps {
  open: boolean
  onClose: () => void
}

export function CrisisPopup({ open, onClose }: CrisisPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="max-w-md w-full !p-6 border-rose-500/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/30 to-red-500/30 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">You matter. Help is available.</h3>
                  <p className="text-sm text-white/60">
                    We noticed some concerning language in the conversation. Please know that support is available 24/7.
                  </p>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <a
                  href="tel:988"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-white">988 Suicide & Crisis Lifeline</p>
                    <p className="text-xs text-white/40">Call or text 988 — available 24/7</p>
                  </div>
                </a>

                <a
                  href="sms:741741"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <ExternalLink className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Crisis Text Line</p>
                    <p className="text-xs text-white/40">Text HOME to 741741 — free, 24/7</p>
                  </div>
                </a>

                <a
                  href="https://988lifeline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <ExternalLink className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-white">988lifeline.org</p>
                    <p className="text-xs text-white/40">Online chat with a crisis counselor</p>
                  </div>
                </a>
              </div>

              <div className="mt-4">
                <Button variant="glass" className="w-full" onClick={onClose}>
                  I understand, continue conversation
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
