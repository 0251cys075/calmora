export interface ContentItem {
  id: string
  title: string
  description: string
  category: string
  type: "video" | "article" | "podcast"
  duration: string
  image: string
  url: string
  completed?: boolean
  bookmarked?: boolean
  progress?: number
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export const categories: Category[] = [
  { id: "anxiety", name: "Anxiety", icon: "🧠", color: "blue", description: "Understand and manage anxiety" },
  { id: "stress", name: "Stress", icon: "💆", color: "purple", description: "Reduce stress and find balance" },
  { id: "meditation", name: "Meditation", icon: "🧘", color: "indigo", description: "Build a meditation practice" },
  { id: "productivity", name: "Productivity", icon: "🎯", color: "emerald", description: "Work smarter, not harder" },
  { id: "sleep", name: "Sleep", icon: "🌙", color: "violet", description: "Improve your sleep quality" },
  { id: "relationships", name: "Relationships", icon: "💝", color: "rose", description: "Build meaningful connections" },
  { id: "student-wellness", name: "Student Wellness", icon: "🎓", color: "sky", description: "Thrive in your academic life" },
  { id: "mindfulness", name: "Mindfulness", icon: "🌿", color: "teal", description: "Live in the present moment" },
]

const categoryItems: Record<string, ContentItem[]> = {
  anxiety: [
    { id: "anx-1", title: "Understanding Anxiety: The Science Behind It", description: "Learn what happens in your brain when you feel anxious and how to work with it.", category: "Anxiety", type: "video", duration: "12 min", image: "/placeholder.svg", url: "#" },
    { id: "anx-2", title: "5 Grounding Techniques for Panic Attacks", description: "Simple yet powerful techniques to bring yourself back to the present moment.", category: "Anxiety", type: "article", duration: "8 min read", image: "/placeholder.svg", url: "#" },
    { id: "anx-3", title: "Living with Anxiety: Stories of Resilience", description: "Real people share their journeys of living with and managing anxiety.", category: "Anxiety", type: "podcast", duration: "34 min", image: "/placeholder.svg", url: "#" },
  ],
  stress: [
    { id: "str-1", title: "The Stress Response: How to Reset", description: "Understand your body's stress response and learn to activate relaxation.", category: "Stress", type: "video", duration: "15 min", image: "/placeholder.svg", url: "#" },
    { id: "str-2", title: "Workplace Stress Management Guide", description: "Practical strategies for managing stress at work.", category: "Stress", type: "article", duration: "10 min read", image: "/placeholder.svg", url: "#" },
    { id: "str-3", title: "Stress Less: Expert Interview Series", description: "Leading psychologists share their best stress management advice.", category: "Stress", type: "podcast", duration: "45 min", image: "/placeholder.svg", url: "#" },
  ],
  meditation: [
    { id: "med-1", title: "Meditation for Beginners: Start Here", description: "Everything you need to begin your meditation practice.", category: "Meditation", type: "video", duration: "20 min", image: "/placeholder.svg", url: "#" },
    { id: "med-2", title: "10 Common Meditation Myths Debunked", description: "Don't let these misconceptions hold you back from practicing.", category: "Meditation", type: "article", duration: "6 min read", image: "/placeholder.svg", url: "#" },
    { id: "med-3", title: "The Power of Daily Meditation", description: "How meditation transforms the brain and improves wellbeing.", category: "Meditation", type: "podcast", duration: "28 min", image: "/placeholder.svg", url: "#" },
  ],
  productivity: [
    { id: "pro-1", title: "Deep Work: The Complete Guide", description: "Master the art of focused, undistracted work.", category: "Productivity", type: "video", duration: "18 min", image: "/placeholder.svg", url: "#" },
    { id: "pro-2", title: "Build a Productivity System That Works", description: "Step-by-step guide to creating a personalized productivity system.", category: "Productivity", type: "article", duration: "12 min read", image: "/placeholder.svg", url: "#" },
    { id: "pro-3", title: "Productivity Without Burnout", description: "How to achieve more without sacrificing your wellbeing.", category: "Productivity", type: "podcast", duration: "38 min", image: "/placeholder.svg", url: "#" },
  ],
  sleep: [
    { id: "slp-1", title: "The Science of Sleep: Why It Matters", description: "Discover what happens to your brain and body during sleep.", category: "Sleep", type: "video", duration: "14 min", image: "/placeholder.svg", url: "#" },
    { id: "slp-2", title: "Create the Perfect Sleep Environment", description: "Optimize your bedroom for deep, restorative sleep.", category: "Sleep", type: "article", duration: "7 min read", image: "/placeholder.svg", url: "#" },
    { id: "slp-3", title: "Sleep Stories: Guided Relaxation", description: "Fall asleep to calming stories and gentle guidance.", category: "Sleep", type: "podcast", duration: "30 min", image: "/placeholder.svg", url: "#" },
  ],
  relationships: [
    { id: "rel-1", title: "The Art of Active Listening", description: "Transform your relationships by learning to truly listen.", category: "Relationships", type: "video", duration: "16 min", image: "/placeholder.svg", url: "#" },
    { id: "rel-2", title: "Setting Healthy Boundaries", description: "A guide to protecting your energy and nurturing relationships.", category: "Relationships", type: "article", duration: "9 min read", image: "/placeholder.svg", url: "#" },
    { id: "rel-3", title: "Communication Skills for Deeper Connections", description: "Expert advice on building stronger relationships.", category: "Relationships", type: "podcast", duration: "42 min", image: "/placeholder.svg", url: "#" },
  ],
  "student-wellness": [
    { id: "stu-1", title: "Managing Exam Stress: Student Guide", description: "Proven techniques to stay calm and focused during exams.", category: "Student Wellness", type: "video", duration: "13 min", image: "/placeholder.svg", url: "#" },
    { id: "stu-2", title: "Study Smarter, Not Harder", description: "Evidence-based study techniques for better learning.", category: "Student Wellness", type: "article", duration: "11 min read", image: "/placeholder.svg", url: "#" },
    { id: "stu-3", title: "College Life & Mental Health", description: "Real students discuss balancing academics and wellbeing.", category: "Student Wellness", type: "podcast", duration: "36 min", image: "/placeholder.svg", url: "#" },
  ],
  mindfulness: [
    { id: "min-1", title: "Mindfulness 101: An Introduction", description: "Learn the fundamentals of mindfulness practice.", category: "Mindfulness", type: "video", duration: "10 min", image: "/placeholder.svg", url: "#" },
    { id: "min-2", title: "Mindful Eating: A Complete Guide", description: "Transform your relationship with food through mindfulness.", category: "Mindfulness", type: "article", duration: "8 min read", image: "/placeholder.svg", url: "#" },
    { id: "min-3", title: "Walking Meditation Practice", description: "A guided walking meditation for everyday mindfulness.", category: "Mindfulness", type: "podcast", duration: "25 min", image: "/placeholder.svg", url: "#" },
  ],
}

export function getContentByCategory(categoryId: string): ContentItem[] {
  return categoryItems[categoryId] || []
}

export function getAllContent(): ContentItem[] {
  return Object.values(categoryItems).flat()
}
