/**
 * @file api.ts
 * @description Central client-side API configuration, helpers, and request wrapper functions.
 * Houses interface/type definitions for model data transferred between frontend and backend.
 */

// Target backend base URL, defaulting to Next.js local proxies if env is not defined
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * Extended options for requests including custom internal flags like skipAuth.
 */
interface ApiOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Core API wrapper function using Fetch. Resolves base URLs, sets content headers,
 * supports credential inclusion (cookies), and parses standardized error messages.
 * @param endpoint - The API endpoint suffix (e.g., "/auth/login")
 * @param options - RequestInit config options and custom Calmora flags
 * @returns Parsed JSON response of generic type T
 */
export async function api<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include", // Include HTTP-only cookies for cross-origin or local session management
  })

  // Handle server errors and non-OK responses
  if (!res.ok) {
    let errorMessage = "An unexpected error occurred"
    try {
      const errorData = await res.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // Fallback to static error messages based on HTTP code if server returns non-JSON
      errorMessage = getStatusMessage(res.status)
    }

    // Auto-logout user on unauthorized requests unless skipAuth is enabled
    if (res.status === 401 && !skipAuth) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("calmora_user")
      }
    }

    throw new ApiError(errorMessage, res.status)
  }

  return res.json()
}

/**
 * Maps standard HTTP status codes to friendly error messages.
 * @param status - HTTP status code
 * @returns Human-friendly error description
 */
function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "You need to sign in to access this feature.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This resource already exists.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable. Please try again.",
    503: "Service unavailable for maintenance. Please check back soon.",
  }
  return messages[status] || `Request failed with status ${status}`
}

/**
 * Standardized custom error class representing API level responses.
 */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/**
 * Checks if the browser client currently has network connectivity.
 * @returns Boolean representing network online state
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

/**
 * Executes a network call, returning a provided fallback value if the network is down or request fails.
 * Used to support offline usability with localStorage.
 * @param apiCall - Asynchronous network request to try
 * @param fallback - Default data to return on failure
 */
export async function withFallback<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
  if (!isOnline()) return fallback
  try {
    return await apiCall()
  } catch {
    return fallback
  }
}

/* ==========================================================================
   AUTHENTICATION API ACTIONS
   ========================================================================== */

export const authApi = {
  // Registers a new user account
  register: (data: { name: string; email: string; password: string }) =>
    api<{ token: string; user: UserData }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  // Authenticates an existing user and returns their token and profile data
  login: (data: { email: string; password: string }) =>
    api<{ token: string; user: UserData }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  // Fetches current authenticated user data using the session token
  me: () => api<{ user: UserData }>("/auth/me", { skipAuth: true }),
}

/* ==========================================================================
   DATA INTERFACES & MODEL DEFINITIONS
   ========================================================================== */

/**
 * Client-side user model interface representing user details, wellness status, and social metrics.
 */
export interface UserData {
  id: string
  name: string
  email: string
  calmScore: number
  xp: number
  reputation: number
  level: number
  avatar?: string
  coverImage?: string
  streak?: number
  longestStreak?: number
  badges?: { name: string; icon: string; description: string; earnedAt: string }[]
  username?: string
  displayName?: string
  bio?: string
  location?: string
  website?: string
  interests?: string[]
  wellnessGoals?: string[]
  followerCount?: number
  followingCount?: number
  postCount?: number
  isAdmin?: boolean
  isVerified?: boolean
  isModerator?: boolean
  createdAt?: string
}

/**
 * Client-side habit model interface representing a daily trackable item.
 */
export interface HabitData {
  _id: string
  name: string
  icon?: string
  color?: string
  completed?: boolean
  streak: number
  logs: { date: string; completed: boolean }[]
  totalCompletions: number
}

/**
 * Client-side journal entry model interface.
 */
export interface JournalEntry {
  _id: string
  title: string
  content: string
  mood?: number
  tags?: string[]
  isGratitude?: boolean
  date: string
}

/**
 * Client-side mood log interface.
 */
export interface MoodData {
  _id: string
  mood: number
  note?: string
  tags?: string[]
  date: string
}

/* ==========================================================================
   DOMAINS-SPECIFIC API ACTIONS
   ========================================================================== */

export const habitsApi = {
  // Lists all habits of the current user
  list: () => api<{ habits: HabitData[] }>("/habits"),
  
  // Creates a new custom trackable habit
  create: (data: Partial<HabitData>) =>
    api<{ habit: HabitData }>("/habits", { method: "POST", body: JSON.stringify(data) }),
  
  // Toggles the completion state of a habit for today
  toggle: (id: string) =>
    api<{ habit: HabitData }>(`/habits/${id}/toggle`, { method: "PATCH" }),
  
  // Modifies an existing habit config
  update: (id: string, data: Partial<HabitData>) =>
    api<{ habit: HabitData }>(`/habits/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  
  // Deletes a habit
  delete: (id: string) =>
    api<{ message: string }>(`/habits/${id}`, { method: "DELETE" }),
}

export const journalApi = {
  // Lists user's private journal entries
  list: () => api<{ entries: JournalEntry[] }>("/journal"),
  
  // Saves a new journal entry with optional mood rating
  create: (data: { title?: string; content: string; mood?: number; tags?: string[]; isGratitude?: boolean }) =>
    api<{ entry: JournalEntry }>("/journal", { method: "POST", body: JSON.stringify(data) }),
  
  // Retrieves analytical summary data from user journals
  summary: () => api<{ summary: { totalEntries: number; avgMood: number; topTopic: string; gratitudeCount: number } }>("/journal/summary"),
}

export const moodsApi = {
  // Retrieves historical mood log entries
  list: () => api<{ moods: MoodData[] }>("/moods"),
  
  // Records a new mood rating and note
  create: (data: { mood: number; note?: string; tags?: string[] }) =>
    api<{ entry: MoodData }>("/moods", { method: "POST", body: JSON.stringify(data) }),
  
  // Retrieves averaged mood value grouped by weekday for the current week
  weekly: () => api<{ weekly: { day: string; value: number | null }[] }>("/moods/weekly"),
}
