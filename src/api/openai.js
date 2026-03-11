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
Create relatable, specific English fortune messages about REAL Korean school life moments.
Use simple vocabulary (CEFR B1) and vivid details that make kids say "That's exactly like me!"

Focus on concrete Korean school situations:
- Classroom: finishing homework, dictation tests (받아쓰기), answering questions, group work (모둠활동), presentations
- Friendships: playing with seatmates (짝꿍), sharing lunch, helping friends, making new friends, solving arguments
- School duties: classroom cleaning time (청소시간), lunch duty, being class leader
- Achievements: getting teacher stamps/stickers (도장), winning games, learning new skills, being kind, being brave
- Emotions: feeling proud, excited, nervous, happy, confident, curious
- Daily moments: break time (쉬는 시간), school lunch (급식), PE class (체육), music room, art room, science lab
- School events: field trips (현장학습), sports day (운동회), talent shows (발표회/학예회)

Each fortune MUST include:
1. A SPECIFIC action or event (not "studied hard" but "practiced dictation words")
2. An EMOTION word (proud, excited, brave, happy, etc.)
3. A POSITIVE result (teacher gave stamp, friend smiled, you felt amazing, etc.)

You must also provide SHORT scene descriptions (10-15 words max) for image generation.
Scene descriptions should show KOREAN school settings (uniforms, Korean classroom, Korean school culture).

Make it feel personal, like the fortune was written just for them.`

export async function generateTarotText() {
  // Using gpt-3.5-turbo for 3x faster generation (0.5-1s vs 2-3s)
  const rawText = await callChat([
    { role: 'system', content: TAROT_SYSTEM },
    {
      role: 'user',
      content: `Create 3 specific, relatable fortune sentences for a Korean elementary school child's tarot reading.
Each fortune MUST include: (1) concrete action, (2) emotion word, (3) positive result.

GOOD examples (Korean school context):
- "You **cleaned** your classroom carefully and **earned** a special stamp from your teacher!"
- "You **are sharing** your school lunch with your seatmate and laughing together!"
- "You **will** ace your dictation test because you practiced so hard!"

MORE GOOD examples:
- "You **helped** your 짝꿍 (seatmate) with a tricky problem and **felt** really helpful!"
- "You **are playing** tag during break time and feeling so energetic and happy!"
- "You **will** get picked for the sports day relay team and feel super excited!"

BAD examples (too vague):
- "You **studied** hard yesterday." (What subject? How did it feel?)
- "You **are having** a good time." (Doing what? With whom?)
- "You **will** have a nice day." (Too general, no specific event)

Focus on Korean school life: cleaning time, school lunch, stamps/stickers, group work, seatmates,
break time, field trips, sports day, talent shows, special classrooms (music/art/science).

Now create 3 NEW fortunes in these tenses. Be specific about the Korean school moment.

ALSO provide a SHORT scene description (10-15 words) for each fortune to help generate matching images.
Scene should show KOREAN school settings: Korean students in uniforms or gym clothes, Korean classroom.

Return this JSON format:
{
  "past": "Simple past fortune text with ** wrapped verbs",
  "past_scene": "Korean elementary student [doing action], school uniform/gym clothes, Korean classroom",
  "present": "Present continuous fortune text with ** wrapped verbs",
  "present_scene": "Korean elementary student [doing action], school uniform/gym clothes, Korean classroom",
  "future": "Future will fortune text with ** wrapped verbs",
  "future_scene": "Korean elementary student [doing action], school uniform/gym clothes, Korean classroom"
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
// Updated: Korean school context for better cultural relevance
const TAROT_IMAGE_PROMPT_BASE =
  'Watercolor illustration, Korean elementary school student, school uniform or gym clothes, Korean classroom setting, magical sparkles, vibrant colors. Scene:'

// Generic prompts with Korean school context for cultural relevance
const GENERIC_TAROT_PROMPTS = {
  past: 'Korean student receiving stamp from teacher, proud smile, warm atmosphere',
  present: 'Korean students cleaning classroom together, teamwork and joy, bright energy',
  future: 'Korean student with test paper showing good grade, hopeful confident expression',
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
