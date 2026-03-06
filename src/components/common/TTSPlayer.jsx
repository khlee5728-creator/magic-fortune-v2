import { useState, useRef, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Loader2, Square } from 'lucide-react'
import { callTTS } from '../../api/openai'
import { AudioContext } from '../../App'

/**
 * TTS Player Button
 *
 * autoPlay: immediately plays TTS when mounted.
 * Uses a `cancelled` flag so that if StrictMode (or unmount) fires the
 * cleanup before the async API call returns, the stale response is discarded
 * and no duplicate audio is created.
 */
const TTSPlayer = ({ text, voice = 'nova', autoPlay = false, onEnded, size = 'md', buttonStyle = {}, idleLabel = 'Listen' }) => {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'playing'
  const audioRef   = useRef(null)
  const blobUrlRef = useRef(null)
  const isDuckedRef = useRef(false) // Track ducking state (fixes StrictMode cleanup issue)
  const audioControl = useContext(AudioContext)

  // ── Helpers ──────────────────────────────────────────────────────────────

  // Stop playback only — keeps blobUrlRef alive for re-listen (no API call needed)
  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    window.speechSynthesis?.cancel()
  }

  // Revoke the cached URL — called only on unmount
  const revokeUrl = () => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }
  }

  const speakFallback = (onDone) => {
    if (!window.speechSynthesis) { setStatus('idle'); audioControl?.onTTSEnd(); return }
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'; utt.rate = 0.85; utt.pitch = 1.1; utt.volume = 1
    utt.onend   = () => { setStatus('idle'); audioControl?.onTTSEnd(); onDone?.() }
    utt.onerror = () => { setStatus('idle'); audioControl?.onTTSEnd() }
    const voices = window.speechSynthesis.getVoices()
    const voice  = voices.find((v) => v.lang.startsWith('en') && !v.localService)
                || voices.find((v) => v.lang.startsWith('en'))
    if (voice) utt.voice = voice
    window.speechSynthesis.speak(utt)
    setStatus('playing')
  }

  // ── Auto-play effect ──────────────────────────────────────────────────────
  // The `cancelled` flag is LOCAL to each effect invocation.
  // If StrictMode's cleanup fires while the API call is still in-flight,
  // `cancelled` is set to true and the response is thrown away — preventing
  // the duplicate audio that would otherwise play on the second mount.
  useEffect(() => {
    if (!autoPlay) return () => stopAudio()

    let cancelled = false

    ;(async () => {
      setStatus('loading')
      // Duck background music before loading TTS
      audioControl?.onTTSStart()
      isDuckedRef.current = true // Mark as ducked

      try {
        const url = await callTTS(text, voice)
        if (cancelled) { URL.revokeObjectURL(url); return }   // ← stale, discard (cleanup handles restoration)
        blobUrlRef.current = url
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          if (!cancelled) {
            setStatus('idle')
            audioControl?.onTTSEnd() // Restore background music
            isDuckedRef.current = false // Unmark ducked state
            onEnded?.()
          }
        }
        audio.onerror = () => {
          if (!cancelled) {
            isDuckedRef.current = false // Unmark ducked state on error
            speakFallback(onEnded)
          }
        }
        await audio.play()
        if (!cancelled) setStatus('playing')
      } catch {
        if (!cancelled) speakFallback(onEnded)
      }
    })()

    return () => {
      cancelled = true
      stopAudio()
      revokeUrl()
      // Restore background music if component unmounts during playback
      // Use ref instead of status to avoid closure issues with StrictMode
      if (isDuckedRef.current) {
        audioControl?.onTTSEnd()
        isDuckedRef.current = false
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manual play button ────────────────────────────────────────────────────

  const handleClick = async () => {
    if (status === 'loading') return
    if (status === 'playing') {
      stopAudio()
      setStatus('idle')
      if (isDuckedRef.current) {
        audioControl?.onTTSEnd() // Restore background music when stopped
        isDuckedRef.current = false
      }
      return
    }

    // Duck background music before playing
    audioControl?.onTTSStart()
    isDuckedRef.current = true // Mark as ducked

    // Re-listen: cached URL still valid — play immediately, no API call
    if (blobUrlRef.current) {
      const audio = new Audio(blobUrlRef.current)
      audioRef.current = audio
      audio.onended = () => {
        setStatus('idle')
        audioControl?.onTTSEnd() // Restore background music
        isDuckedRef.current = false // Unmark ducked state
        onEnded?.()
      }
      audio.onerror = () => {
        revokeUrl()
        isDuckedRef.current = false // Unmark ducked state on error
        speakFallback(onEnded)
      }
      setStatus('playing')
      await audio.play()
      return
    }

    // First manual click (autoPlay=false path)
    setStatus('loading')
    audioControl?.onTTSStart() // Duck background music before loading TTS
    isDuckedRef.current = true // Mark as ducked
    try {
      const url = await callTTS(text, voice)
      blobUrlRef.current = url
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        setStatus('idle')
        audioControl?.onTTSEnd() // Restore background music
        isDuckedRef.current = false // Unmark ducked state
        onEnded?.()
      }
      audio.onerror = () => {
        isDuckedRef.current = false // Unmark ducked state on error
        speakFallback(onEnded)
      }
      await audio.play()
      setStatus('playing')
    } catch {
      isDuckedRef.current = false // Unmark ducked state on error
      speakFallback(onEnded)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const iconSize       = size === 'sm' ? '1rem'     : '1.4rem'
  const iconPx         = size === 'sm' ? 16          : 20
  const padding        = size === 'sm' ? '6px 14px' : '10px 22px'
  const buttonWidth    = size === 'sm' ? '8rem'     : '12rem'

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      animate={{ opacity: status === 'loading' ? 0.6 : 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding,
        borderRadius: '9999px',
        border: '1.5px solid #a78bfa',
        background: 'rgba(124, 58, 237, 0.75)',
        color: 'white',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: iconSize,
        cursor: 'pointer',
        backdropFilter: 'blur(6px)',
        width: buttonWidth,
        minHeight: '44px',
        ...buttonStyle,
      }}
      aria-label={status === 'playing' ? 'Stop audio' : 'Play audio'}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {status === 'idle'    && <Volume2 size={iconPx} />}
        {status === 'loading' && <Loader2 size={iconPx} className="spin" />}
        {status === 'playing' && <Square  size={iconPx} fill="currentColor" strokeWidth={0} />}
      </span>
      <span style={{ fontSize: '0.85rem', letterSpacing: '0.02em' }}>
        {status === 'idle'    && idleLabel}
        {status === 'loading' && 'Loading…'}
        {status === 'playing' && 'Stop'}
      </span>
    </motion.button>
  )
}

export default TTSPlayer
