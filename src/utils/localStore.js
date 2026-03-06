/**
 * LocalStorage utility for persisting activity history.
 * No external DB – all data stays on the user's device.
 */

const HISTORY_KEY = 'mfe_activity_history'
const MAX_HISTORY = 10

export function saveActivity(mode, content) {
  try {
    const history = getHistory()
    // Sanitize: don't store large blob URLs or image URLs
    const record = {
      mode,
      timestamp: new Date().toISOString(),
      summary:
        mode === 'fortune'
          ? content?.text?.slice(0, 100)
          : [content?.past?.text, content?.present?.text, content?.future?.text]
              .filter(Boolean)
              .map((t) => t.slice(0, 60))
              .join(' | '),
    }
    history.unshift(record)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
  } catch (e) {
    console.warn('LocalStorage write failed:', e)
  }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}
