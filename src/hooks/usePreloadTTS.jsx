import { useState, useEffect } from 'react'
import { callTTS } from '../api/openai'
import { characterGreetings } from '../data/characterGreetings'

/**
 * Preload all character greetings with TTS on component mount
 *
 * This hook loads TTS audio for all pre-written greetings in the background,
 * enabling instant playback (< 0.1s) when user clicks character.
 *
 * @returns {Object} { isReady: boolean, progress: number, error: string|null }
 */
export function usePreloadTTS() {
  const [isReady, setIsReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const preloadAllGreetings = async () => {
      try {
        // Collect all greetings with their voice assignments
        const allGreetings = [
          ...characterGreetings.luna.map(text => ({ text, voice: 'nova' })),
          ...characterGreetings.noir.map(text => ({ text, voice: 'alloy' })),
        ]

        const total = allGreetings.length
        let loaded = 0

        // Load in batches of 3 to avoid overwhelming the API
        const batchSize = 3
        for (let i = 0; i < allGreetings.length; i += batchSize) {
          if (cancelled) break

          const batch = allGreetings.slice(i, i + batchSize)

          await Promise.all(
            batch.map(async ({ text, voice }) => {
              try {
                // callTTS automatically caches the result
                await callTTS(text, voice)
                loaded++
                if (!cancelled) {
                  setProgress(Math.round((loaded / total) * 100))
                }
              } catch (err) {
                console.warn('Failed to preload TTS:', text, err)
                // Continue loading others even if one fails
              }
            })
          )
        }

        if (!cancelled) {
          setIsReady(true)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('TTS preload error:', err)
          setError(err.message || 'Failed to preload TTS')
          // Set ready anyway to not block the UI
          setIsReady(true)
        }
      }
    }

    preloadAllGreetings()

    return () => {
      cancelled = true
    }
  }, [])

  return { isReady, progress, error }
}
