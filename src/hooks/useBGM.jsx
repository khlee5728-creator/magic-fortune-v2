import { useEffect, useRef, useState } from 'react'

/**
 * useBGM Hook
 *
 * Manages background music with loop, fade-in/out, and volume control.
 * Automatically cleans up on unmount.
 *
 * @param {string} src - Path to the audio file (e.g., '/sounds/ambient.mp3')
 * @param {object} options - Configuration options
 * @param {number} options.volume - Target volume level (0.0 to 1.0, default: 0.2)
 * @param {boolean} options.loop - Whether to loop the audio (default: true)
 * @param {boolean} options.autoPlay - Start playing on mount (default: true)
 * @param {number} options.fadeInDuration - Fade-in duration in ms (default: 2000)
 *
 * @returns {object} Controls - { play, pause, stop, isPlaying, setVolume }
 *
 * @example
 * const bgm = useBGM('/sounds/intro-ambient.mp3', { volume: 0.15 })
 * <button onClick={bgm.isPlaying ? bgm.pause : bgm.play}>Toggle Music</button>
 */
const useBGM = (
  src,
  { volume = 0.2, loop = true, autoPlay = true, fadeInDuration = 2000 } = {}
) => {
  const audioRef = useRef(null)
  const fadeIntervalRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const targetVolumeRef = useRef(volume) // Store original target volume
  const isDuckingRef = useRef(false) // Track if BGM is currently ducked
  const duckPriorityRef = useRef(0) // Track ducking priority (0=none, 1=SFX, 2=TTS)

  // Initialize audio
  useEffect(() => {
    if (!src) return

    try {
      const audio = new Audio(src)
      audio.loop = loop
      audio.volume = 0 // Start at 0 for fade-in
      audioRef.current = audio

      // Event listeners
      audio.addEventListener('play', () => setIsPlaying(true))
      audio.addEventListener('pause', () => setIsPlaying(false))
      audio.addEventListener('ended', () => setIsPlaying(false))

      // Auto-play with fade-in
      if (autoPlay) {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              fadeIn(volume, fadeInDuration)
            })
            .catch(error => {
              console.debug('[useBGM] Autoplay prevented:', error.message)
            })
        }
      }

      return () => {
        clearInterval(fadeIntervalRef.current)
        audio.pause()
        audio.src = ''
        audioRef.current = null
      }
    } catch (error) {
      console.warn(`[useBGM] Failed to load audio: ${src}`, error)
    }
  }, [src, loop, autoPlay, volume, fadeInDuration])

  // Update target volume ref when volume prop changes
  useEffect(() => {
    targetVolumeRef.current = volume
  }, [volume])

  // Fade-in effect
  const fadeIn = (targetVolume, duration) => {
    const audio = audioRef.current
    if (!audio) return

    const steps = 50
    const stepDuration = duration / steps
    const volumeIncrement = targetVolume / steps

    let currentStep = 0
    clearInterval(fadeIntervalRef.current)

    fadeIntervalRef.current = setInterval(() => {
      if (currentStep >= steps) {
        audio.volume = targetVolume
        clearInterval(fadeIntervalRef.current)
        return
      }

      currentStep++
      audio.volume = Math.min(volumeIncrement * currentStep, targetVolume)
    }, stepDuration)
  }

  // Fade-out effect
  const fadeOut = (duration, onComplete) => {
    const audio = audioRef.current
    if (!audio) return

    const steps = 50
    const stepDuration = duration / steps
    const currentVolume = audio.volume
    const volumeDecrement = currentVolume / steps

    let currentStep = 0
    clearInterval(fadeIntervalRef.current)

    fadeIntervalRef.current = setInterval(() => {
      if (currentStep >= steps) {
        audio.volume = 0
        clearInterval(fadeIntervalRef.current)
        onComplete?.()
        return
      }

      currentStep++
      audio.volume = Math.max(currentVolume - volumeDecrement * currentStep, 0)
    }, stepDuration)
  }

  // Control functions
  const play = () => {
    const audio = audioRef.current
    if (!audio) return

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Only fadeIn if not currently ducking (prevents volume jump during TTS)
          if (!isDuckingRef.current) {
            fadeIn(volume, fadeInDuration)
          }
        })
        .catch(error => {
          console.debug('[useBGM] Play prevented:', error.message)
        })
    }
  }

  const pause = (immediate = false) => {
    const audio = audioRef.current
    if (!audio) return

    if (immediate) {
      // Immediate pause without fade (for toggle button)
      clearInterval(fadeIntervalRef.current)
      audio.pause()
    } else {
      // Gentle fade out (for programmatic pause)
      fadeOut(1000, () => {
        audio.pause()
      })
    }
  }

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return

    fadeOut(500, () => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  const setVolume = newVolume => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = Math.max(0, Math.min(1, newVolume))
  }

  // Fade to a specific volume over duration (for ducking)
  const fadeToVolume = (targetVolume, duration) => {
    const audio = audioRef.current
    if (!audio) return

    const steps = 30  // Reduced from 50 for faster response
    const stepDuration = duration / steps
    const currentVolume = audio.volume
    const volumeDelta = targetVolume - currentVolume
    const volumeIncrement = volumeDelta / steps

    let currentStep = 0
    clearInterval(fadeIntervalRef.current)

    fadeIntervalRef.current = setInterval(() => {
      if (currentStep >= steps) {
        audio.volume = Math.max(0, Math.min(1, targetVolume))
        clearInterval(fadeIntervalRef.current)
        return
      }

      currentStep++
      const newVolume = currentVolume + volumeIncrement * currentStep
      audio.volume = Math.max(0, Math.min(1, newVolume))
    }, stepDuration)
  }

  // Duck: Lower volume temporarily (for TTS or sound effects)
  const duck = (targetVolume = 0.03, priority = 0) => {
    const audio = audioRef.current
    if (!audio) return

    // Ignore if current priority is higher (e.g., don't let SFX override TTS)
    if (priority < duckPriorityRef.current) return

    duckPriorityRef.current = priority
    isDuckingRef.current = true

    // Instantly set volume (no fade) to prevent interference
    clearInterval(fadeIntervalRef.current)
    audio.volume = Math.max(0.01, Math.min(1, targetVolume))
  }

  // Restore: Return to original volume
  const restore = (duration = 800, priority = 0) => {
    // Only restore if priority matches or is higher (prevents SFX from restoring during TTS)
    if (priority < duckPriorityRef.current) return

    duckPriorityRef.current = 0
    isDuckingRef.current = false
    fadeToVolume(targetVolumeRef.current, duration)
  }

  return {
    play,
    pause,
    stop,
    isPlaying,
    setVolume,
    duck,
    restore,
  }
}

export default useBGM
