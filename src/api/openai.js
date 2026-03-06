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
Create a positive, encouraging English fortune message using simple vocabulary (CEFR B1, ~800 core words).
Topics: school, friends, hobbies, sports, food, creativity.
Length: 1–2 short sentences only. Be warm, fun, and imaginative.`

export async function generateFortuneCookieContent() {
  const text = await callChat([
    { role: 'system', content: FORTUNE_SYSTEM },
    { role: 'user',   content: 'Give me one magical fortune cookie message for a child.' },
  ])
  return { text: text.trim() }
}

// ─── Tarot Card ───────────────────────────────────────────────────────────────

const TAROT_SYSTEM = `You are a magical fortune teller for children aged 7–13.
Create positive, encouraging English fortune messages using simple vocabulary (CEFR B1, ~800 core words).
Topics: school, friends, hobbies, sports, food, creativity. Each sentence should be fun and optimistic.`

export async function generateTarotContent() {
  // 1. Generate 3 tense-specific sentences
  const rawText = await callChat([
    { role: 'system', content: TAROT_SYSTEM },
    {
      role: 'user',
      content: `Create 3 fortune sentences in different English tenses for a child's tarot reading.
Wrap the key tense word(s) in **double asterisks** to mark them for emphasis.
Return ONLY a valid JSON object with no markdown fences or extra text:
{
  "past":    "Simple past tense. Wrap the main past verb(s) in ** (e.g. You **studied** hard and **won** a gold star.)",
  "present": "Present continuous. Wrap the auxiliary + gerund in ** (e.g. You **are having** an amazing adventure right now.)",
  "future":  "Future with will. Wrap will in ** (e.g. You **will** find a wonderful surprise waiting for you!)"
}`,
    },
  ])

  let messages
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    messages = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
  } catch {
    throw new Error('Failed to parse tarot JSON from AI response')
  }

  // 2. Generate 3 tarot-style images in parallel
  const imagePromptBase =
    'Magical tarot card illustration for a children\'s educational app. Dreamy, watercolor style, vibrant colors, child-friendly, no text or letters in the image. Elementary school life with a mystical twist. Scene:'

  const [pastImg, presentImg, futureImg] = await Promise.all([
    callImage(`${imagePromptBase} ${messages.past}`),
    callImage(`${imagePromptBase} ${messages.present}`),
    callImage(`${imagePromptBase} ${messages.future}`),
  ])

  return {
    past:    { text: messages.past,    image: pastImg,    label: 'Past',    tense: 'past' },
    present: { text: messages.present, image: presentImg, label: 'Present', tense: 'present' },
    future:  { text: messages.future,  image: futureImg,  label: 'Future',  tense: 'future' },
  }
}
