"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { categories, getContentByCategory, type ContentItem } from "@/lib/data/content"
import {
  Sparkles, BookOpen, Play, Headphones,
  Search, Bookmark, Clock, ChevronRight, X,
  Pause, Volume2, VolumeX, Rewind, FastForward, FileText
} from "lucide-react"

const videoEmbeds: Record<string, string> = {
  "anx-1": "https://www.youtube.com/embed/QjLOWQqy2MU?cc_load_policy=1&hl=en",
  "str-1": "https://www.youtube.com/embed/o18I23HCQtE?cc_load_policy=1&hl=en",
  "med-1": "https://www.youtube.com/embed/ZToicYcHIOU?cc_load_policy=1&hl=en",
  "pro-1": "https://www.youtube.com/embed/gyDEUtA3pzc?cc_load_policy=1&hl=en",
  "slp-1": "https://www.youtube.com/embed/5MuIMqhT8DM?cc_load_policy=1&hl=en",
  "rel-1": "https://www.youtube.com/embed/i3ku5nx4tMU?cc_load_policy=1&hl=en",
  "stu-1": "https://www.youtube.com/embed/fHfHSq7PVDU?cc_load_policy=1&hl=en",
  "min-1": "https://www.youtube.com/embed/6p_yaNFSYao?cc_load_policy=1&hl=en",
}

const podcastUrls: Record<string, string> = {
  "anx-3": "https://assets.mixkit.co/music/324/324.mp3",
  "str-3": "https://assets.mixkit.co/music/292/292.mp3",
  "med-3": "https://assets.mixkit.co/music/345/345.mp3",
  "pro-3": "https://assets.mixkit.co/music/443/443.mp3",
  "slp-3": "https://assets.mixkit.co/music/584/584.mp3",
  "rel-3": "https://assets.mixkit.co/music/127/127.mp3",
  "stu-3": "https://assets.mixkit.co/music/16/16.mp3",
  "min-3": "https://assets.mixkit.co/music/444/444.mp3",
}

const articleContents: Record<string, { title: string; body: string }> = {
  "anx-2": {
    title: "5 Grounding Techniques for Panic Attacks",
    body: "Grounding techniques are powerful tools that help bring you back to the present moment when anxiety or panic feels overwhelming. Here are five techniques you can use anytime, anywhere:\n\n1. The 5-4-3-2-1 Technique: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.\n\n2. Deep Breathing: Breathe in slowly for 4 counts, hold for 4 counts, and exhale for 6 counts. Repeat 5 times.\n\n3. Physical Grounding: Press your feet firmly into the floor. Notice the sensation of the ground supporting you.\n\n4. Mental Grounding: Name all the countries you can think of, or recite a poem from memory.\n\n5. Comfort Grounding: Hold a warm cup of tea or a soft object. Focus on its texture and temperature.\n\nPractice these techniques regularly so they become second nature when you need them most.",
  },
  "str-2": {
    title: "Workplace Stress Management Guide",
    body: "Managing stress in the workplace is essential for both your mental health and professional performance. Here's a comprehensive guide:\n\nSet Boundaries: Learn to say no to additional tasks when you're at capacity. Communicate your limits clearly and professionally.\n\nTake Regular Breaks: The Pomodoro Technique (25 minutes of focused work followed by a 5-minute break) can significantly reduce stress and improve focus.\n\nCreate a Calming Workspace: Add plants, use a desk fountain, or keep a stress ball nearby. Small environmental changes can have a big impact.\n\nPractice Mindfulness at Work: Take 2-minute breathing breaks between meetings. Close your eyes and focus on your breath.\n\nMove Your Body: Even a 5-minute walk around the office or some desk stretches can release tension and reset your stress levels.\n\nSeek Support: Don't hesitate to talk to your manager about workload concerns or reach out to employee assistance programs.",
  },
  "med-2": {
    title: "10 Common Meditation Myths Debunked",
    body: "Many people avoid meditation due to common misconceptions. Let's clear them up:\n\nMyth 1: I need to empty my mind. Truth: Meditation isn't about stopping thoughts, it's about observing them without judgment.\n\nMyth 2: I need to sit cross-legged on the floor. Truth: You can meditate sitting in a chair, lying down, or even walking.\n\nMyth 3: I need to meditate for 30+ minutes. Truth: Even 2-3 minutes of mindful breathing can be beneficial.\n\nMyth 4: I'm not good at meditating. Truth: There's no such thing as 'bad' meditation. Every time you practice, you're building the skill.\n\nMyth 5: Meditation is a religious practice. Truth: While meditation has roots in various traditions, secular mindfulness is widely practiced and scientifically studied.\n\nMyth 6: I need a special app or equipment. Truth: All you need is your breath and your attention.\n\nMyth 7: Meditation will make me emotionless. Truth: Meditation helps you relate to emotions more skillfully, not eliminate them.\n\nMyth 8: It works immediately. Truth: Like any skill, meditation takes consistent practice. Benefits compound over time.\n\nMyth 9: I'm too busy to meditate. Truth: You can meditate while brushing your teeth, waiting in line, or commuting.\n\nMyth 10: Meditation is selfish. Truth: By improving your own wellbeing, you become more present and kind to others.",
  },
  "pro-2": {
    title: "Build a Productivity System That Works",
    body: "Creating a personalized productivity system is key to sustainable achievement. Follow these steps:\n\n1. Audit Your Time: Track how you spend your time for one week. Identify time-wasting patterns and peak energy hours.\n\n2. Choose Your Method: Popular frameworks include GTD (Getting Things Done), Kanban, Time Blocking, and the Eisenhower Matrix. Pick one that resonates with you.\n\n3. Set Up Your Tools: Use a simple notebook, a digital tool like Notion or Todoist, or a combination. The best tool is the one you'll actually use.\n\n4. Implement the 2-Minute Rule: If a task takes less than 2 minutes, do it immediately.\n\n5. Batch Similar Tasks: Group emails, calls, and administrative work into dedicated time blocks to reduce context switching.\n\n6. Review Weekly: Spend 15 minutes every Friday reviewing what worked, what didn't, and planning the next week.\n\n7. Protect Your Energy: Schedule your most important tasks during your peak energy hours. Reserve low-energy time for routine work.\n\nRemember: Productivity is about working smarter, not harder. The goal is sustainable progress without burnout.",
  },
  "slp-2": {
    title: "Create the Perfect Sleep Environment",
    body: "Your bedroom environment plays a crucial role in sleep quality. Here's how to optimize it:\n\nTemperature: Keep your bedroom between 60-67°F (15-19°C). A cooler room promotes better sleep.\n\nLighting: Use blackout curtains to eliminate external light. Remove or cover electronic LED lights. Consider a sleep mask.\n\nNoise: Use white noise machines, earplugs, or calming nature sounds to mask disruptive noises.\n\nBedding: Invest in a comfortable mattress, pillows, and breathable sheets made of natural fibers like cotton or bamboo.\n\nDeclutter: A tidy, organized bedroom promotes calm. Remove work materials and electronics from view.\n\nAromatherapy: Lavender, chamomile, and sandalwood essential oils can promote relaxation. Use a diffuser or pillow spray.\n\nElectronics: Keep phones, tablets, and laptops out of the bedroom. The blue light disrupts melatonin production.\n\nEstablish a Wind-Down Routine: Dim the lights 30-60 minutes before bed. Read a book, take a warm bath, or practice gentle stretching.",
  },
  "rel-2": {
    title: "Setting Healthy Boundaries",
    body: "Healthy boundaries are essential for maintaining your mental health and building strong relationships. Here's your guide:\n\nWhat Are Boundaries? Boundaries are the limits and rules you set for yourself in relationships. They protect your time, energy, and emotional wellbeing.\n\nTypes of Boundaries: Physical (personal space, touch), Emotional (sharing feelings, taking on others' problems), Time (saying no to extra commitments), Material (lending money or possessions), and Mental (respecting differing opinions).\n\nHow to Set Boundaries: \n1. Identify your limits - notice when you feel resentful or drained\n2. Communicate clearly and directly - 'I need some quiet time after work'\n3. Use 'I' statements - 'I feel overwhelmed when...'\n4. Be consistent - enforce boundaries kindly but firmly\n5. Start small - practice with low-stakes situations\n\nCommon Challenges: Guilt, fear of conflict, people-pleasing habits, and cultural expectations can make boundary-setting difficult. Remember that boundaries are an act of self-care, not selfishness.\n\nSigns You Need Better Boundaries: You feel exhausted after interactions, you often say yes when you want to say no, you feel responsible for others' feelings, or you have difficulty making decisions without input.",
  },
  "stu-2": {
    title: "Study Smarter, Not Harder",
    body: "Evidence-based study techniques can dramatically improve your learning efficiency. Here are the most effective methods:\n\nActive Recall: Instead of re-reading notes, close your book and try to recall the information from memory. This strengthens neural pathways.\n\nSpaced Repetition: Review material at increasing intervals - after 1 day, 3 days, 1 week, 2 weeks, and 1 month. Use flashcards or apps like Anki.\n\nInterleaving: Mix different subjects or types of problems in a single study session instead of focusing on one topic for hours.\n\nElaboration: Explain concepts in your own words, create analogies, and connect new information to things you already know.\n\nThe Pomodoro Technique: Study in focused 25-minute sessions with 5-minute breaks. After 4 Pomodoros, take a longer 15-30 minute break.\n\nTeach Others: The best way to learn is to teach. Explain concepts to a study partner or even an imaginary audience.\n\nOptimize Your Environment: Find a consistent study space, eliminate distractions, and use background music or white noise if it helps you focus.\n\nTake Care of Your Brain: Get adequate sleep (7-9 hours), exercise regularly, stay hydrated, and eat brain-healthy foods like berries, nuts, and fatty fish.",
  },
  "min-2": {
    title: "Mindful Eating: A Complete Guide",
    body: "Mindful eating is the practice of bringing full attention to the experience of eating and drinking. It helps transform your relationship with food:\n\nWhat Is Mindful Eating? It involves paying attention to the colors, smells, textures, flavors, and sensations of food, as well as your body's hunger and fullness cues.\n\nBenefits: Improved digestion, healthier food choices, better portion control, reduced emotional eating, and greater enjoyment of meals.\n\nHow to Practice:\n1. Eat without distractions - no phones, TV, or reading material\n2. Take small bites and chew slowly - aim for 20-30 chews per bite\n3. Put your fork down between bites\n4. Pause halfway through your meal to assess your fullness level\n5. Notice the flavors and textures - what do you taste in each bite?\n6. Check in with your hunger level before, during, and after eating\n\nCommon Mindfulness Exercises for Eating:\n- The Raisin Exercise: Spend 5 minutes eating a single raisin, observing every detail\n- Gratitude Practice: Before eating, take a moment to appreciate where the food came from\n- Hunger Scale: Rate your hunger from 1 (starving) to 10 (stuffed) before and during meals\n\nRemember: Mindful eating isn't about perfection. It's about cultivating awareness and compassion around food.",
  },
}

const typeIcons: Record<string, React.ReactNode> = {
  video: <Play className="w-3 h-3" />,
  article: <BookOpen className="w-3 h-3" />,
  podcast: <Headphones className="w-3 h-3" />,
}

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState("anxiety")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarked, setBookmarked] = useState<string[]>([])
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const [activeVideoTitle, setActiveVideoTitle] = useState("")
  const [activeArticle, setActiveArticle] = useState<{ title: string; body: string } | null>(null)
  const [activePodcastUrl, setActivePodcastUrl] = useState<string | null>(null)
  const [activePodcastTitle, setActivePodcastTitle] = useState("")
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioVolume, setAudioVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastUrlRef = useRef<string | null>(null)

  const content = getContentByCategory(activeCategory)
  const filteredContent = searchQuery.trim()
    ? content.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : content

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const initAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    const audio = new Audio(url)
    audio.addEventListener("timeupdate", () => {
      setAudioCurrentTime(audio.currentTime)
      setAudioProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    })
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration)
    })
    audio.addEventListener("ended", () => {
      setAudioPlaying(false)
      setAudioProgress(0)
      setAudioCurrentTime(0)
    })
    audioRef.current = audio
    lastUrlRef.current = url
  }

  const handlePlay = (item: ContentItem) => {
    setAudioPlaying(false)
    setAudioProgress(0)
    setAudioCurrentTime(0)
    setAudioDuration(0)
    if (item.type === "video") {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
      const embedUrl = videoEmbeds[item.id]
      if (embedUrl) {
        setActiveVideoUrl(embedUrl)
        setActiveVideoTitle(item.title)
        setActivePodcastUrl(null)
        setActiveArticle(null)
      }
    } else if (item.type === "article") {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
      const article = articleContents[item.id]
      if (article) {
        setActiveArticle(article)
        setActiveVideoUrl(null)
        setActivePodcastUrl(null)
      }
    } else if (item.type === "podcast") {
      const url = podcastUrls[item.id]
      if (url) {
        setActivePodcastUrl(url)
        setActivePodcastTitle(item.title)
        setActiveArticle(null)
        setActiveVideoUrl(null)
        initAudio(url)
        audioRef.current?.play().catch(() => {})
        setAudioPlaying(true)
      }
    }
  }

  const toggleAudio = () => {
    if (!activePodcastUrl) return
    if (audioPlaying) {
      audioRef.current?.pause()
      setAudioPlaying(false)
    } else {
      if (!audioRef.current || lastUrlRef.current !== activePodcastUrl) {
        initAudio(activePodcastUrl)
      }
      audioRef.current?.play().catch(() => {})
      setAudioPlaying(true)
    }
  }

  const closeAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setActivePodcastUrl(null)
    setAudioPlaying(false)
    setAudioProgress(0)
    setAudioCurrentTime(0)
    setAudioDuration(0)
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioDuration)
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioDuration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      audioRef.current.currentTime = fraction * audioDuration
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setAudioVolume(vol)
    if (audioRef.current) audioRef.current.volume = vol
  }

  const formatAudioTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Learn Hub</h1>
            <p className="text-white/50 mt-1">Discover resources for your wellness journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border flex-shrink-0 ${
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {categories.find((c) => c.id === activeCategory)?.name || "Content"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContent.map((item: ContentItem, i: number) => (
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
                        <Button variant="ghost" size="sm" onClick={() => handlePlay(item)}>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <GlassCard>
            <h3 className="font-semibold text-white text-sm mb-3">Continue Watching</h3>
            <div className="space-y-2">
              {content.slice(0, 2).map((item) => (
                <div key={item.id} onClick={() => handlePlay(item)} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
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
                { title: "Sleep meditation for tonight", icon: "🌙", query: "sleep" },
                { title: "Anxiety management techniques", icon: "🧠", query: "anxiety" },
                { title: "Morning mindfulness routine", icon: "☀️", query: "mindfulness" },
              ].map((rec) => (
                <div key={rec.title} onClick={() => setActiveCategory(rec.query)} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-sm text-white/70 hover:bg-white/10 cursor-pointer transition-all">
                  <span>{rec.icon}</span>
                  <span className="flex-1 text-xs">{rec.title}</span>
                  <ChevronRight className="w-3 h-3 text-white/30" />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveVideoUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0a0f1e] p-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white truncate px-1">{activeVideoTitle}</h3>
                <button
                  onClick={() => setActiveVideoUrl(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={activeVideoUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; captions"
                  allowFullScreen
                  title={activeVideoTitle}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Podcast Audio Player Modal */}
      <AnimatePresence>
        {activePodcastUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeAudio}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl bg-[#0a0f1e]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <button onClick={closeAudio} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{activePodcastTitle}</h3>
                <p className="text-sm text-white/40 mb-6">Podcast Episode</p>

                <div className="space-y-4">
                  <div
                    className="h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 relative" style={{ width: `${audioProgress}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>{formatAudioTime(audioCurrentTime)}</span>
                    <span>{audioDuration ? formatAudioTime(audioDuration) : "--:--"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={skipBackward}
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                      title="Rewind 10s"
                    >
                      <Rewind className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleAudio}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      {audioPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
                    </button>
                    <button
                      onClick={skipForward}
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                      title="Forward 10s"
                    >
                      <FastForward className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleVolumeChange({ target: { value: audioVolume > 0 ? "0" : "1" } } as any)}
                      className="text-white/40 hover:text-white transition-all"
                    >
                      {audioVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioVolume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Modal */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl bg-[#0a0f1e]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#0a0f1e] border-b border-white/10 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{activeArticle.title}</h3>
                </div>
                <button onClick={() => setActiveArticle(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                {activeArticle.body.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-sm text-white/80 leading-relaxed mb-4">{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
