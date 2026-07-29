"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Book } from "./Bookshelf"

interface BookCardProps {
  book: Book
  onClick: () => void
}

const genreColors: Record<string, string> = {
  stress: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-300",
  anxiety: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300",
  mindfulness: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
  "self-help": "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300",
}

const coverGradients = [
  "from-blue-600/40 to-cyan-600/40",
  "from-purple-600/40 to-pink-600/40",
  "from-emerald-600/40 to-teal-600/40",
  "from-amber-600/40 to-orange-600/40",
  "from-rose-600/40 to-red-600/40",
  "from-indigo-600/40 to-violet-600/40",
]

export function BookCard({ book, onClick }: BookCardProps) {
  const [imageError, setImageError] = useState(false)
  const genreClass = genreColors[book.genre] || genreColors["self-help"]
  const gradientIndex = book.bookId.charCodeAt(1) % coverGradients.length
  const initial = book.title.charAt(0).toUpperCase()
  const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 cursor-pointer hover:border-white/20 transition-all group"
    >
      <div className="relative mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] aspect-[3/4] flex items-center justify-center border border-white/5">
        {book.coverUrl && !imageError ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", coverGradients[gradientIndex])}>
            <span className="text-5xl font-bold text-white/40 select-none">{initial}</span>
          </div>
        )}
        {book.status === "completed" && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/80 text-[10px] font-medium text-white backdrop-blur-sm">
            Read
          </div>
        )}
        {book.status === "reading" && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-white truncate mb-1">{book.title}</h3>
      <p className="text-xs text-white/40 truncate mb-2">{book.author}</p>

      <div className="flex items-center justify-between">
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border bg-gradient-to-r", genreClass)}>
          {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
        </span>
        {book.favorited && <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />}
      </div>

      {progress > 0 && book.status !== "completed" && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/40">Page {book.currentPage}/{book.totalPages}</span>
            <span className="text-white/60">{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
