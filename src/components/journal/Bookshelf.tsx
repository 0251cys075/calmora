"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, BookMarked, Check, Heart, ArrowLeft, BookOpen, X } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { useToast } from "@/components/providers/ToastProvider"
import { BookCard } from "./BookCard"

export type BookStatus = "reading" | "completed" | "wishlist"
export type BookGenre = "stress" | "anxiety" | "mindfulness" | "self-help"

export interface Book {
  bookId: string
  title: string
  author: string
  genre: BookGenre
  description: string
  coverUrl: string
  progress: number
  status: BookStatus
  favorited: boolean
}

const defaultBooks: Book[] = [
  { bookId: "b1", title: "The Stress Solution", author: "Dr. Rangan Chatterjee", genre: "stress", description: "Learn practical steps to reduce stress and reclaim your calm. This book offers a holistic approach to managing stress through lifestyle changes, mindfulness, and better sleep habits.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
  { bookId: "b2", title: "Unwinding Anxiety", author: "Dr. Judson Brewer", genre: "anxiety", description: "A neuroscience-based approach to breaking the cycle of anxiety. Dr. Brewer explains how habits form and how we can rewire our brains to respond differently to triggers.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
  { bookId: "b3", title: "The Power of Now", author: "Eckhart Tolle", genre: "mindfulness", description: "A guide to spiritual enlightenment and living in the present moment. This transformative book helps readers let go of pain and find peace in the here and now.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
  { bookId: "b4", title: "Atomic Habits", author: "James Clear", genre: "self-help", description: "An easy and proven way to build good habits and break bad ones. Learn how small changes can lead to remarkable results through the power of atomic habits.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
  { bookId: "b5", title: "Why Has Nobody Told Me This Before?", author: "Dr. Julie Smith", genre: "stress", description: "A toolkit for managing everyday mental health challenges. Packed with practical advice and therapeutic techniques for navigating life's ups and downs.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
  { bookId: "b6", title: "The Anxiety Workbook", author: "Dr. Aaron Kaplan", genre: "anxiety", description: "Structured exercises and strategies to manage anxiety. This workbook provides CBT-based techniques, journaling prompts, and actionable steps to regain control.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
  { bookId: "b7", title: "Wherever You Go, There You Are", author: "Jon Kabat-Zinn", genre: "mindfulness", description: "A practical guide to mindfulness meditation for everyday life. Kabat-Zinn shares simple yet profound insights to help you cultivate present-moment awareness.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
  { bookId: "b8", title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", genre: "self-help", description: "Powerful lessons in personal change and effectiveness. This timeless book presents a principle-centered approach for solving personal and professional problems.", coverUrl: "", progress: 0, status: "wishlist", favorited: false },
]

const genres: { value: BookGenre | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "stress", label: "Stress" },
  { value: "anxiety", label: "Anxiety" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "self-help", label: "Self-Help" },
]

function ReadingView({ book, onBack, onUpdate }: { book: Book; onBack: () => void; onUpdate: (updated: Book) => void }) {
  const { showToast } = useToast()

  const handleProgressChange = (amount: number) => {
    const newProgress = Math.min(100, Math.max(0, book.progress + amount))
    onUpdate({ ...book, progress: newProgress, status: newProgress >= 100 ? "completed" : "reading" })
  }

  const handleMarkRead = () => {
    onUpdate({ ...book, progress: 100, status: "completed" })
    showToast("Book marked as read!", "xp", 25)
  }

  const handleToggleFavorite = () => {
    onUpdate({ ...book, favorited: !book.favorited })
    showToast(book.favorited ? "Removed from favorites" : "Added to favorites", "xp")
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to bookshelf
      </button>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 w-full md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-16 h-16 text-white/20" />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{book.title}</h2>
              <p className="text-sm text-white/50 mt-1">by {book.author}</p>
            </div>

            <Badge variant="info" size="sm">
              {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
            </Badge>

            <p className="text-sm text-white/70 leading-relaxed">{book.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Reading Progress</span>
                <span className="text-white font-medium">{book.progress}%</span>
              </div>
              <Progress value={book.progress} size="md" variant={book.status === "completed" ? "success" : "gradient"} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              {book.status !== "completed" && (
                <>
                  <Button size="sm" icon={<BookOpen className="w-4 h-4" />} onClick={() => handleProgressChange(10)}>
                    Start Reading
                  </Button>
                  <Button size="sm" variant="glass" onClick={() => handleProgressChange(10)}>
                    +10% Progress
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant={book.status === "completed" ? "secondary" : "primary"}
                icon={<Check className="w-4 h-4" />}
                onClick={handleMarkRead}
                disabled={book.status === "completed"}
              >
                {book.status === "completed" ? "Completed" : "Mark as Read"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<Heart className={cn("w-4 h-4", book.favorited && "fill-rose-400 text-rose-400")} />}
                onClick={handleToggleFavorite}
              >
                {book.favorited ? "Favorited" : "Add to Favorites"}
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export function Bookshelf() {
  const [books, setBooks] = useLocalStorage<Book[]>("calmora_books", defaultBooks)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [genreFilter, setGenreFilter] = useState<BookGenre | "all">("all")
  const [sortBy, setSortBy] = useState<"progress" | "title">("progress")
  const [searchQuery, setSearchQuery] = useState("")

  const handleUpdateBook = (updated: Book) => {
    setBooks((prev) => prev.map((b) => (b.bookId === updated.bookId ? updated : b)))
  }

  const filteredBooks = useMemo(() => {
    let result = [...books]

    if (genreFilter !== "all") {
      result = result.filter((b) => b.genre === genreFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    }

    result.sort((a, b) => {
      if (sortBy === "progress") return b.progress - a.progress
      return a.title.localeCompare(b.title)
    })

    return result
  }, [books, genreFilter, sortBy, searchQuery])

  const stats = useMemo(() => {
    const total = books.length
    const completed = books.filter((b) => b.status === "completed").length
    const reading = books.filter((b) => b.status === "reading").length
    const favorited = books.filter((b) => b.favorited).length
    return { total, completed, reading, favorited }
  }, [books])

  if (selectedBook) {
    return (
      <ReadingView
        book={selectedBook}
        onBack={() => setSelectedBook(null)}
        onUpdate={(updated) => {
          handleUpdateBook(updated)
          setSelectedBook(updated)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-white/40">Total Books</p>
        </GlassCard>
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
          <p className="text-xs text-white/40">Completed</p>
        </GlassCard>
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.reading}</p>
          <p className="text-xs text-white/40">Reading</p>
        </GlassCard>
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-rose-400">{stats.favorited}</p>
          <p className="text-xs text-white/40">Favorites</p>
        </GlassCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {genres.map((g) => (
            <button
              key={g.value}
              onClick={() => setGenreFilter(g.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                genreFilter === g.value
                  ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
              )}
            >
              {g.label}
            </button>
          ))}
          <button
            onClick={() => setSortBy((prev) => (prev === "progress" ? "title" : "progress"))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/50 hover:text-white/80 transition-all whitespace-nowrap"
          >
            <ChevronDown className="w-3 h-3" />
            {sortBy === "progress" ? "By Progress" : "A-Z"}
          </button>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookMarked className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.bookId} book={book} onClick={() => setSelectedBook(book)} />
          ))}
        </div>
      )}
    </div>
  )
}
