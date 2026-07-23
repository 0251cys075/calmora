"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { authApi } from "@/lib/api"
import type { UserData } from "@/lib/api"

interface AuthState {
  user: UserData | null
  loading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  guestLogin: () => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredUser(): UserData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("calmora_user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setStoredUser(user: UserData) {
  localStorage.setItem("calmora_user", JSON.stringify(user))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const checkAuth = async () => {
      try {
        const localUser = getStoredUser()
        if (localUser) {
          setState({ user: localUser, loading: false, error: null })
        }

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 5000)
        )

        const response = await Promise.race([authApi.me(), timeoutPromise])
        setStoredUser(response.user)
        setState({ user: response.user, loading: false, error: null })
      } catch {
        const localUser = getStoredUser()
        if (localUser) {
          setState({ user: localUser, loading: false, error: null })
        } else {
          setState({ user: null, loading: false, error: null })
        }
      }
    }

    checkAuth()

    const firebase = getFirebaseAuth()
    let unsubscribe: (() => void) | undefined
    if (firebase) {
      unsubscribe = onAuthStateChanged(firebase.auth, (firebaseUser) => {
        if (!firebaseUser) {
          const localUser = getStoredUser()
          if (localUser) {
            localStorage.removeItem("calmora_user")
            setState({ user: null, loading: false, error: null })
          }
        }
      })
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const response = await authApi.login({ email, password })
      setStoredUser(response.user)
      setState({ user: response.user, loading: false, error: null })
      return true
    } catch (error: any) {
      const errorMessage = error?.message || "Login failed. Please try again."
      setState((s) => ({ ...s, loading: false, error: errorMessage }))
      return false
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const response = await authApi.register({ name, email, password })
      setStoredUser(response.user)
      setState({ user: response.user, loading: false, error: null })
      return true
    } catch (error: any) {
      const errorMessage = error?.message || "Registration failed. Please try again."
      setState((s) => ({ ...s, loading: false, error: errorMessage }))
      return false
    }
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

      try {
        const result = await signInWithPopup(firebase.auth, firebase.googleProvider)
        const firebaseUser = result.user
        const user: UserData = {
          id: firebaseUser.uid || `google_${Date.now()}`,
          name: firebaseUser.displayName || "Calmora User",
          email: firebaseUser.email || "user@calmora.app",
          calmScore: 850,
          xp: 1200,
          level: 8,
          streak: 5,
          badges: ["Early Adopter", "Mindful Beginner"],
          avatar: firebaseUser.photoURL || undefined,
        }
        setStoredUser(user)
        setState({ user, loading: false, error: null })
        return true
      } catch (popupErr: unknown) {
        const code = (popupErr as { code?: string })?.code ?? ""
        if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
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

    const user: UserData = {
      id: `guest_${Date.now()}`,
      name: "Guest Explorer",
      email: "guest@calmora.app",
      calmScore: 850,
      xp: 1200,
      level: 8,
      streak: 5,
      badges: ["Guest"],
    }
    setStoredUser(user)
    setState({ user, loading: false, error: null })
    return true
  }, [])

  const logout = useCallback(async () => {
    try {
      const firebase = getFirebaseAuth()
      if (firebase) {
        await signOut(firebase.auth)
      }
      try {
        await fetch("/api/auth/logout", { method: "POST" })
      } catch {
        // Ignore if the API is unavailable
      }
    } finally {
      localStorage.removeItem("calmora_user")
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginWithGoogle,
        guestLogin,
        logout,
        clearError,
        isAuthenticated: !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
