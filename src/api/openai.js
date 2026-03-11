/**
 * OpenAI Proxy API Client
 * Backend: https://devplayground.polarislabs.ai.kr/api
 *
 * All OpenAI API calls are routed through this proxy to keep API keys secure.
 */
const BASE_URL = 'https://devplayground.polarislabs.ai.kr/api'

// ─── Low-level helpers ───────────────────────────────────────────────────────

export async function callChat(messages, model = 'gpt-4o') {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`Chat API ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

async function callImage(prompt) {
  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`Image API ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.data[0].url
}

/**
 * Generate TTS audio blob URL.
 * Caller is responsible for revoking the returned object URL.
 *
 * Results are cached by text key (module-level Map).
 * Subsequent calls for the same text skip the API and return a new URL
 * from the cached Blob — zero latency, zero extra API cost.
 */
const ttsCache = new Map() // text → Blob

export async function callTTS(text, voice = 'nova') {
  if (ttsCache.has(text)) {
    return URL.createObjectURL(ttsCache.get(text))
  }

  const res = await fetch(`${BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text, voice }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`TTS API ${res.status}: ${err}`)
  }
  const blob = await res.blob()
  ttsCache.set(text, blob)
  return URL.createObjectURL(blob)
}

// ─── Fortune Cookie ───────────────────────────────────────────────────────────

const FORTUNE_SYSTEM = `You are a magical fortune teller for children aged 7–13.
Create positive, encouraging English fortune messages using simple vocabulary (CEFR B1, ~800 core words).
Topics: school, friends, hobbies, sports, food, creativity.
Length: 1–2 short sentences only. Be warm, fun, and imaginative.`

export async function generateFortuneCookieContent() {
  const rawText = await callChat([
    { role: 'system', content: FORTUNE_SYSTEM },
    {
      role: 'user',
      content: `Create 5 fortune cookie messages for a child, each using a different modal verb.
Wrap the modal verb in **double asterisks** to mark it for emphasis.
Return ONLY a valid JSON object with no markdown fences or extra text:
{
  "will":   "Use **will** for future certainty (e.g. You **will** find a wonderful surprise today!)",
  "can":    "Use **can** for ability/possibility (e.g. You **can** achieve anything when you try your best!)",
  "should": "Use **should** for advice (e.g. You **should** share your amazing ideas with friends!)",
  "might":  "Use **might** for weak possibility (e.g. Something magical **might** happen if you keep smiling!)",
  "must":   "Use **must** for strong necessity (e.g. You **must** remember how special and talented you are!)"
}`,
    },
  ])

  let messages
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    messages = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
  } catch {
    throw new Error('Failed to parse fortune cookie JSON from AI response')
  }

  return {
    fortune: {
      will:   { text: messages.will },
      can:    { text: messages.can },
      should: { text: messages.should },
      might:  { text: messages.might },
      must:   { text: messages.must },
    }
  }
}

// ─── Tarot Card ───────────────────────────────────────────────────────────────

const TAROT_SYSTEM = `You are a magical fortune teller for Korean elementary school children aged 7–13.
Create relatable, specific English fortune messages about their DIVERSE daily life.
Use simple vocabulary (CEFR B1) and vivid details that make kids say "That's exactly like me!"

Focus on DIVERSE life situations (NOT just school - vary the settings):

**School Life (30%):**
- Classroom: homework, dictation tests (받아쓰기), answering questions, group work (모둠활동), presentations
- Friendships: playing with seatmates (짝꿍), sharing lunch, helping friends
- School duties: cleaning time (청소시간), lunch duty, class leader
- School events: field trips (현장학습), sports day (운동회), talent shows (발표회)

**After-School Activities (25%):**
- Academies/Hagwon (학원): English class, math academy, art lessons, taekwondo
- Practice: piano, violin, swimming, coding class
- Playground: playing with neighborhood friends, riding bikes, jump rope
- Library: borrowing books, studying, reading in quiet room

**Home & Family (25%):**
- Family time: dinner together, talking with parents, board games
- Helping at home: cooking with mom/dad, organizing room, washing dishes
- Sibling moments: playing together, sharing toys, helping younger sibling
- Pet care: feeding dog/cat, walking pet, playing with pet

**Hobbies & Personal Time (15%):**
- Reading: finishing a book, discovering new stories, comic books
- Creative: drawing, crafting, building with LEGO, making things
- Gaming: beating a level, playing with friends online
- Sports: shooting hoops, jumping rope, riding scooter, soccer

**Weekend & Special Moments (5%):**
- Family outings: park, museum, shopping mall, restaurant, movie theater
- Visiting relatives: grandparents' house, cousins, family gatherings
- Special events: birthday parties, holidays, celebrations

IMPORTANT: Create VARIED scenarios. Don't repeat similar activities.
Each message should feel fresh and explore different parts of a child's life.

Each fortune MUST include:
1. A SPECIFIC action or event with concrete details
2. An EMOTION word (proud, excited, brave, happy, satisfied, confident, etc.)
3. A POSITIVE result (someone smiled, you felt good, you succeeded, you learned something, etc.)

You must also provide SHORT scene descriptions (10-15 words max) for image generation.
Scene descriptions should match the fortune context (classroom, home kitchen, park, library, etc.).

Make it feel personal, like the fortune was written just for them.`

export async function generateTarotText() {
  // Using gpt-4o for better creativity and diversity (2-3s vs 0.5-1s, but much more varied)
  const rawText = await callChat([
    { role: 'system', content: TAROT_SYSTEM },
    {
      role: 'user',
      content: `Create 3 specific, relatable fortune sentences for a Korean elementary school child's tarot reading.
Each fortune MUST include: (1) concrete action, (2) emotion word, (3) positive result.

DIVERSE GOOD examples covering different life areas:

School:
- "You **cleaned** your classroom carefully and **earned** a special stamp from your teacher!"
- "You **raised** your hand bravely in class and **answered** the question correctly!"

After-school:
- "You **practiced** piano at your lesson and **played** a difficult song perfectly!"
- "You **learned** a new taekwondo kick at the academy and **felt** so powerful!"

Home & Family:
- "You **helped** your mom cook dinner and **made** delicious kimchi fried rice together!"
- "You **played** a board game with your family and everyone **laughed** until their stomachs hurt!"

Hobbies:
- "You **finished** reading an exciting mystery book and **felt** so satisfied!"
- "You **built** an amazing LEGO spaceship and **showed** it to everyone with pride!"

Weekend:
- "You **visited** the park with your grandparents and **fed** the cute ducks together!"
- "You **are exploring** a cool museum with your family and discovering fascinating things!"

BAD examples (too vague or repetitive):
- "You **studied** hard yesterday." (What subject? Where? How did it feel?)
- "You **are having** a good time." (Doing what? With whom? Where?)
- "You **will** have a nice day." (Too general, no specific event)
- "You **helped** a friend..." (Too repetitive if used multiple times)

IMPORTANT: Create 3 COMPLETELY DIFFERENT scenarios.
- Use DIFFERENT settings each time (school, home, academy, park, library, etc.)
- VARY the activities (NOT just helping friends, sports, or presentations)
- Cover different parts of daily life (school, after-school, home, hobbies, weekend)
- Make each fortune feel unique and fresh

Now create 3 NEW fortunes in these tenses. Be specific and DIVERSE.

ALSO provide a SHORT scene description (10-15 words) for each fortune to help generate matching images.
Scene should match the fortune context:
- School: classroom, playground, cafeteria, school hallway
- Home: kitchen, living room, bedroom, dining table
- Outside: park, library, academy classroom, playground, museum
- Include appropriate elements and setting for each scenario

Return this JSON format:
{
  "past": "Simple past fortune text with ** wrapped verbs",
  "past_scene": "elementary school child [doing action], appropriate setting matching the fortune",
  "present": "Present continuous fortune text with ** wrapped verbs",
  "present_scene": "elementary school child [doing action], appropriate setting matching the fortune",
  "future": "Future will fortune text with ** wrapped verbs",
  "future_scene": "elementary school child [doing action], appropriate setting matching the fortune"
}

Return ONLY valid JSON, no markdown fences or explanations.`,
    },
  ], 'gpt-4o')

  let messages
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    messages = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
  } catch {
    throw new Error('Failed to parse tarot JSON from AI response')
  }

  return messages
}

// Optimized: Shorter prompts = faster DALL-E generation (1-3s saved per image)
// Updated: 3D chibi style matching tarot card front character design
const TAROT_IMAGE_PROMPT_BASE =
  '3D rendered chibi style, Pixar-like smooth shading, glossy vibrant colors, big expressive eyes, cute proportions, magical sparkles and glow effects, East Asian elementary school child, casual school clothes, classroom setting. Scene:'

// Generic prompts with realistic school scenarios
const GENERIC_TAROT_PROMPTS = {
  past: 'child receiving stamp from teacher, proud smile, warm atmosphere',
  present: 'children cleaning classroom together, teamwork and joy, bright energy',
  future: 'child with test paper showing good grade, hopeful confident expression',
}

export async function generateTarotImages(messages) {
  // Use generic prompts if messages are not provided (allows early parallel start)
  const usesGeneric = !messages || !messages.past

  // Extract scene descriptions if available, otherwise use text or generic prompts
  let pastPrompt, presentPrompt, futurePrompt

  if (usesGeneric) {
    // No messages provided - use generic prompts
    pastPrompt = GENERIC_TAROT_PROMPTS.past
    presentPrompt = GENERIC_TAROT_PROMPTS.present
    futurePrompt = GENERIC_TAROT_PROMPTS.future
  } else if (messages.past_scene && messages.present_scene && messages.future_scene) {
    // Scene descriptions available - use them for better image-text matching
    pastPrompt = messages.past_scene
    presentPrompt = messages.present_scene
    futurePrompt = messages.future_scene
  } else {
    // Fallback to text prompts (old behavior)
    pastPrompt = messages.past
    presentPrompt = messages.present
    futurePrompt = messages.future
  }

  // Generate all 3 images in parallel, wait for all to complete
  const [pastImg, presentImg, futureImg] = await Promise.all([
    callImage(`${TAROT_IMAGE_PROMPT_BASE} ${pastPrompt}`).catch(() => null),
    callImage(`${TAROT_IMAGE_PROMPT_BASE} ${presentPrompt}`).catch(() => null),
    callImage(`${TAROT_IMAGE_PROMPT_BASE} ${futurePrompt}`).catch(() => null),
  ])

  return { pastImg, presentImg, futureImg }
}
