export interface Quote {
  text: string
  author: string
}

export const quotes: Quote[] = [
  { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "Surrender to what is. Let go of what was. Have faith in what will be.", author: "Sonia Ricotti" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "You are not your thoughts. You are the observer of your thoughts.", author: "Eckhart Tolle" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "Habit is the intersection of knowledge, skill, and desire.", author: "Stephen Covey" },
  { text: "Be the reason someone feels seen, heard, and valued today.", author: "Unknown" },
  { text: "Slow down. Calm down. Don't worry. Don't hurry. Trust the process.", author: "Unknown" },
  { text: "You are exactly where you need to be.", author: "Unknown" },
  { text: "Breathe in courage. Breathe out fear.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Your habits shape your future. Choose them wisely.", author: "Unknown" },
]

export function getDailyQuote(): Quote {
  const today = new Date()
  const index = today.getDate() * (today.getMonth() + 1) % quotes.length
  return quotes[index]
}
