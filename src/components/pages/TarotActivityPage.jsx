import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Scroll, Star, Eye, Loader2 } from 'lucide-react'
import TTSPlayer from '../common/TTSPlayer'
import MagicButton from '../common/MagicButton'
import useSFX from '../../hooks/useSFX'

const TOTAL_CARDS = 10
const TENSES = ['past', 'present', 'future']
const TENSE_COLORS = {
  past:    { border: '#a78bfa', label: '#c4b5fd' },
  present: { border: '#34d399', label: '#6ee7b7' },
  future:  { border: '#f59e0b', label: '#fde68a' },
}
const TENSE_ICONS = { past: Scroll, present: Star, future: Eye }

// Drives the dynamic header during card selection
const SELECTION_PROMPTS = [
  { tense: 'PAST',    sub: 'The cards will reveal your Past · Present · Future!' },
  { tense: 'PRESENT', sub: 'Your PAST card is chosen! ✨' },
  { tense: 'FUTURE',  sub: 'Your PRESENT card is chosen! ✨' },
]

// Pill badge: tense colour + name instead of a plain number
const TENSE_BADGE = [
  { label: 'PAST',   bg: '#a78bfa' },
  { label: 'PRESENT', bg: '#34d399' },
  { label: 'FUTURE', bg: '#f59e0b' },
]

/**
 * Tarot Card Activity Page
 *
 * Flow (IA spec):
 *  Phase 1 – Selection: 10 face-down cards shown, user picks 3 in order.
 *  Phase 2 – Reveal: selected cards flip one-by-one (Past → Present → Future).
 *  Phase 3 – Complete: all 3 results visible, Try Again shown.
 */
const TarotActivityPage = ({ content, onTryAgain }) => {
  // selectedOrder[i] = card index (i = 0 first pick, 1 second, 2 third)
  const [selectedOrder, setSelectedOrder] = useState([])
  // revealStep: 0=none flipped, 1=past flipped, 2=present flipped, 3=future flipped
  const [revealStep, setRevealStep] = useState(0)
  const [phase, setPhase] = useState('selection') // 'selection' | 'revealing' | 'complete'

  // Sound effects
  const sfx = useSFX()

  // Notify parent when all cards are revealed (activity finished)
  useEffect(() => {
    if (phase === 'complete') {
      // Notify parent that content has finished
      window.parent.postMessage({
        op: 'contentFinished',
        data: {},
        from: 'child'
      }, '*');
    }
  }, [phase])

  const handleCardClick = (cardIdx) => {
    if (phase !== 'selection') return
    if (selectedOrder.includes(cardIdx)) return
    if (selectedOrder.length >= 3) return

    // Play card tap sound effect
    sfx.playCardTap()

    const next = [...selectedOrder, cardIdx]
    setSelectedOrder(next)

    if (next.length === 3) {
      // Brief pause so user can see FUTURE badge, then transition to reveal
      setTimeout(() => {
        setPhase('revealing')
        setTimeout(() => {
          sfx.playCardFlip() // Play flip sound for first card
          setRevealStep(1)
        }, 400)
      }, 700)
    }
  }

  // Called by each card's TTSPlayer when its audio finishes.
  // orderIdx: 0=past, 1=present, 2=future
  const handleAudioEnded = (orderIdx) => {
    if (orderIdx === 2) {
      // Future card done → all complete
      setPhase('complete')
    } else {
      // Short pause before flipping the next card.
      // Functional updater with Math.max ensures revealStep never decreases,
      // so re-listens on any card never cause already-flipped cards to unflip.
      setTimeout(() => {
        sfx.playCardFlip() // Play flip sound for next card
        setRevealStep(prev => Math.max(prev, orderIdx + 2))
      }, 250)
    }
  }

  const tenseForOrder = (orderIdx) => TENSES[orderIdx] // 0→past, 1→present, 2→future

  // Card visual state helper
  const getCardState = (cardIdx) => {
    const orderIdx = selectedOrder.indexOf(cardIdx)
    if (orderIdx === -1) return { selected: false, orderIdx: -1, isFlipped: false }
    const isFlipped = orderIdx < revealStep
    return { selected: true, orderIdx, isFlipped }
  }

  const selPrompt = SELECTION_PROMPTS[selectedOrder.length] ?? SELECTION_PROMPTS[0]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '1rem 1.5rem',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}
      >
        <h2
          className="font-magic text-gold-shine"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)', margin: 0, fontWeight: 700 }}
        >
          {phase === 'selection'
            ? `Choose your ${selPrompt.tense} card (${selectedOrder.length}/3)`
            : 'Your Tarot Reading'}
        </h2>
      </motion.div>

      {/* ── Phase: selection ── */}
      {phase === 'selection' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1rem',
          }}
        >
          {Array.from({ length: TOTAL_CARDS }, (_, idx) => {
            const { selected, orderIdx } = getCardState(idx)
            return (
              <CardBack
                key={idx}
                selected={selected}
                orderIdx={orderIdx}
                cardIdx={idx}
                onClick={() => handleCardClick(idx)}
              />
            )
          })}
        </motion.div>
      )}

      {/* ── Phase: revealing / complete ── */}
      {(phase === 'revealing' || phase === 'complete') && (
        <>
          <TarotTimeline revealStep={revealStep} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              gap: 'clamp(0.75rem, 2vw, 1.5rem)',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {selectedOrder.map((cardIdx, orderIdx) => {
              const tense     = tenseForOrder(orderIdx)
              const data      = content?.[tense]
              const isFlipped = orderIdx < revealStep

              return (
                <TarotRevealCard
                  key={cardIdx}
                  tense={tense}
                  data={data}
                  isFlipped={isFlipped}
                  delay={orderIdx * 0.2}
                  onAudioEnded={() => handleAudioEnded(orderIdx)}
                  cardIdx={cardIdx}
                />
              )
            })}
          </motion.div>
        </>
      )}

      {/* Play Again — always rendered to reserve height */}
      <div style={{ visibility: phase === 'complete' ? 'visible' : 'hidden' }}>
        <MagicButton onClick={onTryAgain} variant="secondary" size="md">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={16} /> Play Again
          </span>
        </MagicButton>
      </div>
    </div>
  )
}

// ── Parse **word** markers → colored + glowing <span> ────────────────────────

function parseHighlightedText(text, color) {
  if (!text) return null
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} style={{
          color,
          fontWeight: 900,
          textShadow: `0 0 8px ${color}cc, 0 0 16px ${color}66`,
        }}>
          {part.slice(2, -2)}
        </span>
      )
    }
    return part
  })
}

// ── Face-down card in selection phase ────────────────────────────────────────

const CardBack = ({ selected, orderIdx, onClick, cardIdx }) => (
  <motion.button
    onClick={onClick}
    whileHover={!selected ? { scale: 1.08, y: -6 } : {}}
    whileTap={!selected ? { scale: 0.93 } : {}}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      width:  'clamp(120px, 16vw, 200px)',
      aspectRatio: '1696 / 2528',
      borderRadius: '14px',
      border: selected ? '2.5px solid #f5c518' : '1.5px solid #7c3aed',
      cursor: selected ? 'default' : 'pointer',
      boxShadow: selected
        ? '0 0 18px rgba(245,197,24,0.5)'
        : '0 4px 12px rgba(0,0,0,0.4)',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      padding: 0,
      background: 'linear-gradient(145deg, #1a0b3d, #2d1b69)',
    }}
    aria-label={selected ? `Card selected (${TENSE_BADGE[orderIdx]?.label ?? orderIdx + 1})` : 'Select this card'}
  >
    {/* Character image */}
    <picture>
      <source srcSet={`${import.meta.env.BASE_URL}images/tarot/cards/card-${cardIdx}.webp`} type="image/webp" />
      <img
        src={`${import.meta.env.BASE_URL}images/tarot/cards/card-${cardIdx}.png`}
        alt={`Card ${cardIdx + 1}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: 0,
          display: 'block',
        }}
      />
    </picture>

    {/* Bottom gradient banner — tense label on selected card */}
    {selected && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '38%',
          borderRadius: '0 0 12px 12px',
          background: `linear-gradient(transparent, ${TENSE_BADGE[orderIdx]?.bg ?? '#f5c518'}dd)`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '10px',
        }}
      >
        <span className="font-magic" style={{
          color: '#1a0b3d',
          fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
          fontWeight: 900,
          letterSpacing: '0.15em',
        }}>
          {TENSE_BADGE[orderIdx]?.label ?? (orderIdx + 1)}
        </span>
      </motion.div>
    )}
  </motion.button>
)

// ── Flipping result card ──────────────────────────────────────────────────────

const TarotRevealCard = ({ tense, data, isFlipped, delay, onAudioEnded, cardIdx }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const colors    = TENSE_COLORS[tense]
  const text      = data?.text ?? '✨ A magical fortune awaits you!'
  const cleanText = text.replace(/\*\*/g, '')  // strip markers for TTS
  const image     = data?.image ?? null

  // Reset loaded state when image URL changes
  useEffect(() => { setImageLoaded(false) }, [image])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 18 }}
      style={{
        width:  'clamp(180px, 26vw, 300px)',
        flexShrink: 0,
      }}
    >
      {/* Card wrapper (provides perspective for 3-D flip) */}
      <div className="card-wrapper" style={{ width: '100%', aspectRatio: '1696 / 2528' }}>
        <div
          className={`card-inner${isFlipped ? ' flipped' : ''}`}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          {/* ── Front face (face-down pattern, shown before flip) ── */}
          <div
            className="card-face"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '18px',
              border: `2px solid ${colors.border}`,
              overflow: 'hidden',
              boxShadow: `0 0 20px rgba(0,0,0,0.5)`,
              background: 'linear-gradient(145deg, #1a0b3d, #2d1b69)',
            }}
          >
            <picture>
              <source srcSet={`${import.meta.env.BASE_URL}images/tarot/cards/card-${cardIdx}.webp`} type="image/webp" />
              <img
                src={`${import.meta.env.BASE_URL}images/tarot/cards/card-${cardIdx}.png`}
                alt="Tarot card"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </picture>
          </div>

          {/* ── Back face (revealed content, shown after flip) ── */}
          <div
            className="card-back-face"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '18px',
              border: `2.5px solid ${colors.border}`,
              background: 'linear-gradient(160deg, #1a0b3d 0%, #0d0821 100%)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: `0 0 28px rgba(0,0,0,0.6), 0 0 14px ${colors.border}44`,
            }}
          >
            {/* Image area */}
            <div
              style={{
                flex: '0 0 55%',
                overflow: 'hidden',
                position: 'relative',
                background: image
                  ? 'transparent'
                  : `linear-gradient(135deg, #3b0764, #1a0b3d)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt={text}
                  onLoad={() => setImageLoaded(true)}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in',
                  }}
                />
              ) : null}
              {/* Loading state — visible when no image or image downloading */}
              {!image && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  position: 'static',
                }}>
                  <Loader2
                    size={40}
                    className="spin"
                    style={{ color: colors.label, opacity: 0.8 }}
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: colors.label,
                    opacity: 0.7,
                    margin: 0,
                    textAlign: 'center',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                  }}>
                    Creating your magical image...
                  </p>
                </div>
              )}
              {/* Downloading overlay — visible when image URL exists but not loaded yet */}
              {image && !imageLoaded && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(2px)',
                }}>
                  <Loader2
                    size={32}
                    className="spin"
                    style={{ color: 'white' }}
                  />
                </div>
              )}

              {/* Gradient overlay at bottom of image */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '30%',
                  background: 'linear-gradient(to bottom, transparent 0%, transparent 33%, rgba(13,8,33,0.3) 67%, #0d0821 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Text area */}
            <div
              style={{
                flex: 1,
                padding: '0.6rem 0.8rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              {/* Fortune sentence — wrapper div handles vertical centering; <p> stays block to allow inline text wrapping */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
                <p
                  style={{
                    color: 'white',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                    lineHeight: 1.4,
                    margin: 0,
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  {parseHighlightedText(text, colors.label)}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Listen button area — always rendered to reserve height, hidden until flipped */}
      <div
        style={{
          marginTop: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '44px',
          visibility: isFlipped ? 'visible' : 'hidden',
        }}
      >
        {isFlipped && (
          <TTSPlayer text={cleanText} voice="nova" autoPlay size="sm" onEnded={onAudioEnded} />
        )}
      </div>
    </motion.div>
  )
}

// ── Timeline bar: Past · Present · Future progress ────────────────────────────

const TarotTimeline = ({ revealStep }) => {
  const items = []
  TENSES.forEach((tense, i) => {
    const isRevealed = i < revealStep
    const isCurrent  = i === revealStep - 1  // card being revealed right now
    const colors = TENSE_COLORS[tense]
    const TenseIcon = TENSE_ICONS[tense]

    if (i > 0) {
      items.push(
        <div key={`line-${i}`} style={{
          flex: 1,
          height: '3px',
          marginTop: '26px', // aligns with centre of active circle (52px / 2 − 1)
          alignSelf: 'flex-start',
          background: (isRevealed || isCurrent) ? colors.border : 'rgba(255,255,255,0.12)',
          transition: 'background 0.5s',
        }} />
      )
    }

    items.push(
      <motion.div
        key={tense}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.15 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
      >
        <motion.div
          animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={isCurrent ? { duration: 0.6, repeat: 2, ease: 'easeInOut' } : {}}
          style={{
            width:  isCurrent ? '52px' : '44px',
            height: isCurrent ? '52px' : '44px',
            borderRadius: '50%',
            border: `2px solid ${(isRevealed || isCurrent) ? colors.border : 'rgba(255,255,255,0.2)'}`,
            background: isCurrent
              ? `${colors.border}55`
              : isRevealed ? `${colors.border}33` : 'transparent',
            boxShadow: isCurrent ? `0 0 14px ${colors.border}99` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: (isRevealed || isCurrent) ? colors.label : 'rgba(255,255,255,0.25)',
            transition: 'all 0.4s',
          }}
        >
          <TenseIcon size={isCurrent ? 22 : 18} />
        </motion.div>
        <span style={{
          fontSize: '0.75rem',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800,
          letterSpacing: '0.1em',
          color: (isRevealed || isCurrent) ? colors.label : 'rgba(255,255,255,0.25)',
          transition: 'all 0.4s',
        }}>
          {tense.toUpperCase()}
        </span>
      </motion.div>
    )
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      width: '100%',
      maxWidth: '900px',
      padding: '0 2rem',
    }}>
      {items}
    </div>
  )
}

export default TarotActivityPage
