"use client"

import { Sidebar } from "./Sidebar"
import { ThemeProvider } from "next-themes"
import { motion } from "framer-motion"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-[#0a0f1e] text-white">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
        <EmergencyFAB />
      </div>
    </ThemeProvider>
  )
}

function EmergencyFAB() {
  return (
    <a
      href="/emergency"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-200 group"
    >
      <span className="sr-only">Emergency Help</span>
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white animate-ping" />
    </a>
  )
}
