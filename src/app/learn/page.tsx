"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import { categories, getContentByCategory, type ContentItem } from "@/lib/data/content"
import {
  Sparkles, BookOpen, Play, Headphones,
  Search, Bookmark, Clock, ChevronRight
} from "lucide-react"

const typeIcons: Record<string, React.ReactNode> = {
  video: <Play className="w-3 h-3" />,
  article: <BookOpen className="w-3 h-3" />,
  podcast: <Headphones className="w-3 h-3" />,
}

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState("anxiety")
  const [bookmarked, setBookmarked] = useState<string[]>([])

  const content = getContentByCategory(activeCategory)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Learn Hub</h1>
            <p className="text-white/50 mt-1">Discover resources for your wellness journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm w-48"
              />
            </div>
            <Button variant="glass" size="sm" icon={<Bookmark className="w-4 h-4" />}>
              Bookmarks
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">
            {categories.find((c) => c.id === activeCategory)?.name || "Content"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.map((item: ContentItem, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard hover>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {typeIcons[item.type] || <BookOpen className="w-6 h-6 text-white/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" size="sm">{item.type}</Badge>
                        <span className="text-xs text-white/30">{item.duration}</span>
                      </div>
                      <h3 className="font-medium text-white text-sm">{item.title}</h3>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm">
                          <Play className="w-3 h-3" />
                          {item.type === "video" ? "Watch" : item.type === "article" ? "Read" : "Listen"}
                        </Button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setBookmarked((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]) }}
                          className={`p-1 rounded-lg transition-all ${bookmarked.includes(item.id) ? "text-amber-400" : "text-white/30 hover:text-white/60"}`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <GlassCard>
            <h3 className="font-semibold text-white text-sm mb-3">Continue Watching</h3>
            <div className="space-y-2">
              {content.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    {typeIcons[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{item.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      </div>
                      <span className="text-[10px] text-white/30">33%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold text-white text-sm mb-3">AI Recommended</h3>
            <div className="space-y-2">
              {[
                { title: "Sleep meditation for tonight", icon: "🌙" },
                { title: "Anxiety management techniques", icon: "🧠" },
                { title: "Morning mindfulness routine", icon: "☀️" },
              ].map((rec) => (
                <div key={rec.title} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-sm text-white/70 hover:bg-white/10 cursor-pointer transition-all">
                  <span>{rec.icon}</span>
                  <span className="flex-1 text-xs">{rec.title}</span>
                  <ChevronRight className="w-3 h-3 text-white/30" />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
