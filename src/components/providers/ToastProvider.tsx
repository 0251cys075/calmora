"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

type ToastType = "xp" | "levelUp" | "achievement"

interface Toast {
  id: number
  message: string
  type: ToastType
  amount?: number
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType, amount?: number) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType, amount?: number) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type, amount }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 ${
                toast.type === "levelUp"
                  ? "bg-gradient-to-r from-purple-600/90 to-pink-600/90 border-purple-500/30"
                  : toast.type === "xp"
                  ? "bg-gradient-to-r from-blue-600/90 to-cyan-600/90 border-blue-500/30"
                  : "bg-gradient-to-r from-amber-600/90 to-orange-600/90 border-amber-500/30"
              }`}
            >
              <span className="text-lg">
                {toast.type === "levelUp" ? "🎉" : toast.type === "xp" ? "⭐" : "🏆"}
              </span>
              <div>
                <p className="text-white font-medium text-sm">{toast.message}</p>
                {toast.amount && (
                  <p className="text-white/70 text-xs">+{toast.amount} XP</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {toasts.some((t) => t.type === "levelUp") && (
        <div className="fixed inset-0 pointer-events-none z-[99]">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                background: ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][i % 5],
                animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
