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
  // Korean school culture: cleaning time, stamps, group work
  {
    past:    { text: "You **cleaned** your classroom carefully and **earned** a special stamp from your teacher!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are helping** your group finish the project and everyone **is working** together!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** ace your dictation test because you practiced so hard!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: seatmates, school lunch
  {
    past:    { text: "You **shared** your school lunch with your seatmate and **made** them smile so big!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are playing** tag during break time and feeling so energetic and happy!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** get picked for the sports day relay team and feel super excited!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: homework, field trips
  {
    past:    { text: "You **finished** your homework on time and **felt** really proud of your hard work!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are learning** about Korean history and finding it so interesting!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** have an amazing time on your field trip and learn something new!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: class duties, teacher stamps
  {
    past:    { text: "You **helped** as lunch duty monitor and **did** such a responsible job!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are solving** a math problem step by step and getting closer to the answer!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** receive a stamp for your excellent participation in class!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: seatmate help, art class
  {
    past:    { text: "You **helped** your 짝꿍 (seatmate) understand a difficult problem and **felt** so helpful!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are drawing** a beautiful picture in art class and your teacher **is smiling**!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** make everyone laugh with your funny presentation during show-and-tell!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: music room, science lab
  {
    past:    { text: "You **sang** beautifully in music class and **felt** so confident and proud!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are doing** a cool science experiment and discovering something amazing!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** surprise yourself with how well you **can** play the recorder!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: PE class, classroom duties
  {
    past:    { text: "You **tried** your best in PE class and **improved** your dodgeball skills!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are organizing** the classroom bookshelf and doing a neat and tidy job!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** be chosen as class leader and feel really responsible and important!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: break time, helping new students
  {
    past:    { text: "You **played** tag during break time and **laughed** so much with your friends!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are working** on your group art project and creating something beautiful together!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** help a new student feel welcome and make their first day awesome!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: good manners, handwriting practice
  {
    past:    { text: "You **greeted** your teacher politely in the morning and **made** them smile brightly!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are practicing** your handwriting and each letter **is getting** neater!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** win a fun prize in a classroom game and cheer with joy!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: friendship, talent show
  {
    past:    { text: "You **listened** carefully to your friend's story and **showed** you really care!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are preparing** for the talent show and feeling more confident each day!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** get picked first for your team in sports day and feel super proud!", image: null, label: "Future",  tense: "future" },
  },
  // Korean school culture: desk organization, computer class
  {
    past:    { text: "You **organized** your desk neatly and **earned** a compliment from your teacher!", image: null, label: "Past",    tense: "past" },
    present: { text: "You **are learning** how to use the computer in computer class and having fun!", image: null, label: "Present", tense: "present" },
    future:  { text: "You **will** learn a new skill in after-school activities and feel amazing!", image: null, label: "Future",  tense: "future" },
  },
]

export const getRandomFortune = () => {
  const randomSet = FORTUNE_FALLBACKS[Math.floor(Math.random() * FORTUNE_FALLBACKS.length)]
  return { fortune: randomSet }
}

export const getRandomTarot = () =>
  TAROT_FALLBACKS[Math.floor(Math.random() * TAROT_FALLBACKS.length)]
