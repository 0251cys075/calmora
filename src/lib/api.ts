const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ApiOptions extends RequestInit {
  skipAuth?: boolean
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("calmora_token")
  } catch {
    return null
  }
}

export async function api<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Network error" }))
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("calmora_token")
        localStorage.removeItem("calmora_user")
        window.location.href = "/auth"
      }
    }
    throw new ApiError(error.error || `Request failed with status ${res.status}`, res.status)
  }

  return res.json()
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

export async function withFallback<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
  if (!isOnline()) return fallback
  try {
    return await apiCall()
  } catch {
    return fallback
  }
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api<{ token: string; user: UserData }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  login: (data: { email: string; password: string }) =>
    api<{ token: string; user: UserData }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  me: () => api<{ user: UserData }>("/auth/me"),
}

export interface UserData {
  id: string
  name: string
  email: string
  calmScore: number
  xp: number
  level: number
  avatar?: string
  streak?: number
  badges?: string[]
}

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

export interface JournalEntry {
  _id: string
  title: string
  content: string
  mood?: number
  tags?: string[]
  isGratitude?: boolean
  date: string
}

export interface MoodData {
  _id: string
  mood: number
  note?: string
  tags?: string[]
  date: string
}

export const habitsApi = {
  list: () => api<{ habits: HabitData[] }>("/habits"),
  create: (data: Partial<HabitData>) =>
    api<{ habit: HabitData }>("/habits", { method: "POST", body: JSON.stringify(data) }),
  toggle: (id: string) =>
    api<{ habit: HabitData }>(`/habits/${id}/toggle`, { method: "PATCH" }),
  update: (id: string, data: Partial<HabitData>) =>
    api<{ habit: HabitData }>(`/habits/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    api<{ message: string }>(`/habits/${id}`, { method: "DELETE" }),
}

export const journalApi = {
  list: () => api<{ entries: JournalEntry[] }>("/journal"),
  create: (data: { title?: string; content: string; mood?: number; tags?: string[]; isGratitude?: boolean }) =>
    api<{ entry: JournalEntry }>("/journal", { method: "POST", body: JSON.stringify(data) }),
  summary: () => api<{ summary: { totalEntries: number; avgMood: number; topTopic: string; gratitudeCount: number } }>("/journal/summary"),
}

export const moodsApi = {
  list: () => api<{ moods: MoodData[] }>("/moods"),
  create: (data: { mood: number; note?: string; tags?: string[] }) =>
    api<{ entry: MoodData }>("/moods", { method: "POST", body: JSON.stringify(data) }),
  weekly: () => api<{ weekly: { day: string; value: number | null }[] }>("/moods/weekly"),
}
