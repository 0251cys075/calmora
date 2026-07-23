"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Flag, Ban } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

interface ReportItem {
  _id: string
  reporter: { _id: string; username: string; displayName: string; name: string }
  targetType: string
  target: string
  targetData?: any
  reason: string
  description?: string
  status: string
  createdAt: string
}

interface ModStats {
  userCount: number
  postCount: number
  commentCount: number
  pendingReports: number
  flaggedPosts: number
}

const API = "/api"

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = document.cookie.replace(/(?:(?:^|.*;\s*)calmora_token\s*=\s*([^;]*).*$)|^.*$/, "$1")
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${API}${url}`, { ...options, headers })
  if (!res.ok) throw new Error((await res.json()).error || "Request failed")
  return res.json()
}

export function ModerationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"reports" | "flagged" | "stats">("reports")
  const [reports, setReports] = useState<ReportItem[]>([])
  const [flaggedPosts, setFlaggedPosts] = useState<any[]>([])
  const [stats, setStats] = useState<ModStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) loadAll()
  }, [open])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [reportsRes, flaggedRes, statsRes] = await Promise.all([
        apiFetch<{ reports: ReportItem[] }>("/admin/reports"),
        apiFetch<{ posts: any[] }>("/admin/flagged-posts"),
        apiFetch<{ stats: ModStats }>("/admin/stats"),
      ])
      setReports(reportsRes.reports)
      setFlaggedPosts(flaggedRes.posts)
      setStats(statsRes.stats)
    } catch (err) {
      console.error("Moderation load error:", err)
    }
    setLoading(false)
  }

  const handleAction = useCallback(async (reportId: string, status: string, action?: string) => {
    try {
      await apiFetch(`/admin/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, action }),
      })
      setReports((prev) => prev.filter((r) => r._id !== reportId))
    } catch {}
  }, [])

  const handleModerate = useCallback(async (postId: string, action: string) => {
    try {
      await apiFetch(`/admin/posts/${postId}/moderate`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      })
      setFlaggedPosts((prev) => prev.filter((p) => p._id !== postId))
    } catch {}
  }, [])

  const reasonColors: Record<string, string> = {
    spam: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    harassment: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    abuse: "bg-red-500/10 text-red-300 border-red-500/30",
    hate_speech: "bg-red-500/10 text-red-300 border-red-500/30",
    violence: "bg-rose-600/10 text-rose-300 border-rose-600/30",
    self_harm: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="absolute inset-4 md:inset-8 max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#0a0f1e] shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Moderation Panel</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-white/10 bg-white/5">
              {(["reports", "flagged", "stats"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t ? "bg-blue-500/20 text-blue-300" : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t === "reports" ? "Reports" : t === "flagged" ? "Flagged" : "Stats"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
              ) : tab === "stats" && stats ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Users", value: stats.userCount, icon: "👥" },
                    { label: "Posts", value: stats.postCount, icon: "📝" },
                    { label: "Comments", value: stats.commentCount, icon: "💬" },
                    { label: "Pending Reports", value: stats.pendingReports, icon: "🚩" },
                    { label: "Flagged Posts", value: stats.flaggedPosts, icon: "⚠️" },
                  ].map((s) => (
                    <GlassCard key={s.label}>
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-white/40">{s.label}</p>
                    </GlassCard>
                  ))}
                </div>
              ) : tab === "flagged" ? (
                <div className="space-y-3">
                  {flaggedPosts.length === 0 && <p className="text-center text-white/30 text-sm py-8">No flagged posts</p>}
                  {flaggedPosts.map((post) => (
                    <div key={post._id} className="p-3 rounded-xl bg-white/5 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <Avatar name={post.author?.name || "U"} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{post.author?.name || "Unknown"}</p>
                          <p className="text-sm text-white/70 mt-1">{post.content?.slice(0, 200)}</p>
                          <Badge variant="warning" size="sm" className="mt-2">{post.moderationAction}</Badge>
                          <div className="flex gap-2 mt-2">
                            <Button variant="primary" size="sm" onClick={() => handleModerate(post._id, "approve")}>Approve</Button>
                            <Button variant="danger" size="sm" onClick={() => handleModerate(post._id, "remove")}>Remove</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.length === 0 && <p className="text-center text-white/30 text-sm py-8">No pending reports</p>}
                  {reports.map((report) => (
                    <div key={report._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                          <Flag className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">{report.reporter?.name || "Unknown"}</span>
                            <span className="text-xs text-white/30">reported</span>
                            <Badge variant={report.targetType === "user" ? "danger" : "warning"} size="sm">{report.targetType}</Badge>
                            <Badge className={reasonColors[report.reason] || "bg-white/10 text-white/80"} size="sm">{report.reason}</Badge>
                          </div>
                          {report.description && (
                            <p className="text-xs text-white/50 mt-1">{report.description}</p>
                          )}
                          {report.targetData && (
                            <p className="text-xs text-white/40 mt-1 bg-white/5 p-2 rounded-lg">
                              {report.targetData.content || report.targetData.name || JSON.stringify(report.targetData).slice(0, 100)}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button variant="primary" size="sm" onClick={() => handleAction(report._id, "action_taken", "Content removed")}>
                              <CheckCircle className="w-3 h-3" /> Action Taken
                            </Button>
                            <Button variant="glass" size="sm" onClick={() => handleAction(report._id, "dismissed")}>
                              <XCircle className="w-3 h-3" /> Dismiss
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleAction(report._id, "action_taken", "User banned")}>
                              <Ban className="w-3 h-3" /> Ban User
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
