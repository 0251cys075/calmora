/**
 * @file Sidebar.tsx
 * @description React component rendering the navigation sidebar.
 * Handles responsive layout transformations (mobile slide-out drawer vs desktop persistent column),
 * highlights current route states, lists available navigation routes, and showcases
 * user progress parameters (avatar, user name, level, Calm Score bar, sign out button).
 */

"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Bot,
  Flower2,
  ChartNoAxesColumn,
  BookOpen,
  Trophy,
  FileText,
  Users,
  Music,
  GraduationCap,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  LogOut,
  MessageSquare,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/hooks/useAuth"

// Navigation route mapping config
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
  { href: "/ai-companion", label: "AI Companion", icon: Bot, color: "text-purple-400" },
  { href: "/challenges", label: "Challenges", icon: Flower2, color: "text-emerald-400" },
  { href: "/habits", label: "Habits & Mood", icon: ChartNoAxesColumn, color: "text-cyan-400" },
  { href: "/journal", label: "AI Journal", icon: BookOpen, color: "text-amber-400" },
  { href: "/learn", label: "Learn Hub", icon: Sparkles, color: "text-indigo-400" },
  { href: "/reports", label: "Reports", icon: FileText, color: "text-rose-400" },
  { href: "/community", label: "Community", icon: Users, color: "text-pink-400" },
  { href: "/messages", label: "Messages", icon: MessageSquare, color: "text-cyan-400" },
  { href: "/relax", label: "Relax Zone", icon: Music, color: "text-teal-400" },
  { href: "/student", label: "Student", icon: GraduationCap, color: "text-sky-400" },
  { href: "/emergency", label: "Emergency", icon: AlertTriangle, color: "text-red-400" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  /**
   * Logs out user and redirects to login/onboarding page.
   */
  const handleLogout = async () => {
    await logout()
    setMobileOpen(false)
    router.replace("/auth")
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-[#0a0f1e]/95 backdrop-blur-2xl border-r border-white/10",
          "transform transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-semibold text-lg leading-tight">Calmora</h1>
                <p className="text-[10px] text-white/40 leading-tight truncate">find your calm. find your power</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-lg text-white/50 hover:text-white flex-shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation link elements list */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-white/10 text-white border border-white/10 shadow-sm"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? item.color : "group-hover:" + item.color)} />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Footer user badge info & Calm Score indicators */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {isAuthenticated && user && (
              <Link href={`/profile/${(user as any)?.username || "me"}`} onClick={() => setMobileOpen(false)}>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/40 truncate">Level {user.level} · @{(user as any)?.username || "user"}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-white/60">Calm Score</span>
                <span className="ml-auto text-sm font-semibold text-white">{user?.calmScore || 850}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              </div>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
