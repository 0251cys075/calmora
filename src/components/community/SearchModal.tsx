"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Users, Hash, TrendingUp, Loader2 } from "lucide-react"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { communityApi } from "@/lib/community-api"
import { Avatar } from "@/components/ui/avatar"
import type { UserProfile, PostData } from "@/lib/community-api"

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{ users?: UserProfile[]; posts?: PostData[] }>({})
  const [suggestions, setSuggestions] = useState<{ users: UserProfile[]; hashtags: { tag: string; count: number }[] }>({ users: [], hashtags: [] })
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<number>(undefined)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({})
      setSuggestions({ users: [], hashtags: [] })
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      if (query.startsWith("#") || query.startsWith("@")) {
        try {
          const sug = await communityApi.getSuggestions(query.replace(/[@#]/, ""))
          setSuggestions(sug)
        } catch {}
      } else {
        setSearching(true)
        try {
          const res = await communityApi.search(query)
          setResults(res)
        } catch {}
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
    onClose()
  }

  const handleHashtagClick = (tag: string) => {
    setQuery(`#${tag}`)
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
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-0 left-0 right-0 max-w-2xl mx-auto mt-16 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl border border-white/10 bg-[#0a0f1e] shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-2 p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/30 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, posts, hashtags..."
                  className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm"
                  autoFocus
                />
                {searching && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions */}
              {query.length < 2 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-white/40 text-sm mb-3">
                    <TrendingUp className="w-4 h-4" /> Trending searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["#meditation", "#gratitude", "#anxiety", "#mindfulness", "#selfcare", "#motivation"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {((results.users && results.users.length > 0) || (results.posts && results.posts.length > 0)) && (
                <div className="max-h-96 overflow-y-auto p-2">
                  {results.users && results.users.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
                        <Users className="w-3 h-3" /> People
                      </div>
                      {results.users.slice(0, 5).map((u) => (
                        <button
                          key={u._id}
                          onClick={() => handleUserClick(u.username || u._id)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <Avatar src={u.avatar} name={u.displayName || u.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{u.displayName || u.name}</p>
                            <p className="text-xs text-white/40 truncate">@{u.username} · {u.followerCount} followers</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.posts && results.posts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
                        <Hash className="w-3 h-3" /> Posts
                      </div>
                      {results.posts.slice(0, 5).map((p) => (
                        <button
                          key={p._id}
                          onClick={() => { onClose(); router.push(`/community?post=${p._id}`) }}
                          className="w-full flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <Avatar src={p.author?.avatar} name={p.author?.name || "U"} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-white/40">{p.author?.name || "User"}</p>
                            <p className="text-sm text-white/80 truncate">{p.content.slice(0, 100)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions for @ and # */}
              {suggestions.users.length > 0 && (
                <div className="max-h-48 overflow-y-auto p-2 border-t border-white/10">
                  {suggestions.users.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleUserClick(u.username || u._id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                    >
                      <Avatar src={u.avatar} name={u.displayName || u.name} size="sm" />
                      <span className="text-sm text-white">@{u.username}</span>
                    </button>
                  ))}
                  {suggestions.hashtags.map((h) => (
                    <button
                      key={h.tag}
                      onClick={() => handleHashtagClick(h.tag)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                    >
                      <Hash className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white">#{h.tag}</span>
                      <span className="text-xs text-white/30 ml-auto">{h.count} posts</span>
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && !searching && !results.users && !results.posts && suggestions.users.length === 0 && suggestions.hashtags.length === 0 && (
                <div className="p-8 text-center text-white/30 text-sm">No results found</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
