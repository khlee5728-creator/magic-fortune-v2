/**
 * Static fallback content used when the AI API is unavailable.
 * 5 fortune cookie sets (modal verbs: will/can/should/might/must) + 3 tarot sets.
 */

export const FORTUNE_FALLBACKS = [
  {
    will:   { text: "You **will** discover something amazing and wonderful today!" },
    can:    { text: "You **can** achieve anything when you believe in yourself!" },
    should: { text: "You **should** share your brilliant ideas with your friends!" },
    might:  { text: "Something magical **might** happen if you keep smiling!" },
    must:   { text: "You **must** remember how special and talented you truly are!" },
  },
  {
    will:   { text: "Good things **will** come your way very soon — stay positive!" },
    can:    { text: "You **can** make someone's day brighter with your kindness!" },
    should: { text: "You **should** try something new and exciting this week!" },
    might:  { text: "A wonderful surprise **might** be waiting just around the corner!" },
    must:   { text: "You **must** never give up on your amazing dreams!" },
  },
  {
    will:   { text: "The stars say you **will** have a fantastic day at school!" },
    can:    { text: "You **can** do great things when you work hard and stay focused!" },
    should: { text: "You **should** be proud of all the progress you've made!" },
    might:  { text: "Your creativity **might** lead you to an incredible discovery!" },
    must:   { text: "You **must** always believe in your wonderful abilities!" },
  },
  {
    will:   { text: "Your hard work **will** bring you a sweet reward very soon!" },
    can:    { text: "You **can** turn any challenge into an exciting adventure!" },
    should: { text: "You **should** celebrate your unique gifts and talents today!" },
    might:  { text: "A fun adventure **might** begin when you least expect it!" },
    must:   { text: "You **must** know that you are braver than you think!" },
  },
  {
    will:   { text: "Something wonderful **will** happen when you follow your heart!" },
    can:    { text: "You **can** light up any room with your amazing smile!" },
    should: { text: "You **should** trust your instincts — they're usually right!" },
    might:  { text: "The universe **might** have a special surprise planned for you!" },
    must:   { text: "You **must** remember that you're capable of incredible things!" },
  },
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

export const getRandomFortune = () => {
  const randomSet = FORTUNE_FALLBACKS[Math.floor(Math.random() * FORTUNE_FALLBACKS.length)]
  return { fortune: randomSet }
}

export const getRandomTarot = () =>
  TAROT_FALLBACKS[Math.floor(Math.random() * TAROT_FALLBACKS.length)]
