/**
 * @file MainLayout.tsx
 * @description React layout component wrapping the core application window.
 * Enforces route guards for protected pathnames, displays global loading screens,
 * manages responsive sidebar toggles, and injects the emergency crisis FAB button.
 */

"use client"

import { Sidebar } from "./Sidebar"
import { ThemeProvider } from "next-themes"
import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/hooks/useAuth"

// List of routes requiring active user authentication sessions
const protectedRoutes = ["/journal", "/habits", "/profile", "/reports", "/challenges", "/community", "/student", "/learn", "/ai-companion", "/relax", "/messages"]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  // Redirect users to auth portal if attempting to access protected routes without active session
  useEffect(() => {
    if (loading) return
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
    if (isProtected && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [pathname, loading, isAuthenticated, router])

  // Global loading skeleton screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse" />
          <p className="text-white/40 text-sm">Loading Calmora...</p>
        </div>
      </div>
    )
  }

  const showSidebar = isAuthenticated && pathname !== "/auth"

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-[#0a0f1e] text-white">
        {showSidebar && <Sidebar />}
        <main className={showSidebar ? "lg:pl-64 min-h-screen" : "min-h-screen"}>
          <div className={showSidebar ? "max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pt-16 lg:pt-8" : "w-full"}>
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

/**
 * Floating Action Button (FAB) pointing to emergency resources page.
 * Persistently visible in lower right viewport corner.
 */
function EmergencyFAB() {
  return (
    <a
      href="/emergency"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-200 group"
      title="Emergency Help & Crisis Support"
    >
      <span className="sr-only">Emergency Help</span>
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white animate-ping-gentle" />
    </a>
  )
}
