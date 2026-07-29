"use client"

/**
 * @file AuthProvider.tsx
 * @description Main React Context provider for user authentication state.
 * Coordinates logins, registration, Google SSO popup/redirects, guest credentials,
 * and handles persistent token/user caches inside localStorage. Interacts with Firebase and Calmora APIs.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { authApi } from "@/lib/api"
import type { UserData } from "@/lib/api"

/**
 * Holds authentication state parameters.
 */
interface AuthState {
  user: UserData | null
  loading: boolean
  error: string | null
}

/**
 * Represents the complete Context value exposed by the AuthProvider.
 */
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  guestLogin: () => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  isAuthenticated: boolean
}

// Internal context to hold authentication values
const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Safe client helper to fetch cached user information.
 * @returns Cached user object or null
 */
function getStoredUser(): UserData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("calmora_user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Caches user profile inside browser local storage.
 * @param user - User data model
 */
function setStoredUser(user: UserData) {
  localStorage.setItem("calmora_user", JSON.stringify(user))
}

/**
 * Caches JWT token inside browser local storage.
 * @param token - JWT token string
 */
function setStoredToken(token: string) {
  localStorage.setItem("calmora_token", token)
}

/**
 * Fetches cached JWT token from local storage.
 * @returns JWT token string or null
 */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("calmora_token")
}

/**
 * Context Provider component that wraps the Calmora application layout
 * and exposes active authentication functions and user status state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  
  // Prevent double-initialization in React strict mode
  const initialized = useRef(false)

  // Side-effect to check existing credentials on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const checkAuth = async () => {
      try {
        const localUser = getStoredUser()
        if (localUser) {
          setState({ user: localUser, loading: false, error: null })
        }

        // Limit checkAuth response to 5 seconds to prevent frozen loadings
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 5000)
        )

        const response = await Promise.race([authApi.me(), timeoutPromise])
        setStoredUser(response.user)
        setState({ user: response.user, loading: false, error: null })
      } catch {
        // Fallback to local cache if offline or backend is unreachable
        const localUser = getStoredUser()
        if (localUser) {
          setState({ user: localUser, loading: false, error: null })
        } else {
          setState({ user: null, loading: false, error: null })
        }
      }
    }

    checkAuth()

    // Setup Firebase state change listener if Firebase is initialized
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

  /**
   * Logs in a user using Email and Password.
   * @param email - User's email address
   * @param password - User's plaintext password
   * @returns Boolean indicating login success status
   */
  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const response = await authApi.login({ email, password })
      setStoredUser(response.user)
      if (response.token) setStoredToken(response.token)
      setState({ user: response.user, loading: false, error: null })
      return true
    } catch (error: any) {
      const errorMessage = error?.message || "Login failed. Please try again."
      setState((s) => ({ ...s, loading: false, error: errorMessage }))
      return false
    }
  }, [])

  /**
   * Registers a new user account with Name, Email, and Password.
   * @param name - Display name of the user
   * @param email - Email address
   * @param password - Secure password
   * @returns Boolean representing registration success
   */
  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const response = await authApi.register({ name, email, password })
      setStoredUser(response.user)
      if (response.token) setStoredToken(response.token)
      setState({ user: response.user, loading: false, error: null })
      return true
    } catch (error: any) {
      const errorMessage = error?.message || "Registration failed. Please try again."
      setState((s) => ({ ...s, loading: false, error: errorMessage }))
      return false
    }
  }, [])

  /**
   * Authenticates using Firebase Google Single Sign-On (Popup with Redirect Fallback).
   * Generates mock wellness state properties for first-time login onboarding.
   * @returns Boolean indicating success
   */
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
          reputation: 50,
          level: 8,
          streak: 5,
          badges: [
            { name: "Early Adopter", icon: "🌟", description: "One of the first users", earnedAt: new Date().toISOString() },
            { name: "Mindful Beginner", icon: "🧘", description: "Started mindfulness journey", earnedAt: new Date().toISOString() },
          ],
          avatar: firebaseUser.photoURL || undefined,
        }
        setStoredUser(user)
        setState({ user, loading: false, error: null })
        return true
      } catch (popupErr: unknown) {
        const code = (popupErr as { code?: string })?.code ?? ""
        // Handle popup blockers by falling back to page redirects
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

  /**
   * Spawns a local mock Guest session for offline exploration.
   * @returns Boolean indicating success
   */
  const guestLogin = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    await new Promise((r) => setTimeout(r, 300))

    const user: UserData = {
      id: `guest_${Date.now()}`,
      name: "Guest Explorer",
      email: "guest@calmora.app",
      calmScore: 850,
      xp: 1200,
      reputation: 0,
      level: 8,
      streak: 5,
      badges: [{ name: "Guest", icon: "👋", description: "Exploring Calmora", earnedAt: new Date().toISOString() }],
    }
    setStoredUser(user)
    setState({ user, loading: false, error: null })
    return true
  }, [])

  /**
   * Ends current session, signing out of Firebase, API routes, and wiping local tokens.
   */
  const logout = useCallback(async () => {
    try {
      const firebase = getFirebaseAuth()
      if (firebase) {
        await signOut(firebase.auth)
      }
      try {
        await fetch("/api/auth/logout", { method: "POST" })
      } catch {
        // Ignore if the API endpoint fails or is offline
      }
    } finally {
      localStorage.removeItem("calmora_user")
      localStorage.removeItem("calmora_token")
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  /**
   * Wipes active authentication error messages from the provider state.
   */
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

/**
 * Custom React hook to consume authentication context.
 * Throws if called outside an AuthProvider wrapper tree.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
