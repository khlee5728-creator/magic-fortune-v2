import { useRef, useCallback, useEffect } from 'react'

/**
 * useSound Hook
 *
 * Provides a simple interface for playing sound effects.
 * Automatically handles audio cleanup and prevents overlapping plays.
 *
 * @param {string} src - Path to the audio file (e.g., '/sounds/click.mp3')
 * @param {object} options - Configuration options
 * @param {number} options.volume - Volume level (0.0 to 1.0, default: 0.5)
 * @param {boolean} options.preload - Preload the audio file on mount (default: false)
 *
 * @returns {function} play - Function to play the sound
 *
 * @example
 * const playClick = useSound('/sounds/click.mp3', { volume: 0.3 })
 * <button onClick={playClick}>Click me</button>
 */
const useSound = (src, { volume = 0.5, preload = false } = {}) => {
  const audioRef = useRef(null)
  const lastPlayTime = useRef(0)

  // Initialize audio in useEffect (proper place for side effects)
  useEffect(() => {
    try {
      const audio = new Audio(src)
      audio.volume = Math.max(0, Math.min(1, volume))
      audio.preload = preload ? 'auto' : 'none'
      audioRef.current = audio

      // Cleanup on unmount or when src/volume/preload changes
      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          // Don't modify src or set null - causes StrictMode issues
          // The next useEffect run will replace the entire audio object
        }
      }
    } catch (error) {
      console.warn(`[useSound] Failed to load audio: ${src}`, error)
    }
  }, [src, volume, preload])

  // Play function with stable reference (no dependencies)
  const play = useCallback(() => {
    // Throttle: prevent playing too frequently (50ms minimum gap)
    const now = Date.now()
    if (now - lastPlayTime.current < 50) {
      return
    }
    lastPlayTime.current = now

    const audio = audioRef.current
    if (!audio) return

    // Reset to start and play
    try {
      audio.currentTime = 0
      const playPromise = audio.play()

      // Handle play promise (required for some browsers)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Log errors for debugging (e.g., user hasn't interacted with page yet)
          console.warn('[useSound] Play prevented:', error.message)
        })
      }
    } catch (error) {
      console.warn('[useSound] Play error:', error.message)
    }
  }, []) // Empty deps - stable reference

  return play
}

export default useSound
