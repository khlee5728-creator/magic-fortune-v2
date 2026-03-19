import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import TTSPlayer from '../common/TTSPlayer'
import MagicButton from '../common/MagicButton'
import CharacterVideo from '../common/CharacterVideo'
import useSFX from '../../hooks/useSFX'

const COOKIE_COUNT = 5

// Modal verb configuration for each cookie
const MODAL_VERBS = ['will', 'can', 'should', 'might', 'must']

const MODAL_CONFIG = {
  will: {
    label: 'WILL',
    color: '#3b82f6',
    lightColor: '#dbeafe',
    description: 'Future Certainty',
    tip: '**WILL** expresses certainty about the future. Use it when you\'re sure something will happen!',
    icon: '🔮'
  },
  can: {
    label: 'CAN',
    color: '#10b981',
    lightColor: '#d1fae5',
    description: 'Ability & Possibility',
    tip: '**CAN** shows ability or possibility. Use it to talk about what you\'re able to do!',
    icon: '💪'
  },
  should: {
    label: 'SHOULD',
    color: '#f59e0b',
    lightColor: '#fef3c7',
    description: 'Advice & Recommendation',
    tip: '**SHOULD** gives advice or recommendations. Use it to suggest what\'s best to do!',
    icon: '💡'
  },
  might: {
    label: 'MIGHT',
    color: '#8b5cf6',
    lightColor: '#ede9fe',
    description: 'Weak Possibility',
    tip: '**MIGHT** expresses a weak possibility. Use it when something could happen, but you\'re not sure!',
    icon: '🤔'
  },
  must: {
    label: 'MUST',
    color: '#ef4444',
    lightColor: '#fee2e2',
    description: 'Strong Necessity',
    tip: '**MUST** shows strong necessity or obligation. Use it for things that are very important!',
    icon: '⚡'
  }
}

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
    ? ['/images/characters/fortune/fortune-char-reveal.png']
    : [
        '/images/characters/fortune/fortune-char-1.png', '/images/characters/fortune/fortune-char-2.png', '/images/characters/fortune/fortune-char-3.png',
        '/images/characters/fortune/fortune-char-4.png', '/images/characters/fortune/fortune-char-5.png', '/images/characters/fortune/fortune-char-6.png',
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

// ── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Parse text and highlight modal verbs with bold styling
 * Looks for **word** markers and applies color highlighting
 */
function parseModalText(text, modalConfig) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const word = part.slice(2, -2)
      return (
        <span key={i} style={{
          fontWeight: 900,
          color: modalConfig?.color || '#2d1500',
          textShadow: modalConfig ? `0 0 8px ${modalConfig.color}44` : 'none'
        }}>
          {word}
        </span>
      )
    }
    return part
  })
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
 *
 * Modal Verbs Learning:
 *  - Each of 5 cookies represents a different modal verb (will/can/should/might/must)
 *  - Color-coded labels help students distinguish between modal verbs
 *  - Grammar tips explain usage of each modal verb
 */
const FortuneActivityPage = ({ content, onTryAgain }) => {
  const sfx = useSFX()
  const [cookieStates, setCookieStates] = useState(Array(COOKIE_COUNT).fill('idle'))
  const [revealed, setRevealed] = useState(false)
  const [selectedModalIdx, setSelectedModalIdx] = useState(null)
  const [showGrammarTip, setShowGrammarTip] = useState(false)

  // Notify parent when fortune is revealed (activity finished)
  useEffect(() => {
    if (revealed) {
      // Notify parent that content has finished
      window.parent.postMessage({
        op: 'contentFinished',
        data: {},
        from: 'child'
      }, '*');
    }
  }, [revealed])

  const handleCookieClick = (idx) => {
    if (revealed || cookieStates.some((s) => s !== 'idle')) return

    sfx.playCookieCrack() // Cookie crack sound on click

    setSelectedModalIdx(idx)
    setCookieStates(cookieStates.map((_, i) => (i === idx ? 'selected' : 'fading')))
    setTimeout(() => {
      setRevealed(true)
      setTimeout(() => {
        sfx.playMagicReveal() // Magic reveal sound when fortune appears
      }, 600)
    }, 750)
  }

  // Get modal verb data based on selected cookie
  const selectedModal = selectedModalIdx !== null ? MODAL_VERBS[selectedModalIdx] : null
  const modalConfig = selectedModal ? MODAL_CONFIG[selectedModal] : null

  // Get fortune data for the selected modal verb
  const fortuneData = selectedModal && content?.fortune?.[selectedModal]
    ? content.fortune[selectedModal]
    : { text: 'Your magic fortune is on its way!', tip: '' }

  const fortuneText = fortuneData.text ?? 'Your magic fortune is on its way!'
  const fortuneTip = fortuneData.tip ?? modalConfig?.tip ?? ''

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
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)', margin: 0, fontWeight: 700 }}
          >
            {revealed
              ? `Your ${modalConfig?.label || ''} Fortune!`
              : 'Choose Your Modal Verb Cookie!'}
          </h2>
          {!revealed && (
            <p style={{ color: '#c4b5fd', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', margin: '0.4rem 0 0', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
              Each cookie teaches a different modal verb!
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
              {Array.from({ length: COOKIE_COUNT }, (_, idx) => {
                const modalVerb = MODAL_VERBS[idx]
                const config = MODAL_CONFIG[modalVerb]
                return (
                  <CookieSlot
                    key={idx}
                    state={cookieStates[idx]}
                    onClick={() => handleCookieClick(idx)}
                    modalType={modalVerb}
                    modalConfig={config}
                  />
                )
              })}
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

              {/* Top decorative stars */}
              <div style={{
                fontSize: '1.2rem',
                marginBottom: '1.5rem',
                marginTop: '0.5rem',
                opacity: 0.6,
                letterSpacing: '0.5rem'
              }}>
                ✦ ✦ ✦
              </div>

              {/* Fortune Message - Main Focus */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  color: '#2d1500',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 600,
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                  lineHeight: 1.85,
                  margin: '0 0 1.5rem 0',
                  letterSpacing: '0.03em',
                  padding: '0 1rem',
                }}
              >
                "{parseModalText(fortuneText, modalConfig)}"
              </motion.p>

              {/* Bottom decorative stars */}
              <div style={{
                fontSize: '1.2rem',
                marginBottom: '1.5rem',
                opacity: 0.6,
                letterSpacing: '0.5rem'
              }}>
                ✦ ✦ ✦
              </div>

              {/* Divider line */}
              <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #c8a84b 30%, #c8a84b 70%, transparent)',
                margin: '0 1.5rem 1rem',
                opacity: 0.4,
              }} />

              {/* Modal Badge - Smaller, at bottom */}
              {modalConfig && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '12px',
                    background: `${modalConfig.color}12`,
                    border: `1.5px solid ${modalConfig.color}40`,
                    marginBottom: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{modalConfig.icon}</span>
                  <span style={{
                    color: modalConfig.color,
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 800,
                    fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)',
                    letterSpacing: '0.05em',
                  }}>
                    {modalConfig.label}
                  </span>
                  <span style={{
                    color: '#7d5a3a',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(0.7rem, 1.4vw, 0.8rem)',
                    opacity: 0.65,
                  }}>
                    · {modalConfig.description}
                  </span>
                </motion.div>
              )}

              {/* Grammar Tip - Collapsible */}
              {fortuneTip && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setShowGrammarTip(!showGrammarTip)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      color: '#7d5a3a',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)',
                      cursor: 'pointer',
                      marginBottom: showGrammarTip ? '0.5rem' : '0',
                      opacity: 0.8,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>💡</span>
                    <span>Grammar Tip</span>
                    <span style={{
                      fontSize: '0.7rem',
                      transform: showGrammarTip ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                      display: 'inline-block',
                    }}>
                      ▼
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {showGrammarTip && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          background: `linear-gradient(135deg, ${modalConfig?.lightColor || '#fef3c7'}30, ${modalConfig?.lightColor || '#fef3c7'}15)`,
                          border: `1px solid ${modalConfig?.color || '#f59e0b'}25`,
                          marginBottom: '0.5rem',
                        }}>
                          <p style={{
                            color: '#5a3e2b',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 600,
                            fontSize: 'clamp(0.8rem, 1.7vw, 0.95rem)',
                            lineHeight: 1.6,
                            margin: '0',
                          }}>
                            {parseModalText(fortuneTip, modalConfig)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
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
                voice="nova"
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
                  fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                  backdropFilter: 'blur(6px)',
                  letterSpacing: '0.02em',
                }}
              />
              <MagicButton onClick={onTryAgain} size="md" variant="secondary">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={16} /> Play Again
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

const CookieSlot = ({ state, onClick, modalType, modalConfig }) => {
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
        gap: '0.5rem',
      }}
    >
      {/* Modal Label - shows modal verb name with color */}
      {modalConfig && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isIdle ? 1 : isFading ? 0 : 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${modalConfig.color}22, ${modalConfig.color}11)`,
            border: `1.5px solid ${modalConfig.color}55`,
            backdropFilter: 'blur(4px)',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{modalConfig.icon}</span>
          <span style={{
            color: modalConfig.lightColor,
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
            letterSpacing: '0.03em',
            textShadow: `0 0 8px ${modalConfig.color}66`,
          }}>
            {modalConfig.label}
          </span>
        </motion.div>
      )}
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
