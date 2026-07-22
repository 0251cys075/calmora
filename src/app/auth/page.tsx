"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Brain, Heart, Shield, User, AlertCircle, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"

export default function AuthPage() {
  const router = useRouter()
  const { error, login, register, loginWithGoogle, guestLogin, clearError, isAuthenticated } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!email || !password || (!isLogin && !name)) {
      return
    }
    setSubmitting(true)
    let success: boolean
    if (isLogin) {
      success = await login(email, password)
    } else {
      success = await register(name, email, password)
    }
    setSubmitting(false)
    if (success) {
      router.push("/")
    }
  }

  const handleGoogleLogin = async () => {
    setSubmitting(true)
    clearError()
    const success = await loginWithGoogle()
    setSubmitting(false)
    if (success) {
      router.push("/")
    }
  }

  const handleGuestAccess = async () => {
    setSubmitting(true)
    clearError()
    const success = await guestLogin()
    setSubmitting(false)
    if (success) {
      router.push("/")
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Find Your Calm.<br />
            <span className="text-gradient">Find Your Power.</span>
          </h1>
          <p className="text-white/50 text-lg">Your AI-powered wellness journey starts here.</p>

          <div className="space-y-4 pt-4">
            {[
              { icon: Brain, text: "AI-powered mental wellness companion", color: "text-purple-400" },
              { icon: Heart, text: "Personalized growth & habit tracking", color: "text-rose-400" },
              { icon: Shield, text: "Safe, private, and judgment-free space", color: "text-emerald-400" },
            ].map((feature) => {
              const FeatureIcon = feature.icon
              return (
                <div key={feature.text} className="flex items-center gap-3">
                  <FeatureIcon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-white/70">{feature.text}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <GlassCard glow className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {isLogin ? "Sign in to continue your journey" : "Start your wellness journey today"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-sm text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0a0f1e] text-white/30">or continue with</span>
              </div>
            </div>

            <Button
              variant="glass"
              className="w-full"
              type="button"
              onClick={handleGoogleLogin}
              loading={submitting}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0a0f1e] text-white/20">or</span>
              </div>
            </div>

            <Button
              variant="glass"
              className="w-full"
              type="button"
              onClick={handleGuestAccess}
              loading={submitting}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Try Instant Guest Access
            </Button>

            <p className="text-center text-sm text-white/40 mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); clearError() }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
