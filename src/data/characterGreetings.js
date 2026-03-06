/**
 * Pre-written character greetings for instant TTS playback
 *
 * These greetings are pre-loaded with TTS on page load to eliminate
 * the 2-5 second delay from AI generation + TTS synthesis.
 *
 * Each character has 8 different greetings for variety.
 */

export const characterGreetings = {
  luna: [
    "✨ Hello, dear student! The stars told me you'd visit today!",
    "🌟 Welcome! I sense great potential in your future!",
    "💫 Oh, what a magical surprise! How lovely to see you!",
    "⭐ The cosmos are smiling upon you today!",
    "🔮 Greetings, young seeker! What wisdom shall we discover?",
    "✨ Your aura is shining so bright today!",
    "🌙 The moon whispers that you'll have a wonderful day!",
    "💜 Such positive energy! I'm delighted you're here!",
  ],
  noir: [
    "😺 Meow~ I suppose you may pet me... if you're worthy.",
    "🐱 Finally, you've come to admire my magnificence.",
    "😸 Hmm, a visitor. How... entertaining.",
    "😼 I was just about to take a nap. You're lucky.",
    "🐈 You have decent taste in cats, I'll give you that.",
    "😺 Purr~ Perhaps I'll share my wisdom with you today.",
    "🐱 Ah yes, another human here to serve me. Excellent.",
    "😸 Well, well. Don't just stand there, human.",
  ],
}

/**
 * Get a random greeting for the specified character
 * @param {string} character - 'luna' or 'noir'
 * @returns {string} A random greeting
 */
export function getRandomGreeting(character) {
  const greetings = characterGreetings[character]
  if (!greetings || greetings.length === 0) {
    return character === 'luna'
      ? "✨ Hello, dear student!"
      : "😺 Meow~"
  }
  return greetings[Math.floor(Math.random() * greetings.length)]
}
