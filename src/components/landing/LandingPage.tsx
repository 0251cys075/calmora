/**
 * @file LandingPage.tsx
 * @description React component rendering the promotional public landing page of Calmora.
 * Highlights core value propositions (AI Companion, journaling, habit checklists, mindfulness),
 * showcases system statistics, explains user onboarding steps, and enables guest login triggers.
 */

"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bot, BookOpen, ChartNoAxesColumn, Flower2,
  Wind, Shield, Sparkles, Trophy, ArrowRight,
  Brain, Heart, CheckCircle2, Zap, Lock, Users, Activity
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"

// Framer motion list container animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

// Framer motion list child item animation variants
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function LandingPage() {
  const router = useRouter()
  const { guestLogin } = useAuth()

  /**
   * Generates a temporary guest token to log into the dashboard.
   */
  const handleGuestLogin = async () => {
    await guestLogin()
    router.push("/")
  }

  const benefits = [
    {
      icon: Bot,
      color: "from-purple-500 to-indigo-500",
      title: "24/7 AI Companion Support",
      description: "An empathetic, non-judgmental AI assistant ready to listen, guide your thoughts, and provide instant emotional grounding whenever you need it.",
    },
    {
      icon: BookOpen,
      color: "from-amber-500 to-orange-500",
      title: "Intelligent Reflective Journaling",
      description: "Express your deepest thoughts freely. Features daily prompts, automatic sentiment reflection, and tag-based organization.",
    },
    {
      icon: ChartNoAxesColumn,
      color: "from-cyan-500 to-teal-500",
      title: "Habit & Mood Tracking",
      description: "Build unbreakable daily routines. Monitor habit streaks, track mood fluctuations over time, and calculate your personalized Calm Score.",
    },
    {
      icon: Flower2,
      color: "from-emerald-500 to-green-500",
      title: "21-Day Transformational Challenges",
      description: "Step-by-step guided daily mindfulness & discipline challenges scientifically designed to form lasting positive life habits.",
    },
    {
      icon: Wind,
      color: "from-blue-500 to-cyan-500",
      title: "Guided Relaxation & Breathing",
      description: "Interactive visual breathing exercises and soothing ambient soundscapes designed to reduce stress and anxiety in minutes.",
    },
    {
      icon: Shield,
      color: "from-rose-500 to-red-500",
      title: "Instant Emergency Support",
      description: "Immediate 1-click access to verified emergency helplines, crisis hotlines, and quick grounding exercises when you need help most.",
    },
  ]

  const stats = [
    { value: "98%", label: "User Satisfaction Rate" },
    { value: "21 Days", label: "To Build Lasting Habits" },
    { value: "24/7", label: "AI Mental Wellness Access" },
    { value: "100%", label: "Private & Encrypted" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1e]/80 border-b border-white/10 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Calmora</h1>
              <p className="text-[10px] text-cyan-400 font-medium tracking-widest uppercase">Find your calm. Find your power.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleGuestLogin} className="hidden sm:inline-flex text-xs text-cyan-300 hover:text-white border border-cyan-500/30">
              ⚡ Guest Demo Access
            </Button>
            <Link href="/auth">
              <Button variant="glass" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="hidden sm:inline-flex">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 md:px-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="premium" size="md" className="inline-flex items-center gap-2 px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Next-Gen AI Mental Wellness & Personal Growth Platform</span>
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              Transform Your Mindset.<br />
              <span className="text-gradient">Master Your Daily Life.</span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Calmora combines AI-powered emotional reflection, habit tracking, guided relaxation, and 21-day growth challenges to help you build unbreakable mental resilience.
          </motion.p>

          {/* Form Action Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-xl shadow-blue-500/25">
                Create Account & Unlock All Features
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Button variant="glass" size="lg" onClick={handleGuestLogin} className="w-full sm:w-auto text-base px-8 py-6 border-white/20">
              ⚡ Try Instant Demo Access
            </Button>
          </motion.div>

          <div className="flex items-center justify-center gap-6 text-xs text-white/50 pt-2">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-cyan-400" /> 100% Private & Anonymous</span>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-10 px-4 md:px-8 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-gradient">{s.value}</p>
              <p className="text-xs sm:text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="info" size="md">Why Choose Calmora?</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Designed to Empower Every Aspect of Your Well-being
          </h2>
          <p className="text-white/60">
            Sign up or log in to unlock our suite of tools crafted to help you reduce stress, build consistency, and thrive.
          </p>
        </div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon
            return (
              <motion.div key={idx} variants={item}>
                <GlassCard className="h-full p-6 space-y-4 hover:border-white/20 transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{b.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{b.description}</p>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">How Calmora Works</h2>
            <p className="text-white/50 text-sm">Three simple steps to elevate your mental wellness</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", title: "Fill the Sign-up Form", desc: "Create your free account in 10 seconds to unlock your personalized wellness dashboard." },
              { step: "02", title: "Check-in & Track Daily", desc: "Log your mood, talk to your AI companion, and complete 5-minute mindfulness habits." },
              { step: "03", title: "See Real Growth", desc: "Watch your Calm Score increase and transform your daily mindset with 21-day challenges." },
            ].map((st, i) => (
              <GlassCard key={i} className="p-6 relative overflow-hidden">
                <span className="text-5xl font-black text-white/10 absolute top-4 right-4">{st.step}</span>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm flex items-center justify-center mb-4 border border-blue-500/30">
                  {st.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{st.title}</h3>
                <p className="text-sm text-white/60">{st.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Form Prompt */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto text-center">
        <GlassCard glow className="p-8 md:p-12 space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Ready to Unlock All Calmora Features?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base">
            Fill out the quick sign-up form to access your AI companion, habit tracking, interactive journaling, and emergency wellness tools.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base shadow-lg shadow-blue-500/30">
                Sign Up / Fill Form
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} Calmora — Find your calm. Find your power.</p>
      </footer>
    </div>
  )
}
