"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ChevronDown, BookMarked, Check, Heart, ArrowLeft, BookOpen, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { useToast } from "@/components/providers/ToastProvider"
import { BookCard } from "./BookCard"

export type BookStatus = "reading" | "completed" | "wishlist"
export type BookGenre = "stress" | "anxiety" | "mindfulness" | "self-help"

export interface Book {
  bookId: string
  title: string
  author: string
  genre: BookGenre
  description: string
  isbn: string
  coverUrl: string
  currentPage: number
  totalPages: number
  status: BookStatus
  favorited: boolean
  content: string[]
  externalUrl: string
}

const defaultBooks: Book[] = [
  {
    bookId: "b1", title: "The Stress Solution", author: "Dr. Rangan Chatterjee", genre: "stress",
    description: "Learn practical steps to reduce stress and reclaim your calm. This book offers a holistic approach to managing stress through lifestyle changes, mindfulness, and better sleep habits.",
    isbn: "9780241984969", coverUrl: "https://covers.openlibrary.org/b/isbn/9780241984969-L.jpg",
    currentPage: 0, totalPages: 12, status: "wishlist", favorited: false,
    content: [
      "Chapter 1: Understanding Stress\n\nStress is not always the enemy. In fact, short bursts of stress can help you perform better, meet deadlines, and stay alert in dangerous situations. The problem arises when stress becomes chronic—when your body remains in a state of high alert long after the threat has passed.\n\nDr. Rangan Chatterjee explains that stress is fundamentally a modern problem. Our bodies evolved to handle immediate physical threats, but today's stressors are often psychological and persistent: work pressure, financial worries, relationship challenges, and the constant buzz of technology.",
      "Chapter 2: The Four Pillars\n\nChatterjee's approach to stress reduction is built on four pillars: relaxation, diet, movement, and sleep. Each pillar interacts with the others—improving your sleep quality, for example, can dramatically reduce your stress response during the day.\n\nThe key insight is that you don't need to overhaul your entire life at once. Small, sustainable changes in each pillar compound over time, creating a foundation of resilience that protects you against stress.",
      "Chapter 3: The Relaxation Response\n\nWhen you activate your body's relaxation response, heart rate slows, blood pressure drops, and stress hormone levels normalize. The simplest way to trigger this response? Breathing. Just five minutes of slow, deep breathing each day can shift your nervous system from fight-or-flight to rest-and-digest.\n\nThe 4-7-8 breathing technique—inhale for 4 seconds, hold for 7, exhale for 8—is particularly effective. Practice it twice daily, and you will notice a significant reduction in your baseline anxiety.",
      "Chapter 4: Nutrition and Stress\n\nThe food you eat directly affects your stress levels. High-sugar diets cause blood sugar spikes and crashes that mimic and amplify stress responses. Caffeine triggers cortisol release. Even skipping meals can leave you feeling frazzled and irritable.\n\nChatterjee recommends starting with one simple change: eating a protein-rich breakfast. This stabilizes blood sugar and provides the amino acids needed for neurotransmitter production, including serotonin—your brain's natural mood stabilizer.",
      "Chapter 5: Movement as Medicine\n\nExercise is one of the most powerful tools for stress management, but it doesn't have to mean running marathons or spending hours at the gym. Even ten minutes of walking can significantly reduce cortisol levels.\n\nThe goal is to move in ways that feel good, not punishing. A gentle yoga session, a dance break in your living room, or a walk in nature all count. The consistency matters more than the intensity.",
      "Chapter 6: Sleep and Recovery\n\nSleep is when your body repairs itself. Chronic stress disrupts sleep, creating a vicious cycle: poor sleep increases stress, and stress makes it harder to sleep. Breaking this cycle requires intention.\n\nChatterjee advocates for a wind-down routine: no screens an hour before bed, a cool dark room, and a consistent sleep schedule. Even on weekends, waking up at the same time helps regulate your body's internal clock.",
      "Chapter 7: The Digital Detox\n\nSmartphones and constant notifications keep our brains in a state of perpetual low-grade stress. The average person checks their phone 96 times a day. Each notification triggers a small cortisol spike.\n\nTry a digital sunset: put your phone away two hours before bed. Designate phone-free zones in your home. You'll be surprised at how much calmer you feel when you are not constantly available to everyone all the time.",
      "Chapter 8: Bringing It All Together\n\nStress management is not about eliminating stress entirely—that is neither possible nor desirable. It is about building a lifestyle that allows you to handle stress when it comes, recover quickly, and protect your long-term health.\n\nStart with one pillar. Maybe it is five minutes of breathing each morning. Maybe it is a ten-minute walk after dinner. Build from there. Small steps, consistently taken, lead to profound change.",
    ],
    externalUrl: "https://books.google.com/books?id=dummy_stress_solution",
  },
  {
    bookId: "b2", title: "Unwinding Anxiety", author: "Dr. Judson Brewer", genre: "anxiety",
    description: "A neuroscience-based approach to breaking the cycle of anxiety. Dr. Brewer explains how habits form and how we can rewire our brains to respond differently to triggers.",
    isbn: "9780593330449", coverUrl: "https://covers.openlibrary.org/b/isbn/9780593330449-L.jpg",
    currentPage: 0, totalPages: 10, status: "wishlist", favorited: false,
    content: [
      "Chapter 1: The Anxiety Loop\n\nAnxiety is not a character flaw—it is a habit loop. Dr. Judson Brewer, a neuroscientist and psychiatrist, explains that anxiety operates through the same neural mechanisms as any other habit: a trigger, a behavior, and a reward.\n\nWhen you feel anxious, you seek relief. That relief, however temporary, reinforces the behavior, creating a loop that grows stronger each time. The first step to unwinding anxiety is understanding this loop.",
      "Chapter 2: The Brain's Habit Center\n\nThe basal ganglia, a primitive part of the brain, is responsible for habit formation. It does not distinguish between good habits and bad ones—it simply learns patterns and repeats them. Meanwhile, the prefrontal cortex, responsible for rational decision-making, often gets overridden by these automated loops.\n\nBrewer explains that willpower is not the answer. You cannot think your way out of a habit loop. You need to rewire the underlying neural circuitry.",
      "Chapter 3: Mindfulness as a Tool\n\nMindfulness is not about emptying your mind. It is about becoming aware of your experience without judgment. When you bring mindful awareness to anxiety, something remarkable happens: the loop begins to weaken.\n\nBy observing the physical sensations of anxiety (tight chest, shallow breathing, racing heart) without reacting, you create space between the trigger and your habitual response. In that space lies freedom.",
      "Chapter 4: The Reward of Relief\n\nWhy do anxiety habits persist? Because relief feels good. When you worry, check your phone, or avoid a situation, you get a temporary sense of relief. This reward reinforces the behavior.\n\nTo break the cycle, you need to find a bigger, better reward. Curiosity is a powerful alternative. When you feel anxious, instead of spiraling, get curious about the sensation. What does it feel like? Where is it in your body? This shift from fear to curiosity changes the neural pathway.",
      "Chapter 5: Mapping Your Habits\n\nTake a week to simply observe your anxiety habit loops without trying to change them. When do they occur? What triggers them? What behavior follows? What is the short-term reward?\n\nWrite these down. Naming the pattern gives you power over it. You cannot change what you don't see.",
      "Chapter 6: The RAIN Method\n\nBrewer introduces RAIN: Recognize, Allow, Investigate, Note. When anxiety arises, Recognize that it is happening. Allow it to be there without fighting it. Investigate the sensations with curiosity. Note what is happening moment to moment.\n\nThis practice, done consistently, weakens the anxiety habit loop and strengthens your capacity to respond rather than react.",
      "Chapter 7: Building New Patterns\n\nAs the old loops weaken, you need to build new ones. What would you rather do when you feel anxious? Take three deep breaths? Step outside? Call a friend?\n\nEach time you choose a new response, you strengthen that neural pathway. Over time, the new response becomes automatic—a healthy habit that replaces the old anxiety loop.",
      "Chapter 8: Living with Less Anxiety\n\nUnwinding anxiety is not a one-time fix. It is a practice. Some days will be harder than others. The goal is not to eliminate anxiety entirely but to change your relationship with it.\n\nWhen anxiety shows up, you can now see it for what it is: a habit loop, not a truth about the world. And habits can be changed.",
    ],
    externalUrl: "https://books.google.com/books?id=dummy_unwinding_anxiety",
  },
  {
    bookId: "b3", title: "The Power of Now", author: "Eckhart Tolle", genre: "mindfulness",
    description: "A guide to spiritual enlightenment and living in the present moment. This transformative book helps readers let go of pain and find peace in the here and now.",
    isbn: "9781577314806", coverUrl: "https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg",
    currentPage: 0, totalPages: 10, status: "wishlist", favorited: false,
    content: [
      "Chapter 1: You Are Not Your Mind\n\nThe greatest obstacle to enlightenment is identification with your mind. You are not your thoughts. Thoughts arise and pass, but the awareness behind them—the witness—is who you truly are.\n\nEckhart Tolle argues that most people are trapped in compulsive thinking. The voice in your head that comments, judges, compares, and worries is not you. It is a conditioned mental pattern. Freedom begins when you stop believing everything it says.",
      "Chapter 2: The Present Moment\n\nNothing ever happened in the past. It happened in the Now. Nothing will ever happen in the future. It will happen in the Now. The present moment is all you ever have.\n\nWhen you bring your full attention to the present moment, anxiety dissolves. Anxiety requires thinking about the future. Regret requires thinking about the past. Presence requires neither.",
      "Chapter 3: The Pain-Body\n\nTolle introduces the concept of the pain-body: an accumulation of old emotional pain that lives within you. When triggered by events that resonate with past pain, it activates and takes over your consciousness.\n\nThe key to dissolving the pain-body is to observe it without judgment. When you feel old pain arising, simply witness it. Do not identify with it. Say to yourself, I am aware that I am feeling this pain. The separation between the observer and the observed dissolves the pain.",
      "Chapter 4: Consciousness and the Unconscious\n\nMost people are unconscious—not in the sense of being asleep, but in the sense of being possessed by their minds. They are not present in their own lives. They are lost in thought, identified with mental stories and emotional reactions.\n\nBecoming conscious means waking up from the dream of thought. It means realizing that you are the awareness behind the mind, not the mind itself.",
      "Chapter 5: Letting Go of Psychological Time\n\nPsychological time is the habit of living mentally in the past or future. The past is a memory trace that no longer exists. The future is a mental projection that may never come.\n\nYou need clock time for practical purposes—appointments, deadlines, planning. But when clock time becomes psychological time—when you use the past to define yourself or the future to escape the present—you miss life itself.",
      "Chapter 6: Relationships and the Present\n\nMost relationship problems stem from trying to use the other person as a means of fulfilling your ego's needs. True love does not make demands. It does not require the other person to be a certain way.\n\nWhen you are fully present with another person, you experience a deeper connection that transcends words and roles. This presence is the foundation of authentic love.",
      "Chapter 7: The Body as a Portal\n\nYour physical body can be a gateway to presence. By bringing awareness to the inner energy field of your body, you shift your attention out of the mind and into the present moment.\n\nTry this: Close your eyes and feel the aliveness in your hands. Feel the subtle energy pulsing there. Then expand that awareness to your arms, your torso, your legs. This body awareness practice instantly brings you into the Now.",
      "Chapter 8: Surrender and Acceptance\n\nSurrender is not giving up. It is the cessation of resistance. When you stop fighting what is, you align with life itself. This does not mean passivity or inaction. On the contrary, surrender leads to effective action because your energy is no longer wasted on resistance.\n\nAccept the present moment completely. Then, from that place of acceptance, take whatever action is needed. This is the path of peace.",
    ],
    externalUrl: "https://books.google.com/books?id=dummy_power_of_now",
  },
  {
    bookId: "b4", title: "Atomic Habits", author: "James Clear", genre: "self-help",
    description: "An easy and proven way to build good habits and break bad ones. Learn how small changes can lead to remarkable results through the power of atomic habits.",
    isbn: "9780735211292", coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    currentPage: 0, totalPages: 10, status: "wishlist", favorited: false,
    content: [
      "Chapter 1: The Power of Atomic Habits\n\nAn atomic habit is a small, regular practice that is part of a larger system. Just as atoms are the building blocks of molecules, atomic habits are the building blocks of remarkable results.\n\nJames Clear challenges the conventional goal-setting mindset. Goals are about the results you want. Systems are about the processes that lead to those results. Winners and losers often have the same goals; what separates them is their systems.",
      "Chapter 2: The Four Laws of Behavior Change\n\nAll habit formation follows a four-step pattern: cue, craving, response, and reward. To build a good habit, make it obvious (cue), attractive (craving), easy (response), and satisfying (reward).\n\nTo break a bad habit, invert these laws: make it invisible, unattractive, difficult, and unsatisfying. This framework provides a clear roadmap for behavior change.",
      "Chapter 3: The 1% Rule\n\nImproving by just 1% each day leads to a 37-fold improvement over a year. Conversely, getting 1% worse each day leads to near-zero over the same period. The power of small changes compounds over time.\n\nThe challenge is that the results of small changes are invisible in the short term. You have to trust the process and stay consistent, knowing that the compounding effect is working even when you cannot see it.",
      "Chapter 4: Habit Stacking\n\nThe most effective way to build a new habit is to stack it onto an existing habit. After I [current habit], I will [new habit].\n\nThis strategy leverages the existing neural pathway of the established habit, making the new behavior easier to remember and execute. The cue is built into your routine rather than requiring a separate reminder.",
      "Chapter 5: Environment Design\n\nYour environment shapes your behavior more than you realize. Make the cues of good habits obvious in your environment and the cues of bad habits invisible.\n\nIf you want to read more, put your book on your pillow. If you want to eat healthier, put fruit on the counter and junk food in the back of the pantry. Design your environment for success.",
      "Chapter 6: The Two-Minute Rule\n\nWhen you start a new habit, it should take less than two minutes to do. Read one page. Put on your running shoes. Meditate for one breath.\n\nThe idea is to master the habit of showing up. Once you have established the routine, you can gradually increase the duration. The most important step is simply starting.",
      "Chapter 7: Habit Tracking\n\nWhat gets measured gets managed. A simple habit tracker—marking an X on a calendar each day you complete your habit—provides visual feedback that reinforces your progress.\n\nDon't break the chain. The streak itself becomes motivating. But remember: never miss twice. Missing once is an accident. Missing twice is the beginning of a new pattern.",
      "Chapter 8: Identity-Based Habits\n\nThe most sustainable habits are those that become part of your identity. Instead of I want to run more, say I am a runner. Instead of I want to read more, say I am a reader.\n\nEach action you take is a vote for the type of person you want to become. You do not need a perfect record. You just need enough votes to shift your identity. Small habits, repeated consistently, transform who you are.",
    ],
    externalUrl: "https://books.google.com/books?id=dummy_atomic_habits",
  },
  {
    bookId: "b5", title: "Why Has Nobody Told Me This Before?", author: "Dr. Julie Smith", genre: "stress",
    description: "A toolkit for managing everyday mental health challenges. Packed with practical advice and therapeutic techniques for navigating life's ups and downs.",
    isbn: "9780241526534", coverUrl: "https://covers.openlibrary.org/b/isbn/9780241526534-L.jpg",
    currentPage: 0, totalPages: 8, status: "wishlist", favorited: false,
    content: [
      "Chapter 1: Understanding Your Emotions\n\nEmotions are not good or bad. They are signals. Anxiety signals that there may be a threat. Sadness signals that you have lost something important. Anger signals that a boundary has been crossed.\n\nDr. Julie Smith explains that the goal is not to eliminate difficult emotions but to understand what they are telling you and respond wisely. Suppressing emotions creates more problems than it solves.",
      "Chapter 2: Managing Anxiety in the Moment\n\nWhen anxiety strikes, your breathing becomes shallow and rapid. This triggers your body's fight-or-flight response, amplifying the anxiety. The fastest way to break this cycle is to change your breathing.\n\nBreathe in for four counts. Hold for four. Breathe out for four. Hold for four. Repeat for two minutes. This box breathing technique activates the parasympathetic nervous system and signals safety to your brain.",
      "Chapter 3: The Power of Self-Talk\n\nThe way you talk to yourself shapes your experience. If you tell yourself I can't handle this, your body responds as if you are in danger. If you tell yourself I have handled difficult things before, your body calms down.\n\nNotice your self-talk patterns. Write them down. Challenge the ones that are not true. Replace them with more balanced, compassionate statements.",
      "Chapter 4: Building Resilience\n\nResilience is not about never struggling. It is about recovering from struggle. Like a muscle, resilience grows with use. Each time you face a challenge and come through it, you strengthen your capacity to handle the next one.\n\nSmith emphasizes the importance of post-stress recovery. After a stressful period, deliberately rest. This is not indulgence—it is essential maintenance for your mental health.",
      "Chapter 5: Setting Boundaries\n\nBurnout often comes from not setting boundaries. You say yes when you mean no. You take on more than you can handle. You prioritize everyone else's needs above your own.\n\nSetting a boundary does not make you selfish. It makes you sustainable. A simple script: I care about you, and I also need to take care of myself right now. I cannot do that, but I can help you find someone who can.",
      "Chapter 6: Coping with Dark Days\n\nSome days are just hard. On those days, lower your expectations. If all you can do is get out of bed and brush your teeth, that is enough. Tomorrow is a new day.\n\nSmith advises having a pre-prepared self-care kit for dark days. A playlist that lifts your mood. A comfort show. A friend you can text without explanation. These tools make it easier to get through the rough patches.",
      "Chapter 7: Staying Well Long-Term\n\nMental health is not a destination. It is an ongoing practice, like physical fitness. You do not get fit once and then stop exercising. Similarly, you do not achieve mental wellness and then stop maintaining it.\n\nBuild daily practices that support your mental health: movement, connection, rest, and meaning. These are the four pillars of long-term psychological wellbeing.",
    ],
    externalUrl: "https://books.google.com/books?id=dummy_why_has_nobody",
  },
  {
    bookId: "b6", title: "The Anxiety Workbook", author: "Dr. Aaron Kaplan", genre: "anxiety",
    description: "Structured exercises and strategies to manage anxiety. This workbook provides CBT-based techniques, journaling prompts, and actionable steps to regain control.",
    isbn: "9781684033528", coverUrl: "",
    currentPage: 0, totalPages: 0, status: "wishlist", favorited: false,
    content: [],
    externalUrl: "https://books.google.com/books?id=dummy_anxiety_workbook",
  },
  {
    bookId: "b7", title: "Wherever You Go, There You Are", author: "Jon Kabat-Zinn", genre: "mindfulness",
    description: "A practical guide to mindfulness meditation for everyday life. Kabat-Zinn shares simple yet profound insights to help you cultivate present-moment awareness.",
    isbn: "9781401307781", coverUrl: "https://covers.openlibrary.org/b/isbn/9781401307781-L.jpg",
    currentPage: 0, totalPages: 8, status: "wishlist", favorited: false,
    content: [
      "Chapter 1: The Mountain\n\nImagine a mountain. It sits through all seasons, through storms and sunshine, through day and night. It does not change. It simply is.\n\nKabat-Zinn invites you to become like the mountain. Your thoughts and emotions are like the weather—they come and go. But your essential nature, like the mountain, remains stable and unmoved. Meditation is the practice of returning to this mountain-like stability.",
      "Chapter 2: The Breath\n\nThe breath is always with you, always available. It anchors you to the present moment. When you focus on your breath, you cannot be anywhere else.\n\nBegin by simply noticing your breath. Do not try to change it. Just feel the sensation of air moving in and out of your body. When your mind wanders—and it will—gently bring it back to the breath. This is the practice.",
      "Chapter 3: Letting Go\n\nHolding on to thoughts, feelings, and experiences creates suffering. Letting go does not mean pushing things away. It means allowing them to be there without clinging.\n\nImagine holding a bird in your hand. If you hold too tightly, you hurt it. If you open your hand completely, it flies away. Mindfulness is learning to hold your experiences with a gentle, open hand.",
      "Chapter 4: The Body Scan\n\nThe body scan is a formal meditation practice in which you systematically bring attention to each part of your body. Starting from your toes and moving up to the top of your head, you notice physical sensations without judgment.\n\nThis practice trains your mind to be present and develops a deep connection between mind and body. It is particularly helpful for stress and anxiety, which often manifest as physical tension.",
      "Chapter 5: Walking Meditation\n\nYou do not have to sit still to meditate. Walking meditation brings the same quality of presence to the simple act of walking. Feel your feet connecting with the earth. Notice the rhythm of your steps. Be aware of the air on your skin.\n\nTen minutes of walking meditation can be as restorative as ten minutes of sitting meditation. Find what works for you.",
      "Chapter 6: The Beggar's Bowl\n\nKabat-Zinn tells a story: a beggar sits on a box for years, begging for coins. One day a stranger insists the beggar look inside the box. It is full of gold.\n\nThe box is your own mind. You have been looking outside for what you already possess within. Mindfulness helps you discover the inner resources—peace, clarity, wisdom—that have been there all along.",
      "Chapter 7: Everyday Mindfulness\n\nMindfulness is not just for your meditation cushion. It can be woven into everyday activities. Washing dishes. Eating a meal. Brushing your teeth.\n\nThe practice is simple: do one thing at a time, and bring your full attention to it. When you wash dishes, just wash dishes. Feel the warm water. Notice the soap bubbles. This is meditation in action.",
    ],
    externalUrl: "https://books.google.com/books?id=dummy_wherever_you_go",
  },
  {
    bookId: "b8", title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", genre: "self-help",
    description: "Powerful lessons in personal change and effectiveness. This timeless book presents a principle-centered approach for solving personal and professional problems.",
    isbn: "9781982137274", coverUrl: "https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg",
    currentPage: 0, totalPages: 10, status: "wishlist", favorited: false,
    content: [
      "Habit 1: Be Proactive\n\nProactivity means taking responsibility for your life. Reactive people are driven by their environment—if the weather is bad, they feel bad. Proactive people carry their own weather. They understand that between stimulus and response lies the freedom to choose.\n\nCovey emphasizes that you can choose your response to any situation. This is the foundational habit because it puts you in the driver's seat of your own life.",
      "Habit 2: Begin with the End in Mind\n\nImagine your own funeral. What would you want people to say about you? What kind of person, friend, parent, or colleague do you want to have been?\n\nThis habit is about clarifying your values and vision. When you know your destination, you can align your daily actions with your deepest priorities. Otherwise, you risk achieving goals that do not matter.",
      "Habit 3: Put First Things First\n\nUrgent tasks scream for attention, but important tasks—the ones that align with your values and long-term goals—often whisper. Habit 3 is about prioritizing the important over the merely urgent.\n\nCovey's time management matrix divides activities into four quadrants: urgent and important, not urgent but important, urgent but not important, and neither. Effective people spend most of their time in Quadrant II: important but not urgent.",
      "Habit 4: Think Win-Win\n\nWin-win is a mindset of abundance. There is enough success for everyone. In negotiations and relationships, seek solutions that benefit all parties.\n\nThis habit requires courage (to express your needs) and consideration (to understand others' needs). Win-win is not being nice; it is being effective in interdependent situations.",
      "Habit 5: Seek First to Understand, Then to Be Understood\n\nMost people listen with the intent to reply, not to understand. They are filtering everything through their own story. Habit 5 is about empathic listening—listening with the intent to truly understand the other person's perspective.\n\nWhen you genuinely understand someone, they feel valued and respected. Paradoxically, they then become more open to understanding your perspective in return.",
      "Habit 6: Synergize\n\nSynergy means the whole is greater than the sum of its parts. When two or more people work together with mutual respect and open communication, they can create solutions that neither could have created alone.\n\nSynergy requires valuing differences. If two people think exactly the same, one of them is unnecessary. Differences in perspective, strength, and approach are assets, not liabilities.",
      "Habit 7: Sharpen the Saw\n\nYou cannot cut down a tree with a dull saw. Habit 7 is about self-renewal in four dimensions: physical (exercise, nutrition, rest), mental (reading, learning, writing), social/emotional (connection, service, empathy), and spiritual (meditation, values, purpose).\n\nSharpening the saw is not a luxury. It is essential maintenance. Taking time to renew yourself increases your capacity to be effective in every area of life.",
    ],
    externalUrl: "https://books.google.com/books?id=dummy_7_habits",
  },
]

const genres: { value: BookGenre | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "stress", label: "Stress" },
  { value: "anxiety", label: "Anxiety" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "self-help", label: "Self-Help" },
]

function BookReader({ book, onBack, onUpdate }: { book: Book; onBack: () => void; onUpdate: (updated: Book) => void }) {
  const [currentPage, setCurrentPage] = useState(Math.min(book.currentPage, Math.max(book.totalPages - 1, 0)))
  const contentRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  const hasContent = book.content.length > 0 && book.totalPages > 0
  const isLastPage = currentPage >= book.totalPages - 1
  const isFirstPage = currentPage <= 0

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [currentPage])

  const updatePage = (newPage: number) => {
    const clamped = Math.max(0, Math.min(newPage, book.totalPages - 1))
    setCurrentPage(clamped)
    onUpdate({ ...book, currentPage: clamped, status: clamped >= book.totalPages - 1 && isLastPage ? "completed" : "reading" })
  }

  const handleNext = () => {
    if (isLastPage) {
      onUpdate({ ...book, currentPage: book.totalPages - 1, status: "completed" })
      showToast("You finished the book!", "achievement", 50)
      return
    }
    updatePage(currentPage + 1)
  }

  const handlePrevious = () => {
    updatePage(currentPage - 1)
  }

  const handleOpenExternal = () => {
    window.open(book.externalUrl, "_blank", "noopener,noreferrer")
  }

  const progress = book.totalPages > 0 ? Math.round(((currentPage + 1) / book.totalPages) * 100) : 0

  if (!hasContent) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to bookshelf
        </button>
        <GlassCard>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-16 h-16 text-white/20" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{book.title}</h2>
                <p className="text-sm text-white/50 mt-1">by {book.author}</p>
              </div>
              <Badge variant="info" size="sm">
                {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
              </Badge>
              <p className="text-sm text-white/70 leading-relaxed">{book.description}</p>
              <p className="text-sm text-amber-400/80">No reader content available for this book.</p>
              <Button size="sm" icon={<ExternalLink className="w-4 h-4" />} onClick={handleOpenExternal}>
                Read on Google Books
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" /> Bookshelf
        </button>
        <button onClick={handleOpenExternal} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-all">
          <ExternalLink className="w-3 h-3" /> Open in Google Books
        </button>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">{book.title}</h2>
              <p className="text-sm text-white/50">by {book.author}</p>
            </div>
            <Badge variant="info" size="sm">
              {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>Page {currentPage + 1} of {book.totalPages}</span>
            <span className="w-px h-3 bg-white/10" />
            <span>{progress}% complete</span>
          </div>
        </div>

        <div ref={contentRef} className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {book.content[currentPage]?.split("\n").map((paragraph, i) => (
            paragraph.trim() ? (
              <p key={i} className={cn(
                "text-sm leading-relaxed mb-4",
                paragraph.startsWith("Chapter") ? "text-white font-semibold text-base" : "text-white/80"
              )}>
                {paragraph}
              </p>
            ) : null
          ))}
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <Button
            size="sm"
            variant="glass"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={handlePrevious}
            disabled={isFirstPage}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">
              {currentPage + 1}/{book.totalPages}
            </span>
            <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={isLastPage ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            onClick={handleNext}
          >
            {isLastPage ? "Finish" : "Next"}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function ReadingView({ book, onBack, onUpdate, onStartReading }: { book: Book; onBack: () => void; onUpdate: (updated: Book) => void; onStartReading: () => void }) {
  const { showToast } = useToast()

  const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0

  const handleMarkRead = () => {
    onUpdate({ ...book, currentPage: book.totalPages || 1, status: "completed" })
    showToast("Book marked as read!", "xp", 25)
  }

  const handleToggleFavorite = () => {
    onUpdate({ ...book, favorited: !book.favorited })
    showToast(book.favorited ? "Removed from favorites" : "Added to favorites", "xp")
  }

  const handleBumpProgress = () => {
    if (book.totalPages === 0) return
    const pageIncrement = Math.ceil(book.totalPages * 0.1)
    const newPage = Math.min(book.currentPage + pageIncrement, book.totalPages)
    onUpdate({ ...book, currentPage: newPage, status: newPage >= book.totalPages ? "completed" : "reading" })
    showToast(`Advanced to page ${newPage}`, "xp", 5)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to bookshelf
      </button>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 w-full md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-16 h-16 text-white/20" />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{book.title}</h2>
              <p className="text-sm text-white/50 mt-1">by {book.author}</p>
            </div>

            <Badge variant="info" size="sm">
              {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
            </Badge>

            <p className="text-sm text-white/70 leading-relaxed">{book.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Reading Progress</span>
                <span className="text-white font-medium">{progress}% ({book.currentPage}/{book.totalPages || "?"} pages)</span>
              </div>
              <Progress value={progress} size="md" variant={book.status === "completed" ? "success" : "gradient"} />
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {book.status !== "completed" && book.content.length > 0 && (
                <Button size="sm" icon={<BookOpen className="w-4 h-4" />} onClick={onStartReading}>
                  Start Reading
                </Button>
              )}
              {book.status !== "completed" && (
                <Button size="sm" variant="glass" onClick={handleBumpProgress}>
                  +10% Progress
                </Button>
              )}
              <Button
                size="sm"
                variant={book.status === "completed" ? "secondary" : "primary"}
                icon={<Check className="w-4 h-4" />}
                onClick={handleMarkRead}
                disabled={book.status === "completed"}
              >
                {book.status === "completed" ? "Completed" : "Mark as Read"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<Heart className={cn("w-4 h-4", book.favorited && "fill-rose-400 text-rose-400")} />}
                onClick={handleToggleFavorite}
              >
                {book.favorited ? "Favorited" : "Add to Favorites"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => window.open(book.externalUrl, "_blank", "noopener,noreferrer")}
              >
                Google Books
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export function Bookshelf() {
  const [books, setBooks] = useLocalStorage<Book[]>("calmora_books", defaultBooks)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [readingBook, setReadingBook] = useState<Book | null>(null)
  const [genreFilter, setGenreFilter] = useState<BookGenre | "all">("all")
  const [sortBy, setSortBy] = useState<"progress" | "title">("progress")
  const [searchQuery, setSearchQuery] = useState("")

  const handleUpdateBook = (updated: Book) => {
    setBooks((prev) => prev.map((b) => (b.bookId === updated.bookId ? updated : b)))
  }

  const filteredBooks = useMemo(() => {
    let result = [...books]

    if (genreFilter !== "all") {
      result = result.filter((b) => b.genre === genreFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    }

    result.sort((a, b) => {
      if (sortBy === "progress") {
        const aPct = a.totalPages > 0 ? a.currentPage / a.totalPages : 0
        const bPct = b.totalPages > 0 ? b.currentPage / b.totalPages : 0
        return bPct - aPct
      }
      return a.title.localeCompare(b.title)
    })

    return result
  }, [books, genreFilter, sortBy, searchQuery])

  const stats = useMemo(() => {
    const total = books.length
    const completed = books.filter((b) => b.status === "completed").length
    const reading = books.filter((b) => b.status === "reading").length
    const favorited = books.filter((b) => b.favorited).length
    return { total, completed, reading, favorited }
  }, [books])

  if (readingBook) {
    return (
      <BookReader
        book={readingBook}
        onBack={() => setReadingBook(null)}
        onUpdate={(updated) => {
          handleUpdateBook(updated)
          setReadingBook(updated)
        }}
      />
    )
  }

  if (selectedBook) {
    return (
      <ReadingView
        book={selectedBook}
        onBack={() => setSelectedBook(null)}
        onUpdate={handleUpdateBook}
        onStartReading={() => {
          const reading = { ...selectedBook, status: "reading" as const }
          handleUpdateBook(reading)
          setSelectedBook(null)
          setReadingBook(reading)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-white/40">Total Books</p>
        </GlassCard>
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
          <p className="text-xs text-white/40">Completed</p>
        </GlassCard>
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.reading}</p>
          <p className="text-xs text-white/40">Reading</p>
        </GlassCard>
        <GlassCard className="!p-3 text-center">
          <p className="text-2xl font-bold text-rose-400">{stats.favorited}</p>
          <p className="text-xs text-white/40">Favorites</p>
        </GlassCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {genres.map((g) => (
            <button
              key={g.value}
              onClick={() => setGenreFilter(g.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                genreFilter === g.value
                  ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
              )}
            >
              {g.label}
            </button>
          ))}
          <button
            onClick={() => setSortBy((prev) => (prev === "progress" ? "title" : "progress"))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/50 hover:text-white/80 transition-all whitespace-nowrap"
          >
            <ChevronDown className="w-3 h-3" />
            {sortBy === "progress" ? "By Progress" : "A-Z"}
          </button>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookMarked className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.bookId} book={book} onClick={() => setSelectedBook(book)} />
          ))}
        </div>
      )}
    </div>
  )
}
