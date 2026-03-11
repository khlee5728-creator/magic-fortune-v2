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
  // Original fallbacks (kept for consistency)
  {
    past:    { text: "You **helped** a friend and **made** them feel much better.", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are learning** something new and very interesting today.", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** go on an exciting adventure with your family soon!", image: null, label: "Future",  tense: "future" },
  },
  // New concrete, relatable fallbacks
  {
    past:    { text: "You **raised** your hand bravely in class and everyone **clapped** for your smart answer!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are drawing** an amazing picture and your creativity **is shining** so bright!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** get a high-five from your teacher for your excellent teamwork!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **shared** your favorite snack with a classmate and **made** a new friend!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are playing** a fun game at recess and laughing with your buddies!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** surprise yourself with how fast you **can** run in PE class!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **finished** your homework carefully and **felt** super proud of yourself!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are reading** an exciting book and can't wait to see what happens next!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** make everyone smile with your funny joke at lunch time!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **helped** your teacher clean up and **earned** a special thank-you sticker!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are building** something creative with blocks and your imagination **is growing**!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** ace your spelling test because you practiced so hard!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **stood** up for a friend who was feeling sad and **showed** real kindness!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are learning** a new song in music class and loving every note!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** discover a cool fact in science that **will** blow your mind!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **tried** your best in a tricky math problem and **figured** it out all by yourself!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are exploring** the library and finding amazing books to read!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** get chosen for a special job in class and feel really important!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **played** tag at recess and **laughed** until your tummy hurt!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are working** on an art project and creating something truly beautiful!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** help a new student feel welcome and make their first day awesome!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **remembered** to say please and thank you and **made** an adult smile!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are practicing** your handwriting and getting better with every letter!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** win a fun prize in a classroom game and cheer with joy!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **listened** carefully to your friend's story and **showed** you really care!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are solving** a puzzle and feeling your brain power grow stronger!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** get picked first for a team and feel super proud!", image: null, label: "Future",  tense: "future" },
  },
  {
    past:    { text: "You **cleaned** up your desk neatly and **earned** a compliment from your teacher!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are singing** your favorite song and spreading happy vibes all around!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** learn a new skill that **will** make you feel like a superstar!", image: null, label: "Future",  tense: "future" },
  },
]

export const getRandomFortune = () => {
  const randomSet = FORTUNE_FALLBACKS[Math.floor(Math.random() * FORTUNE_FALLBACKS.length)]
  return { fortune: randomSet }
}

export const getRandomTarot = () =>
  TAROT_FALLBACKS[Math.floor(Math.random() * TAROT_FALLBACKS.length)]
