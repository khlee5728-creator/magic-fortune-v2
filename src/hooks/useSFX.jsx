import { useContext } from 'react'
import useSound from './useSound'
import { AudioContext } from '../App'

/**
 * useSFX Hook
 *
 * Global sound effects management hook.
 * Integrates with AudioContext to coordinate with background music (BGM ducking).
 *
 * Phase 1: Core sound effects for tarot cards and fortune cookies
 *
 * @returns {object} Sound effect playback functions
 *
 * @example
 * const sfx = useSFX()
 * <button onClick={sfx.playCardTap}>Click</button>
 */
const useSFX = () => {
  const audioControl = useContext(AudioContext)

  // Phase 1: Core sound effects
  const cardTap = useSound(`${import.meta.env.BASE_URL}sounds/card-select.mp3`, { volume: 0.3 }) // Reuse intro card-select sound
  const cardFlip = useSound(`${import.meta.env.BASE_URL}sounds/card-flip.mp3`, { volume: 0.4 })
  const cookieCrack = useSound(`${import.meta.env.BASE_URL}sounds/cookie-crack.mp3`, { volume: 0.4 })
  const magicReveal = useSound(`${import.meta.env.BASE_URL}sounds/magic-reveal.mp3`, { volume: 0.3 })

  /**
   * Wrapper function that ducks background music before playing sound effect
   * Ensures sound effects are clearly audible over background music
   */
  const playWithDuck = (soundFn) => {
    audioControl?.onSFXPlay() // Duck BGM (reduce volume temporarily)
    soundFn() // Play sound effect
  }

  return {
    // Tarot card sounds
    playCardTap: () => playWithDuck(cardTap),
    playCardFlip: () => playWithDuck(cardFlip),

    // Fortune cookie sounds
    playCookieCrack: () => playWithDuck(cookieCrack),
    playMagicReveal: () => playWithDuck(magicReveal),
  }
}

export default useSFX
