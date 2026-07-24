"use client"

/**
 * @file useAuth.ts
 * @description Re-exports AuthProvider and useAuth hook from the primary provider file,
 * and declares route/page protection helper utilities.
 */

export { AuthProvider, useAuth } from "./AuthProvider"
import type { UserData } from "@/lib/api"

/**
 * Determines whether a route requires authentication and if the user is authenticated.
 * Used by page components to block rendering or trigger redirection.
 * @param user - Active UserData object or null
 * @param loading - State flag representing whether auth checks are in-flight
 * @returns Boolean representing authorization validity
 */
export function requireAuth(user: UserData | null, loading: boolean): boolean {
  if (loading) return false
  return !!user
}
