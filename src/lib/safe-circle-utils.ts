const adjectives = [
  "Quiet","Calm","Gentle","Peace","Soft","Warm","Brave","Kind",
  "Wise","Deep","Pure","True","Free","Light","Still","Bright",
]

const animals = [
  "Owl","Panda","Fox","Bear","Wolf","Deer","Dove","Robin",
  "Lark","Finch","Hare","Fern","Star","Moon","Oak","Reed",
]

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export function generateAnonUsername(): string {
  return `${pick(adjectives)}${pick(animals)}${Math.floor(Math.random() * 99) + 10}`
}

export const TOPICS = ["Anxiety", "Depression", "Stress", "Loneliness", "Grief"] as const
export type Topic = (typeof TOPICS)[number]

export interface SafeCircleSession {
  sessionId: string
  username: string
  peerUsername: string
  topic: Topic
  startTime: number
  endTime: number | null
  endedBy: "self" | "peer" | null
  flagged: boolean
  flaggedKeywords: string[]
}

export interface ChatMessage {
  id: string
  sender: "self" | "peer"
  text: string
  timestamp: number
}

export const CRISIS_KEYWORDS = [
  "kill myself", "end my life", "want to die", "suicide", "self-harm",
  "hurt myself", "not worth living", "better off dead", "end it all",
  "no reason to live", "suicidal",
]

export const PHONE_REGEX = /\b[\+\(]?\d{1,3}[\)\-\s]?\d{3}[\)\-\s]?\d{3,4}[\)\-\s]?\d{3,4}\b/
export const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
export const SOCIAL_REGEX = /(twitter\.com|x\.com|instagram\.com|facebook\.com|t\.me|discord\.gg|linkedin\.com)\/\S+/i
export const LINK_REGEX = /https?:\/\/[^\s]+/gi

export function filterBlockedContent(text: string): { clean: boolean; warnings: string[] } {
  const warnings: string[] = []

  if (PHONE_REGEX.test(text)) warnings.push("Phone numbers are not allowed for safety.")
  if (EMAIL_REGEX.test(text)) warnings.push("Email addresses are not allowed for safety.")
  if (SOCIAL_REGEX.test(text)) warnings.push("Social media handles are not allowed.")
  if (LINK_REGEX.test(text)) warnings.push("External links are not allowed for safety.")

  const clean = warnings.length === 0
  return { clean, warnings }
}

export function detectCrisisKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.filter((kw) => lower.includes(kw))
}

export const HELPLINE_TEXT = "Peer support, not therapy. In crisis? Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741."
