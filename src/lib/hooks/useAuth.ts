"use client"

import { useState, useEffect, useCallback } from "react"
import { authApi, type UserData } from "@/lib/api"

interface AuthState {
  user: UserData | null
  loading: boolean
  error: string | null
}

function getStoredUser(): UserData | null {
  try {
    const raw = localStorage.getItem("calmora_user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem("calmora_token")
  } catch {
    return null
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: getStoredUser(),
    loading: !!getStoredToken(),
    error: null,
  })

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setState({ user: null, loading: false, error: null })
      return
    }
    authApi
      .me()
      .then(({ user }) => {
        localStorage.setItem("calmora_user", JSON.stringify(user))
        setState({ user, loading: false, error: null })
      })
      .catch(() => {
        localStorage.removeItem("calmora_token")
        localStorage.removeItem("calmora_user")
        setState({ user: null, loading: false, error: null })
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { token, user } = await authApi.login({ email, password })
      localStorage.setItem("calmora_token", token)
      localStorage.setItem("calmora_user", JSON.stringify(user))
      setState({ user, loading: false, error: null })
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      setState((s) => ({ ...s, loading: false, error: message }))
      return false
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { token, user } = await authApi.register({ name, email, password })
      localStorage.setItem("calmora_token", token)
      localStorage.setItem("calmora_user", JSON.stringify(user))
      setState({ user, loading: false, error: null })
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setState((s) => ({ ...s, loading: false, error: message }))
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("calmora_token")
    localStorage.removeItem("calmora_user")
    setState({ user: null, loading: false, error: null })
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return { ...state, login, register, logout, clearError, isAuthenticated: !!state.user }
}

export function requireAuth(user: UserData | null, loading: boolean): boolean {
  if (loading) return false
  return !!user
}
