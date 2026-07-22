"use client"

import { useState, useEffect, useCallback } from "react"
import { signInWithPopup } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import type { UserData } from "@/lib/api"

interface AuthState {
  user: UserData | null
  loading: boolean
  error: string | null
}

function getStoredUser(): UserData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("calmora_user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getStoredAccounts(): Record<string, { name: string; email: string; password: string }> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem("calmora_accounts")
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAccount(name: string, email: string, password: string) {
  const accounts = getStoredAccounts()
  accounts[email.toLowerCase()] = { name, email: email.toLowerCase(), password }
  localStorage.setItem("calmora_accounts", JSON.stringify(accounts))
}

function generateId(): string {
  return "user_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createUserData(name: string, email: string, avatar?: string): UserData {
  return {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    calmScore: 850,
    xp: 1200,
    level: 8,
    streak: 5,
    badges: ["Early Adopter", "Mindful Beginner"],
    avatar,
  }
}

function setUser(user: UserData) {
  localStorage.setItem("calmora_user", JSON.stringify(user))
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // On mount, restore user from localStorage
  useEffect(() => {
    const user = getStoredUser()
    setState({ user, loading: false, error: null })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    await new Promise((r) => setTimeout(r, 400))

    const accounts = getStoredAccounts()
    const account = accounts[email.toLowerCase()]

    if (!account) {
      setState((s) => ({ ...s, loading: false, error: "No account found with that email. Please sign up first." }))
      return false
    }
    if (account.password !== password) {
      setState((s) => ({ ...s, loading: false, error: "Incorrect password. Please try again." }))
      return false
    }

    const user = createUserData(account.name, account.email)
    setUser(user)
    setState({ user, loading: false, error: null })
    return true
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    await new Promise((r) => setTimeout(r, 400))

    if (!name.trim()) {
      setState((s) => ({ ...s, loading: false, error: "Please enter your full name." }))
      return false
    }
    if (!email.includes("@")) {
      setState((s) => ({ ...s, loading: false, error: "Please enter a valid email address." }))
      return false
    }
    if (password.length < 6) {
      setState((s) => ({ ...s, loading: false, error: "Password must be at least 6 characters." }))
      return false
    }

    const accounts = getStoredAccounts()
    if (accounts[email.toLowerCase()]) {
      setState((s) => ({ ...s, loading: false, error: "An account with this email already exists. Please sign in." }))
      return false
    }

    saveAccount(name, email, password)
    const user = createUserData(name, email)
    setUser(user)
    setState({ user, loading: false, error: null })
    return true
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const firebase = getFirebaseAuth()
      if (!firebase) {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Google sign-in is not configured yet. Please use email sign-up or guest access.",
        }))
        return false
      }

      const result = await signInWithPopup(firebase.auth, firebase.googleProvider)
      const firebaseUser = result.user

      const user = createUserData(
        firebaseUser.displayName || "Calmora User",
        firebaseUser.email || "user@calmora.app",
        firebaseUser.photoURL || undefined
      )

      setUser(user)
      setState({ user, loading: false, error: null })
      return true
    } catch (err: unknown) {
      let message = "Google sign-in failed. Please try again."
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: string }).code
        if (code === "auth/popup-closed-by-user") {
          message = "Sign-in popup was closed. Please try again."
        } else if (code === "auth/popup-blocked") {
          message = "Pop-up was blocked by your browser. Please allow pop-ups for this site."
        } else if (code === "auth/configuration-not-found" || code === "auth/invalid-api-key") {
          message = "Firebase is not configured yet. Please use email sign-up or guest access."
        }
      }
      setState((s) => ({ ...s, loading: false, error: message }))
      return false
    }
  }, [])

  const guestLogin = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    await new Promise((r) => setTimeout(r, 300))

    const user = createUserData("Guest Explorer", "guest@calmora.app")
    setUser(user)
    setState({ user, loading: false, error: null })
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("calmora_user")
    setState({ user: null, loading: false, error: null })
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    login,
    register,
    loginWithGoogle,
    guestLogin,
    logout,
    clearError,
    isAuthenticated: !!state.user,
  }
}

export function requireAuth(user: UserData | null, loading: boolean): boolean {
  if (loading) return false
  return !!user
}
