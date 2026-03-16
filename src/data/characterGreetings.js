/**
 * Pre-written character greetings for instant TTS playback
 *
 * These greetings are pre-loaded with TTS on page load to eliminate
 * the 2-5 second delay from AI generation + TTS synthesis.
 *
 * Each character has 10 different greetings for variety.
 * Language level: CEFR A2 (elementary school friendly)
 */

export const characterGreetings = {
  luna: [
    "✨ Hello, dear student! The stars told me you'd visit today!",
    "🌟 Welcome! You did a great job today!",
    "💫 Oh, what a magical surprise! How lovely to see you!",
    "⭐ Did you have fun at school today?",
    "🔮 Hello! What magic will we learn today?",
    "✨ You look so bright and happy today!",
    "🌙 I hope you played a lot with your friends today!",
    "💜 What wonderful energy! I'm so happy you're here!",
    "🎨 Did you try something new and exciting today?",
    "📚 The stars say you learned something cool today!",
  ],
  noir: [
    "😺 Meow~ Maybe I'll let you pet me... if you're good.",
    "🐱 Finally, you came to see how great I am.",
    "😸 Hmm, a visitor. How... entertaining.",
    "😼 I was just about to take a nap. You're lucky.",
    "🐈 I just finished my meal. Want to play?",
    "😺 Purr~ Maybe I'll teach you something today.",
    "🐱 Ah yes, another human here to serve me. Excellent.",
    "😸 Well, well. Don't just stand there, human.",
    "🐱 You look tired. Did you work hard today?",
    "😼 I was waiting for you... NOT! Well, maybe a little.",
  ],
}

/**
 * Shuffle Bag pattern for non-repeating random greetings
 * Ensures all 10 greetings are played once before repeating
 */
class ShuffleGreetingManager {
  constructor() {
    this.lunaQueue = []
    this.noirQueue = []
    this.lastGreeting = { luna: null, noir: null }
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  shuffle(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Refill the queue with shuffled greetings
   * Ensures first greeting of new set != last greeting of previous set
   */
  refillQueue(character) {
    const greetings = characterGreetings[character]
    let shuffled = this.shuffle(greetings)

    // Avoid consecutive duplicates between sets
    const lastGreeting = this.lastGreeting[character]
    if (lastGreeting && shuffled[0] === lastGreeting && greetings.length > 1) {
      // Swap first with random position (not first)
      const swapIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1
      ;[shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]]
    }

    return shuffled
  }

  /**
   * Get next greeting from shuffle bag
   */
  getNextGreeting(character) {
    const queue = character === 'luna' ? this.lunaQueue : this.noirQueue

    // Refill queue if empty
    if (queue.length === 0) {
      const newQueue = this.refillQueue(character)
      if (character === 'luna') {
        this.lunaQueue = newQueue
      } else {
        this.noirQueue = newQueue
      }
    }

    // Pop from queue
    const greeting = character === 'luna'
      ? this.lunaQueue.shift()
      : this.noirQueue.shift()

    // Remember last greeting for next refill
    this.lastGreeting[character] = greeting

    return greeting || (character === 'luna' ? "✨ Hello, dear student!" : "😺 Meow~")
  }

  /**
   * Reset queue for character (e.g., when switching tabs)
   */
  reset(character) {
    if (character === 'luna') {
      this.lunaQueue = []
      this.lastGreeting.luna = null
    } else {
      this.noirQueue = []
      this.lastGreeting.noir = null
    }
  }
}

// Global instance
export const greetingManager = new ShuffleGreetingManager()

/**
 * Get a random greeting for the specified character using shuffle bag pattern
 * @param {string} character - 'luna' or 'noir'
 * @returns {string} A random greeting
 */
export function getRandomGreeting(character) {
  return greetingManager.getNextGreeting(character)
}
