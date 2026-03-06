/**
 * Static fallback content used when the AI API is unavailable.
 * 20 fortune cookie messages + 3 tarot sets.
 */

export const FORTUNE_FALLBACKS = [
  "Today is a great day to try something new and exciting!",
  "Your kindness will make a friend smile today.",
  "A fun surprise is waiting for you — keep your eyes open!",
  "You will do amazing things when you believe in yourself.",
  "Good things are coming your way — keep smiling!",
  "Today, your creativity will shine brighter than ever.",
  "A wonderful adventure is just around the corner!",
  "Your hard work will bring you a sweet reward very soon.",
  "Someone special is thinking about you right now.",
  "The stars say you will have a fantastic day at school!",
  "Your ideas are wonderful — share them with the world!",
  "A little bird told me you will eat something delicious today.",
  "Today is your lucky day — go for it with all your heart!",
  "You are braver than you think and smarter than you know.",
  "Great things happen to people who stay as positive as you.",
  "Your laughter will brighten up every room you walk into.",
  "Something magical is about to happen in your life very soon!",
  "You have a special gift — use it to make others feel happy.",
  "Today, you will learn something truly amazing and wonderful.",
  "The universe is cheering for you — you've totally got this!",
]

export const TAROT_FALLBACKS = [
  {
    past:    { text: "You studied hard and learned something amazing yesterday.", image: null, label: "Past",    tense: "past" },
    present: { text: "You are having a wonderful time with your friends right now.", image: null, label: "Present", tense: "present" },
    future:  { text: "You will get a special surprise that makes you very happy!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You played your favorite game and had a lot of fun!", image: null, label: "Past",    tense: "past" },
    present: { text: "You are working on something creative and very exciting.", image: null, label: "Present", tense: "present" },
    future:  { text: "You will discover a new hobby that you will love forever!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You helped a friend and made them feel much better.", image: null, label: "Past",    tense: "past" },
    present: { text: "You are learning something new and very interesting today.", image: null, label: "Present", tense: "present" },
    future:  { text: "You will go on an exciting adventure with your family soon!", image: null, label: "Future",  tense: "future" },
  },
]

export const getRandomFortune = () =>
  FORTUNE_FALLBACKS[Math.floor(Math.random() * FORTUNE_FALLBACKS.length)]

export const getRandomTarot = () =>
  TAROT_FALLBACKS[Math.floor(Math.random() * TAROT_FALLBACKS.length)]
