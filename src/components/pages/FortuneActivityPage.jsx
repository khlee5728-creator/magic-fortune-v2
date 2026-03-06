import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import TTSPlayer from '../common/TTSPlayer'
import MagicButton from '../common/MagicButton'
import CharacterVideo from '../common/CharacterVideo'

const COOKIE_COUNT = 5

// ── Floating Character ────────────────────────────────────────────────────────

const FLOAT_POSITIONS = [
  { x:  -20, y:  90 },  // left side
  { x:   80, y: 270 },  // left, cookie-level
  { x:  280, y:  40 },  // above cookie 2
  { x:  520, y:  20 },  // above cookie 3 (center)
  { x:  760, y:  40 },  // above cookie 4-5
  { x:  990, y: 110 },  // right side
  { x:  820, y: 290 },  // right, cookie-level
  { x:  -20, y: 420 },  // bottom-left
]
const REVEALED_POS = { x: 20, y: 80 }

const FloatingCharacter = ({ revealed }) => {
  const [posIdx, setPosIdx] = useState(0)
  const [tilt, setTilt] = useState(0)

  useEffect(() => {
    if (revealed) return
    let timeout
    const move = () => {
      setPosIdx(prev => {
        const options = FLOAT_POSITIONS.map((_, i) => i).filter(i => i !== prev)
        const next = options[Math.floor(Math.random() * options.length)]
        const dx = FLOAT_POSITIONS[next].x - FLOAT_POSITIONS[prev].x
        setTilt(Math.max(-8, Math.min(8, dx * 0.025)))
        setTimeout(() => setTilt(0), 1200)
        return next
      })
      timeout = setTimeout(move, 2500 + Math.random() * 1500)
    }
    timeout = setTimeout(move, 2500 + Math.random() * 1500)
    return () => clearTimeout(timeout)
  }, [revealed])

  const pos = revealed ? REVEALED_POS : FLOAT_POSITIONS[posIdx]
  const srcs = revealed
    ? ['/fortune-char-reveal.png']
    : [
        '/fortune-char-1.png', '/fortune-char-2.png', '/fortune-char-3.png',
        '/fortune-char-4.png', '/fortune-char-5.png', '/fortune-char-6.png',
      ]

  return (
    <motion.div
      animate={{ x: pos.x, y: pos.y, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 35, damping: 14 }}
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}
    >
      <CharacterVideo
        key={revealed ? 'reveal' : 'float'}
        srcs={srcs}
        poseDuration={2000}
        noEntrance
        panelStyle={{ width: '240px', height: '360px' }}
      />
    </motion.div>
  )
}

// ── Fortune Activity Page ─────────────────────────────────────────────────────

/**
 * Fortune Cookie Activity Page
 *
 * Layout: full-screen (1280×800). Character floats freely around cookies.
 *
 * Flow:
 *  1. Character drifts between 7 positions around the 5 cookies every 3.2s.
 *  2. User clicks a cookie → crack animation plays.
 *  3. Fortune message appears at center; character settles to the left.
 *  4. "Try Again" button navigates back to intro.
 */
const FortuneActivityPage = ({ content, onTryAgain }) => {
  const [cookieStates, setCookieStates] = useState(Array(COOKIE_COUNT).fill('idle'))
  const [revealed, setRevealed] = useState(false)

  const handleCookieClick = (idx) => {
    if (revealed || cookieStates.some((s) => s !== 'idle')) return
    setCookieStates(cookieStates.map((_, i) => (i === idx ? 'selected' : 'fading')))
    setTimeout(() => setRevealed(true), 750)
  }

  const fortuneText = content?.text ?? '✨ Your magic fortune is on its way!'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Floating character — drifts around cookies, settles left on reveal */}
      <FloatingCharacter revealed={revealed} />

      {/* Centered UI — above character */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '2rem 5rem',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <h2
            className="font-magic text-gold-shine"
            style={{ fontSize: '1.8rem', margin: 0 }}
          >
            {revealed ? '🌟 Your Fortune!' : '🥠 Choose Your Lucky Cookie!'}
          </h2>
          {!revealed && (
            <p style={{ color: '#c4b5fd', fontSize: '0.9rem', margin: '0.4rem 0 0', fontFamily: 'Nunito, sans-serif' }}>
              Tap a cookie to reveal your magic English message ✨
            </p>
          )}
        </motion.div>

        {/* Cookie Row ↔ Fortune Message */}
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="cookies"
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                flex: 1,
              }}
            >
              {Array.from({ length: COOKIE_COUNT }, (_, idx) => (
                <CookieSlot
                  key={idx}
                  state={cookieStates[idx]}
                  onClick={() => handleCookieClick(idx)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="fortune"
              initial={{ opacity: 0, y: 48, rotate: -6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, rotate: -0.8, scale: 1 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              style={{
                background: 'linear-gradient(170deg, #fefce8 0%, #fdf6d0 40%, #fbedb0 100%)',
                border: '1px solid #c8a84b',
                borderRadius: '6px',
                padding: '1.75rem 3rem',
                width: '100%',
                maxWidth: '640px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 16px 48px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25), inset 0 0 60px rgba(200,168,75,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
            >
              {/* 상단 빨간 장식선 */}
              <div style={{
                position: 'absolute', top: '16px', left: '2rem', right: '2rem',
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent, #c0392b 20%, #c0392b 80%, transparent)',
                opacity: 0.7,
              }} />
              {/* 하단 빨간 장식선 */}
              <div style={{
                position: 'absolute', bottom: '16px', left: '2rem', right: '2rem',
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent, #c0392b 20%, #c0392b 80%, transparent)',
                opacity: 0.7,
              }} />
              <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem', marginTop: '0.25rem', opacity: 0.85 }}>✦</div>
              <p style={{
                color: '#2d1500',
                fontFamily: 'Cinzel, serif',
                fontWeight: 600,
                fontSize: '1.15rem',
                lineHeight: 1.75,
                margin: '0',
                letterSpacing: '0.03em',
              }}>
                "{fortuneText}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons: Listen again + Try Again */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
            >
              <TTSPlayer
                text={fortuneText}
                autoPlay
                idleLabel="Listen again"
                buttonStyle={{
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  border: '1.5px solid #a78bfa',
                  color: 'white',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 800,
                  borderRadius: '16px',
                  padding: '12px 28px',
                  fontSize: '1.05rem',
                  backdropFilter: 'blur(6px)',
                  letterSpacing: '0.02em',
                }}
              />
              <MagicButton onClick={onTryAgain} size="md" variant="secondary">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={16} /> Try Again
                </span>
              </MagicButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Cookie Slot ───────────────────────────────────────────────────────────────

const CookieSlot = ({ state, onClick }) => {
  const isIdle     = state === 'idle'
  const isSelected = state === 'selected'
  const isFading   = state === 'fading'

  return (
    <div
      style={{
        width: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="wait">
        {/* Cookie (idle or fading) */}
        {(isIdle || isFading) && (
          <motion.button
            key="cookie"
            onClick={isIdle ? onClick : undefined}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isFading
                ? { opacity: 0, scale: 0.5, filter: 'blur(4px)' }
                : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
            whileHover={isIdle ? { scale: 1.12, filter: 'drop-shadow(0 0 12px #f59e0b)' } : {}}
            whileTap={isIdle ? { scale: 0.92 } : {}}
            transition={{ duration: 0.4 }}
            style={{
              background: 'none',
              border: 'none',
              cursor: isIdle ? 'pointer' : 'default',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
            aria-label={`Fortune cookie ${state}`}
          >
            <span
              style={{
                fontSize: '5rem',
                filter: isIdle ? 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' : 'none',
              }}
            >
              🥠
            </span>
            {isIdle && (
              <span
                style={{
                  color: '#c4b5fd',
                  fontSize: '0.85rem',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                }}
              >
                Tap me!
              </span>
            )}
          </motion.button>
        )}

        {/* Cracking animation */}
        {isSelected && (
          <motion.div
            key="cracking"
            initial={{ scale: 1, rotate: 0, opacity: 1 }}
            animate={{
              scale:   [1, 1.2, 1.35, 0.6, 0],
              rotate:  [0, -10, 12, -8, 0],
              opacity: [1, 1,   1,   0.6, 0],
            }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ fontSize: '5rem' }}>🥠</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FortuneActivityPage
