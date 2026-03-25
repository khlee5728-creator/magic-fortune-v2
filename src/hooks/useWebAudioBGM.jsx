import { useEffect, useRef, useState } from 'react'

/**
 * useWebAudioBGM Hook
 *
 * Web Audio API-based background music manager with iOS Safari compatibility.
 * Uses GainNode for volume control to work around iOS Safari's HTMLAudioElement.volume limitation.
 *
 * Key difference from useBGM:
 * - Routes audio through Web Audio API (AudioContext → GainNode → Destination)
 * - Volume control works on iOS Safari (HTMLAudioElement.volume doesn't work on iOS)
 *
 * @param {string} src - Path to the audio file
 * @param {object} options - Configuration options
 * @param {number} options.volume - Target volume level (0.0 to 1.0, default: 0.2)
 * @param {boolean} options.loop - Whether to loop the audio (default: true)
 * @param {boolean} options.autoPlay - Start playing on mount (default: true)
 * @param {number} options.fadeInDuration - Fade-in duration in ms (default: 2000)
 *
 * @returns {object} Controls - { play, pause, stop, isPlaying, setVolume, duck, restore }
 *
 * @example
 * const bgm = useWebAudioBGM('/sounds/intro-ambient.mp3', { volume: 0.15 })
 * <button onClick={bgm.isPlaying ? bgm.pause : bgm.play}>Toggle Music</button>
 */
const useWebAudioBGM = (
  src,
  { volume = 0.2, loop = true, autoPlay = true, fadeInDuration = 2000 } = {}
) => {
  const audioContextRef = useRef(null)
  const audioElementRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const gainNodeRef = useRef(null)
  const fadeIntervalRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const targetVolumeRef = useRef(volume) // Store original target volume
  const isDuckingRef = useRef(false) // Track if BGM is currently ducked
  const duckPriorityRef = useRef(0) // Track ducking priority (0=none, 1=SFX, 2=TTS)

  // Initialize AudioContext and audio graph
  useEffect(() => {
    if (!src) return

    try {
      // Create AudioContext (with webkit prefix for older Safari)
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        console.warn('[useWebAudioBGM] Web Audio API not supported')
        return
      }

      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext

      // Create audio element
      const audioElement = new Audio(src)
      audioElement.loop = loop
      audioElement.crossOrigin = 'anonymous' // Required for createMediaElementSource
      audioElementRef.current = audioElement

      // Create Web Audio API nodes
      const sourceNode = audioContext.createMediaElementSource(audioElement)
      const gainNode = audioContext.createGain()

      // Connect: Audio Element → Source → Gain → Destination
      sourceNode.connect(gainNode)
      gainNode.connect(audioContext.destination)

      sourceNodeRef.current = sourceNode
      gainNodeRef.current = gainNode

      // Set initial volume to 0 for fade-in
      gainNode.gain.value = 0

      // Event listeners
      audioElement.addEventListener('play', () => setIsPlaying(true))
      audioElement.addEventListener('pause', () => setIsPlaying(false))
      audioElement.addEventListener('ended', () => setIsPlaying(false))

      // iOS Safari: AudioContext starts in suspended state, needs user gesture
      const unlockAudioContext = () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.debug('[useWebAudioBGM] AudioContext unlocked')
          })
        }
      }

      // Unlock on first user interaction
      document.addEventListener('touchstart', unlockAudioContext, { once: true })
      document.addEventListener('click', unlockAudioContext, { once: true })

      // Auto-play with fade-in
      if (autoPlay) {
        // Wait a bit for user interaction on iOS
        const playPromise = audioElement.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              fadeInWebAudio(volume, fadeInDuration)
            })
            .catch(error => {
              console.debug('[useWebAudioBGM] Autoplay prevented:', error.message)
            })
        }
      }

      return () => {
        clearInterval(fadeIntervalRef.current)
        audioElement.pause()

        // Disconnect nodes
        if (sourceNode) sourceNode.disconnect()
        if (gainNode) gainNode.disconnect()

        // Close AudioContext
        if (audioContext.state !== 'closed') {
          audioContext.close()
        }

        audioElement.src = ''
        audioElementRef.current = null
        audioContextRef.current = null
        sourceNodeRef.current = null
        gainNodeRef.current = null
      }
    } catch (error) {
      console.warn(`[useWebAudioBGM] Failed to load audio: ${src}`, error)
    }
  }, [src, loop, autoPlay, volume, fadeInDuration])

  // Update target volume ref when volume prop changes
  useEffect(() => {
    targetVolumeRef.current = volume
  }, [volume])

  // Fade-in using setInterval (for compatibility with older browsers)
  const fadeInWebAudio = (targetVolume, duration) => {
    const gainNode = gainNodeRef.current
    if (!gainNode) return

    const steps = 50
    const stepDuration = duration / steps
    const volumeIncrement = targetVolume / steps

    let currentStep = 0
    clearInterval(fadeIntervalRef.current)

    fadeIntervalRef.current = setInterval(() => {
      if (currentStep >= steps) {
        gainNode.gain.value = targetVolume
        clearInterval(fadeIntervalRef.current)
        return
      }

      currentStep++
      gainNode.gain.value = Math.min(volumeIncrement * currentStep, targetVolume)
    }, stepDuration)
  }

  // Fade-out using setInterval
  const fadeOutWebAudio = (duration, onComplete) => {
    const gainNode = gainNodeRef.current
    if (!gainNode) return

    const steps = 50
    const stepDuration = duration / steps
    const currentVolume = gainNode.gain.value
    const volumeDecrement = currentVolume / steps

    let currentStep = 0
    clearInterval(fadeIntervalRef.current)

    fadeIntervalRef.current = setInterval(() => {
      if (currentStep >= steps) {
        gainNode.gain.value = 0
        clearInterval(fadeIntervalRef.current)
        onComplete?.()
        return
      }

      currentStep++
      gainNode.gain.value = Math.max(currentVolume - volumeDecrement * currentStep, 0)
    }, stepDuration)
  }

  // Fade to a specific volume over duration
  const fadeToVolumeWebAudio = (targetVolume, duration) => {
    const gainNode = gainNodeRef.current
    if (!gainNode) return

    const steps = 30  // Reduced from 50 for faster response
    const stepDuration = duration / steps
    const currentVolume = gainNode.gain.value
    const volumeDelta = targetVolume - currentVolume
    const volumeIncrement = volumeDelta / steps

    let currentStep = 0
    clearInterval(fadeIntervalRef.current)

    fadeIntervalRef.current = setInterval(() => {
      if (currentStep >= steps) {
        gainNode.gain.value = Math.max(0, Math.min(1, targetVolume))
        clearInterval(fadeIntervalRef.current)
        return
      }

      currentStep++
      const newVolume = currentVolume + volumeIncrement * currentStep
      gainNode.gain.value = Math.max(0, Math.min(1, newVolume))
    }, stepDuration)
  }

  // Control functions
  const play = () => {
    const audioElement = audioElementRef.current
    const audioContext = audioContextRef.current
    if (!audioElement) return

    // Resume AudioContext if suspended (iOS Safari)
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const playPromise = audioElement.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Only fadeIn if not currently ducking (prevents volume jump during TTS)
          if (!isDuckingRef.current) {
            fadeInWebAudio(volume, fadeInDuration)
          }
        })
        .catch(error => {
          console.debug('[useWebAudioBGM] Play prevented:', error.message)
        })
    }
  }

  const pause = (immediate = false) => {
    const audioElement = audioElementRef.current
    if (!audioElement) return

    if (immediate) {
      // Immediate pause without fade (for toggle button)
      clearInterval(fadeIntervalRef.current)
      audioElement.pause()
    } else {
      // Gentle fade out (for programmatic pause)
      fadeOutWebAudio(1000, () => {
        audioElement.pause()
      })
    }
  }

  const stop = () => {
    const audioElement = audioElementRef.current
    if (!audioElement) return

    fadeOutWebAudio(500, () => {
      audioElement.pause()
      audioElement.currentTime = 0
    })
  }

  const setVolume = newVolume => {
    const gainNode = gainNodeRef.current
    if (!gainNode) return
    gainNode.gain.value = Math.max(0, Math.min(1, newVolume))
  }

  // Duck: Lower volume temporarily (for TTS or sound effects)
  const duck = (targetVolume = 0.03, priority = 0) => {
    const gainNode = gainNodeRef.current
    if (!gainNode) return

    // Ignore if current priority is higher (e.g., don't let SFX override TTS)
    if (priority < duckPriorityRef.current) return

    duckPriorityRef.current = priority
    isDuckingRef.current = true

    // Instantly set volume (no fade) to prevent interference
    // Using GainNode works on iOS Safari!
    clearInterval(fadeIntervalRef.current)
    gainNode.gain.value = Math.max(0.01, Math.min(1, targetVolume))
  }

  // Restore: Return to original volume
  const restore = (duration = 800, priority = 0) => {
    // Only restore if priority matches or is higher (prevents SFX from restoring during TTS)
    if (priority < duckPriorityRef.current) return

    duckPriorityRef.current = 0
    isDuckingRef.current = false
    fadeToVolumeWebAudio(targetVolumeRef.current, duration)
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

export default useWebAudioBGM
