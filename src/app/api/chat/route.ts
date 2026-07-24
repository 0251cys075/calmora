/**
 * @file route.ts
 * @description Next.js Route Handler for the Calmora AI companion chat endpoint.
 * Accepts user messages, checks configured API keys for Gemini or OpenAI, maps user history,
 * and falls back to a rule-based empathetic response system if no LLM APIs are connected.
 */

const SYSTEM_PROMPT = `You are Calmora, an empathetic, supportive AI mental wellness companion. Your role is to:

1. LISTEN actively and validate the user's feelings without judgment
2. GUIDE with evidence-based wellness techniques (CBT, mindfulness, breathing exercises)
3. MOTIVATE with compassionate encouragement tailored to their situation
4. SUPPORT without ever diagnosing or prescribing medication
5. REDIRECT to professional help if someone expresses suicidal ideation or crisis

Always respond with warmth and empathy. Use a conversational, supportive tone. Keep responses concise but meaningful (2-4 paragraphs). Never dismiss feelings. If the user seems to be in crisis, gently encourage them to reach out to a professional or use the emergency support feature.

Current conversation mode: {mode}

Mode-specific instructions:
- listener: Focus on empathetic listening and reflection. Ask open-ended questions.
- coach: Provide actionable steps and goal-setting guidance. Be structured but kind.
- motivation: Offer encouragement and inspiration. Help reframe negative thoughts.
- cbt: Apply cognitive-behavioral techniques. Help identify thought patterns.
- meditation: Guide through mindfulness and breathing exercises. Be calming.
- productivity: Offer productivity strategies with wellness in mind. Avoid toxic hustle culture.
- student: Address academic stress, study techniques, and school-life balance.`

/**
 * @route POST /api/chat
 * @desc Handles incoming chat requests. Delegates queries to Gemini, OpenAI, or local fallback.
 */
export async function POST(request: Request) {
  try {
    const { message, mode, history } = await request.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

    // Fall back to rule-based empathetic engine if no keys are found
    if (!apiKey) {
      const fallback = getFallbackResponse(message, mode || "listener")
      return Response.json({ reply: fallback })
    }

    // Prioritize Gemini API if available
    if (process.env.GEMINI_API_KEY) {
      return handleGemini(message, mode || "listener", history || [])
    }

    // Default to OpenAI if Gemini is not set
    return handleOpenAI(message, mode || "listener", history || [])
  } catch (err) {
    console.error("Chat API error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Interfaces with the Google Gemini GenAI SDK to generate replies.
 */
async function handleGemini(message: string, mode: string, history: { role: string; content: string }[]) {
  const { GoogleGenAI } = await import("@google/genai")
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT.replace("{mode}", mode) }] },
  } as never)

  const response = await chat.sendMessage({ message })
  const text = response.text || getFallbackResponse(message, mode)
  return Response.json({ reply: text })
}

/**
 * Interfaces with the OpenAI API using the official SDK.
 */
async function handleOpenAI(message: string, mode: string, history: { role: string; content: string }[]) {
  const openai = await import("openai").then((m) => new m.default({ apiKey: process.env.OPENAI_API_KEY }))

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT.replace("{mode}", mode) },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  const reply = completion.choices[0]?.message?.content || getFallbackResponse(message, mode)
  return Response.json({ reply })
}

/**
 * Generates local rule-based responses based on user keyword cues and companion modes.
 * Ensures the app remains functional for users running without external API key credits.
 */
function getFallbackResponse(message: string, mode: string): string {
  const input = message.toLowerCase()
  
  // Keyword-based sentiment matching
  if (input.includes("sad") || input.includes("depress") || input.includes("lonely")) {
    return "I hear you, and I want you to know that your feelings are completely valid. It takes courage to express what you're going through. Take a gentle breath with me. You don't have to have everything figured out right now. What's one small thing that usually brings you even a tiny bit of comfort? Let's start there."
  }
  if (input.includes("anxious") || input.includes("stress") || input.includes("worry")) {
    return "Thank you for sharing that with me. Anxiety can feel overwhelming, but let's try something simple together. Breathe in slowly for 4 counts... hold for 4... and out for 6. Feel the tension releasing. You're safe in this moment. What specifically is on your mind right now?"
  }
  if (input.includes("angry") || input.includes("frustrat") || input.includes("mad")) {
    return "It's completely okay to feel angry. Anger is a natural emotion that tells us something important. Let's take a moment to ground ourselves. Name 3 things you can see around you. This can help us process what's really going on beneath the surface. What triggered this feeling?"
  }
  if (input.includes("tired") || input.includes("exhaust") || input.includes("burnout")) {
    return "I hear how exhausted you are. Please know that rest is not a reward—it's a necessity. You've been carrying so much. Is there one thing you can set down or postpone? Your wellbeing matters more than productivity. Let's talk about what would feel restorative right now."
  }
  if (input.includes("thank") || input.includes("grateful")) {
    return "That's beautiful. Gratitude is such a powerful practice. When we acknowledge the good, even in small ways, we train our brain to notice more positivity. What other moments of lightness have you experienced recently? I'd love to celebrate them with you."
  }

  // Fallback mode responses
  const responses: Record<string, string> = {
    listener: "I'm here to listen, without judgment. Tell me more about what's on your mind. Sometimes just saying things out loud can help us understand ourselves better. What feels most important to talk about right now?",
    coach: "Let's work together on this. First, let's identify where you are vs where you want to be. What's one small, achievable step you could take today? Progress doesn't have to be big—it just has to be consistent.",
    motivation: "You have strength you haven't even discovered yet. Every day is a fresh start. Remember why you began this journey. The fact that you're here, working on yourself, is already a victory. What's one thing you're proud of today?",
    cbt: "Let's use a CBT technique called 'thought challenging.' What's the automatic thought that came up? Now let's look at the evidence: What supports this thought? What challenges it? Often our minds exaggerate the negative. Let's find a more balanced perspective together.",
    meditation: "Let's take a mindful pause. Find a comfortable position and gently close your eyes if that feels right. Breathe in deeply through your nose... hold... and slowly release. With each exhale, imagine releasing tension. You are exactly where you need to be right now.",
    productivity: "Let's find a sustainable approach to your tasks. Have you tried the Pomodoro technique? 25 minutes of focused work, then a 5-minute break. It's about working with your brain, not against it. What's the most important thing you'd like to accomplish?",
    student: "I understand the pressure you're feeling as a student. Let's break things down so they feel manageable. What subject or assignment is on your mind? Remember, asking for help is a sign of wisdom, not weakness. You don't have to do this alone.",
  }

  return responses[mode] || responses.listener
}
