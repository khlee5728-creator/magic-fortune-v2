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

const TAROT_SYSTEM = `You are a magical fortune teller for elementary school children aged 7–13.
Create relatable, specific English fortune messages about REAL school life moments.
Use simple vocabulary (CEFR B1) and vivid details that make kids say "That's exactly like me!"

Focus on concrete situations:
- Classroom: finishing homework, acing tests, answering questions, group projects, presentations
- Friendships: playing tag, sharing snacks, helping friends, making new friends, solving arguments
- Achievements: getting gold stars, winning games, learning new skills, being kind, being brave
- Emotions: feeling proud, excited, nervous, happy, confident, curious
- Daily moments: recess, lunch time, art class, PE, music, library, field trips

Each fortune MUST include:
1. A SPECIFIC action or event (not "studied hard" but "practiced spelling words")
2. An EMOTION word (proud, excited, brave, happy, etc.)
3. A POSITIVE result (teacher smiled, friend hugged you, you felt amazing, etc.)

You must also provide SHORT scene descriptions (10-15 words max) for image generation.
Scene descriptions should capture the KEY VISUAL MOMENT from the fortune text.

Make it feel personal, like the fortune was written just for them.`

export async function generateTarotText() {
  // Using gpt-3.5-turbo for 3x faster generation (0.5-1s vs 2-3s)
  const rawText = await callChat([
    { role: 'system', content: TAROT_SYSTEM },
    {
      role: 'user',
      content: `Create 3 specific, relatable fortune sentences for an elementary school child's tarot reading.
Each fortune MUST include: (1) concrete action, (2) emotion word, (3) positive result.

GOOD examples (specific + relatable):
- "You **helped** your friend find their lost eraser and they **gave** you a big thankful smile!"
- "You **are practicing** your times tables and feeling more confident with every answer!"
- "You **will** make everyone laugh with your creative story during reading time!"

BAD examples (too vague):
- "You **studied** hard yesterday." (What subject? How did it feel?)
- "You **are having** a good time." (Doing what? With whom?)
- "You **will** have a nice day." (Too general, no specific event)

Now create 3 NEW fortunes in these tenses. Be specific about the school moment.

ALSO provide a SHORT scene description (10-15 words) for each fortune to help generate matching images.
Scene should capture the KEY VISUAL MOMENT (e.g., "child at desk solving math problem, happy expression, lightbulb moment").

Return this JSON format:
{
  "past": "Simple past fortune text with ** wrapped verbs",
  "past_scene": "10-15 word visual scene description",
  "present": "Present continuous fortune text with ** wrapped verbs",
  "present_scene": "10-15 word visual scene description",
  "future": "Future will fortune text with ** wrapped verbs",
  "future_scene": "10-15 word visual scene description"
}

Return ONLY valid JSON, no markdown fences or explanations.`,
    },
  ], 'gpt-3.5-turbo')

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
// Updated: More specific school scenes for better relatability
const TAROT_IMAGE_PROMPT_BASE =
  'Watercolor illustration, happy elementary school child, magical sparkles, vibrant colors. Scene:'

// Generic prompts with concrete school moments for relatability
const GENERIC_TAROT_PROMPTS = {
  past: 'Child at school desk raising hand proudly, warm golden glow',
  present: 'Child playing with friends at recess, joyful rainbow sparkles',
  future: 'Child holding trophy or star sticker, bright hopeful light',
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
