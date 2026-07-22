"use client"

import { useState, useEffect, useCallback } from "react"
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth"
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

  // On mount, restore user from localStorage AND handle Google redirect result
  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      setState({ user, loading: false, error: null })
      return
    }

    // Check if we're returning from a Google redirect sign-in
    const firebase = getFirebaseAuth()
    if (firebase) {
      setState((s) => ({ ...s, loading: true }))
      getRedirectResult(firebase.auth)
        .then((result) => {
          if (result?.user) {
            const firebaseUser = result.user
            const newUser = createUserData(
              firebaseUser.displayName || "Calmora User",
              firebaseUser.email || "user@calmora.app",
              firebaseUser.photoURL || undefined
            )
            setUser(newUser)
            setState({ user: newUser, loading: false, error: null })
          } else {
            setState({ user: null, loading: false, error: null })
          }
        })
        .catch(() => {
          setState({ user: null, loading: false, error: null })
        })
    } else {
      setState({ user: null, loading: false, error: null })
    }
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

      // Try popup first, fall back to redirect if popup is blocked
      try {
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
      } catch (popupErr: unknown) {
        const code = (popupErr as { code?: string })?.code ?? ""
        // If popup was blocked or not allowed, use redirect flow instead
        if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
          // Redirect flow: page will reload and getRedirectResult will handle it
          await signInWithRedirect(firebase.auth, firebase.googleProvider)
          return true
        }
        throw popupErr
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ""
      let message = `Google sign-in failed (${code || "unknown error"}). Please try again.`
      if (code === "auth/unauthorized-domain") {
        message = "This domain is not authorized in Firebase. Please contact support."
      } else if (code === "auth/configuration-not-found" || code === "auth/invalid-api-key") {
        message = "Firebase is not configured. Please use email sign-up or guest access."
      } else if (code === "auth/network-request-failed") {
        message = "Network error. Check your internet connection and try again."
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
