"use client"

export { AuthProvider, useAuth } from "./AuthProvider"
import type { UserData } from "@/lib/api"

export function requireAuth(user: UserData | null, loading: boolean): boolean {
  if (loading) return false
  return !!user
}
