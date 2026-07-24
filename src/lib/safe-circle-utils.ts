const adjectives = [
  "Quiet", "Calm", "Gentle", "Peace", "Soft", "Warm", "Brave", "Kind",
  "Wise", "Deep", "Pure", "True", "Free", "Light", "Still", "Bright",
]

const animals = [
  "Owl", "Panda", "Fox", "Bear", "Wolf", "Deer", "Dove", "Robin",
  "Lark", "Finch", "Hare", "Fern", "Star", "Moon", "Oak", "Reed",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateAnonUsername(): string {
  const adj = pick(adjectives)
  const animal = pick(animals)
  const num = Math.floor(Math.random() * 99) + 10
  return `${adj}${animal}${num}`
}

export function generatePeerUsername(): string {
  const adj = pick(adjectives)
  const animal = pick(animals)
  const num = Math.floor(Math.random() * 99) + 10
  return `${adj}${animal}${num}`
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

export const PEER_RESPONSES: Record<Topic, string[]> = {
  Anxiety: [
    "I hear you. Anxiety can feel really overwhelming. What does it feel like for you right now?",
    "That sounds really tough. Have you tried any grounding techniques, like the 5-4-3-2-1 exercise?",
    "You're not alone in this. I get anxious too sometimes. What helps you calm down even a little?",
    "It's okay to feel this way. Can you take a slow breath with me? In for 4, out for 4.",
    "I'm glad you're talking about it. That takes courage. What's on your mind most right now?",
    "Anxiety can make everything feel bigger than it is. Is there something specific triggering it?",
  ],
  Depression: [
    "I'm really glad you reached out. Depression can make you feel so alone, but you're not alone here.",
    "That sounds incredibly heavy. You don't have to go through this by yourself. I'm here to listen.",
    "Even just being here and talking is a step forward. What's one small thing you did today?",
    "I know it doesn't always feel like it, but things can get better. What would 'better' look like for you?",
    "Thank you for trusting me with this. Tell me more about how you've been feeling.",
    "Depression lies. It tells you nothing matters, but you matter. What's one thing you used to enjoy?",
  ],
  Stress: [
    "Stress can build up so quietly until it's overwhelming. What's been weighing on you most?",
    "That sounds like a lot to carry. Have you been able to take any time for yourself lately?",
    "Sometimes just naming what's stressing you out can help it feel more manageable. Want to talk through it?",
    "I hear you. What's one thing you could set aside for now to lighten the load?",
    "Your best is enough, even if it doesn't feel like it. What would rest look like for you today?",
    "It's okay to step back and breathe. You don't have to solve everything at once.",
  ],
  Loneliness: [
    "I'm sorry you're feeling lonely. It's one of the hardest feelings. I'm here with you right now.",
    "Loneliness doesn't mean something's wrong with you. It just means you're craving connection.",
    "Thank you for reaching out. That takes real strength. Tell me how your day has been.",
    "You're not invisible. Your feelings matter, and I'm glad you're sharing them with me.",
    "Sometimes loneliness comes from not feeling understood. What would being understood look like?",
    "I'm here. You don't have to go through this alone. What's been on your mind?",
  ],
  Grief: [
    "I'm so sorry for your loss. Grief has no timeline, and whatever you're feeling is valid.",
    "Grief can be so unpredictable. Some days are okay, and others hit hard. How are you doing today?",
    "There's no right way to grieve. Be gentle with yourself. What's one memory you're holding onto?",
    "Thank you for sharing this with me. Losing someone important is incredibly hard.",
    "Grief is love with nowhere to go. It's okay to feel angry, sad, numb, or all of it. I'm here.",
    "You don't have to be strong right now. It's okay to fall apart a little. I'm listening.",
  ],
}
