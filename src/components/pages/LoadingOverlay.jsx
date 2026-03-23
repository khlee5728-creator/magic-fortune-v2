import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Import assets for proper path resolution with base: './'
import lunaShuffleSprite from '/images/characters/luna/luna-tarot-shuffle-sprite.png'

const MESSAGES = {
  fortune: 'Creating your magical fortune cookie...',
  tarot: [
    "Luna is preparing the cards...",
    "Shuffling the magical tarot deck...",
    "Your fortune is ready!",
  ],
}

/**
 * Tarot Shuffle Animation Component
 * Displays Luna shuffling tarot cards with 3-phase animation
 */
const TarotShuffleAnimation = ({ getMessage }) => {
  const [frameIndex, setFrameIndex] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(1) // 1, 2, or 3

  // Continuous sprite animation - runs independently without interruption
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 16) // Loop through all 16 frames
    }, 120) // Consistent speed for smooth animation

    return () => clearInterval(interval)
  }, [])

  // Phase progression - only changes messages and cards, NOT animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev < 5) return prev + 1
        return 5 // Stay at phase 5
      })
    }, 4000) // Change phase every 4 seconds

    return () => clearInterval(timer)
  }, [])

  const getSpritePosition = (index) => {
    const row = Math.floor(index / 4)
    const col = index % 4
    return `${(col * 100) / 3}% ${(row * 100) / 3}%`
  }

  // Tarot card data for progress indicator
  const cards = [
    { id: 'past', label: 'Past', color: '#a78bfa', icon: '📜', flippedAt: 3 },
    { id: 'present', label: 'Present', color: '#34d399', icon: '⭐', flippedAt: 4 },
    { id: 'future', label: 'Future', color: '#f59e0b', icon: '👁️', flippedAt: 5 },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        position: 'relative',
      }}
    >
      {/* Luna Tarot Shuffle Sprite */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '240px',
          height: '261px', // 240 * (477/439) = 261 to maintain aspect ratio
          overflow: 'hidden', // Prevent sprite sheet from showing adjacent frames
          filter: 'drop-shadow(0 8px 30px rgba(167, 139, 250, 0.6))',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${lunaShuffleSprite})`,
            backgroundSize: '400% 400%',
            backgroundPosition: getSpritePosition(frameIndex),
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Message - Changes with phase */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={getMessage(currentPhase)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
            fontWeight: 700,
            color: '#fde68a',
            textAlign: 'center',
            textShadow: `
              0 0 40px rgba(0, 0, 0, 0.9),
              0 2px 12px rgba(251, 191, 36, 0.8)
            `,
            margin: 0,
          }}
        >
          {getMessage(currentPhase)}
        </motion.h2>
      </AnimatePresence>

      {/* Tarot card flip progress indicator */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        {cards.map((card) => {
          const isFlipped = currentPhase >= card.flippedAt

          return (
            <div
              key={card.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {/* Card container with 3D perspective */}
              <div
                style={{
                  width: '60px',
                  height: '90px',
                  perspective: '1000px',
                }}
              >
                <motion.div
                  animate={{
                    rotateY: isFlipped ? 180 : 0,
                    scale: isFlipped ? 1 : 0.9,
                  }}
                  transition={{
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Card back (visible when not flipped) */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      borderRadius: '8px',
                      background: 'linear-gradient(145deg, #1a0b3d, #2d1b69)',
                      border: '2px solid #7c3aed',
                      opacity: isFlipped ? 0 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {/* Mystical pattern on card back */}
                    <div
                      style={{
                        fontSize: '1.5rem',
                        opacity: 0.6,
                      }}
                    >
                      ✨
                    </div>
                  </div>

                  {/* Card front (visible when flipped) */}
                  <motion.div
                    animate={isFlipped ? {
                      boxShadow: [
                        `0 0 20px ${card.color}99`,
                        `0 0 30px ${card.color}cc`,
                        `0 0 20px ${card.color}99`,
                      ],
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${card.color}33, ${card.color}66)`,
                      border: `2px solid ${card.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                    }}
                  >
                    {card.icon}
                  </motion.div>
                </motion.div>
              </div>

              {/* Card label */}
              <motion.p
                animate={{
                  color: isFlipped ? card.color : '#666',
                  opacity: isFlipped ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  margin: 0,
                  fontFamily: 'Nunito, sans-serif',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {card.label}
              </motion.p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Magic Orb Component (for Fortune mode)
 */
const MagicOrbAnimation = () => {
  return (
    <motion.div style={{ position: 'relative' }}>
      {/* Outer glow rings */}
      {[80, 60, 40].map((size, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: size + '%',
            height: size + '%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `1px solid rgba(167,139,250,${0.15 + i * 0.1})`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}

      {/* Orb */}
      <motion.div
        style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 32%, #e9d5ff 0%, #7c3aed 40%, #1a0b3d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
        animate={{
          boxShadow: [
            '0 0 30px #7c3aed, 0 0 60px rgba(124,58,237,0.5)',
            '0 0 60px #a78bfa, 0 0 120px rgba(167,139,250,0.7)',
            '0 0 30px #7c3aed, 0 0 60px rgba(124,58,237,0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Spinning inner star */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '3.5rem' }}
        >
          ✨
        </motion.div>

        {/* Shimmer */}
        <div
          style={{
            position: 'absolute',
            top: '14%',
            left: '20%',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.35)',
            filter: 'blur(6px)',
          }}
        />
      </motion.div>
    </motion.div>
  )
}

/**
 * Full-screen loading overlay displayed while AI content is being generated.
 * Shows either tarot shuffle animation or magic orb based on mode.
 */
const LoadingOverlay = ({ mode }) => {
  // Message getter for tarot mode (5 phases)
  const getTarotMessage = (phase) => {
    if (phase === 1) return "Luna is preparing the mystical cards..."
    if (phase === 2) return "Shuffling the deck with magic..."
    if (phase === 3) return "Drawing your Past card..."
    if (phase === 4) return "Revealing your Present and Future..."
    return "Your fortune is complete!"
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Tarot mode: Luna shuffle animation */}
      {mode === 'tarot' && <TarotShuffleAnimation getMessage={getTarotMessage} />}

      {/* Fortune mode: Magic orb + static text */}
      {mode !== 'tarot' && (
        <>
          <MagicOrbAnimation />

          {/* Static status text */}
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                fontWeight: 700,
                color: '#fde68a',
                textAlign: 'center',
                textShadow: `
                  0 0 40px rgba(0, 0, 0, 0.9),
                  0 2px 12px rgba(251, 191, 36, 0.8)
                `,
                margin: 0,
              }}
            >
              {MESSAGES.fortune}
            </motion.p>

            {/* Dot loader */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#a78bfa',
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LoadingOverlay
