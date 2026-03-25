import { useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Users } from 'lucide-react'
import CharacterVideo from '../common/CharacterVideo'
import MagicButton from '../common/MagicButton'
import useSound from '../../hooks/useSound'
import { AudioContext } from '../../App'

// Import assets for proper path resolution with base: './'
import mysticalPattern from '/images/effects/mystical-pattern.svg'
import lightRays from '/images/effects/light-rays.svg'
import tarotCardIcon from '/icons/tarot-card-icon.svg'

// Preload tarot card images for faster rendering (WebP with PNG fallback)
const TAROT_CARD_COUNT = 10

const preloadTarotImages = () => {
  const images = []

  // Lazy preload strategy: only preload first 3 cards immediately
  // Remaining cards will be loaded on-demand when user interacts
  const priorityCount = 3

  for (let i = 0; i < priorityCount; i++) {
    const img = new Image()
    // Prefer WebP, browser will fallback to PNG if not supported
    img.src = `${import.meta.env.BASE_URL}images/tarot/cards/card-${i}.webp`
    images.push(img)
  }

  // Preload remaining cards with low priority (after a delay)
  setTimeout(() => {
    for (let i = priorityCount; i < TAROT_CARD_COUNT; i++) {
      const img = new Image()
      img.src = `${import.meta.env.BASE_URL}images/tarot/cards/card-${i}.webp`
      images.push(img)
    }
  }, 1000)

  return images
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
}

const IntroPage = ({ onStart }) => {
  const audioControl = useContext(AudioContext)

  // Sound effects
  const playSelect = useSound(`${import.meta.env.BASE_URL}sounds/card-select.mp3`, { volume: 0.5 })

  // Preload tarot card images on mount for faster transition
  useEffect(() => {
    preloadTarotImages()
  }, [])

  const handleCardClick = mode => {
    playSelect()
    audioControl?.onSFXPlay() // Duck background music briefly
    // Small delay to let sound effect play before transition
    setTimeout(() => onStart(mode), 100)
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
        padding: '2rem',
        paddingBottom: '3rem',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Meet Characters Button - Top Right (Sub Menu) */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{
          scale: 1.08,
          boxShadow: '0 6px 24px rgba(59, 130, 246, 0.5), 0 0 36px rgba(147, 197, 253, 0.25)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleCardClick('character')}
        style={{
          position: 'absolute',
          top: '24px',
          right: '100px', // Space for future close button at right: 24px
          zIndex: 50,
          padding: '10px 20px',
          borderRadius: '20px',
          background: 'rgba(59, 130, 246, 0.28)',
          border: '2px solid rgba(147, 197, 253, 0.65)',
          backdropFilter: 'blur(10px)',
          fontSize: 'clamp(0.85rem, 1.7vw, 1rem)',
          fontWeight: 700,
          color: '#bfdbfe',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35), 0 0 24px rgba(147, 197, 253, 0.15)',
          transition: 'all 0.2s ease',
        }}
      >
        <Users size={18} />
        Luna & Noir
      </motion.button>

      {/* Background decorative elements */}
      {/* Light rays */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          backgroundImage: `url(${lightRays})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          opacity: 0.6,
        }}
      />

      {/* Floating sparkle particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fde68a, #fbbf24)',
            boxShadow: '0 0 8px #fde68a',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      ))}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          paddingBottom: '1rem'
        }}
      >
        {/* Character - cycling through 6 images (3 fortune + 3 tarot) */}
        <motion.div variants={item}>
          <CharacterVideo
            srcs={[
              `${import.meta.env.BASE_URL}images/characters/fortune/fortune-char-1.png`,
              `${import.meta.env.BASE_URL}images/characters/fortune/fortune-char-2.png`,
              `${import.meta.env.BASE_URL}images/characters/fortune/fortune-char-3.png`,
              `${import.meta.env.BASE_URL}images/tarot/tarot-char-1.png`,
              `${import.meta.env.BASE_URL}images/tarot/tarot-char-2.png`,
              `${import.meta.env.BASE_URL}images/tarot/tarot-char-3.png`,
            ]}
            poseDuration={2000}
            panelStyle={{ width: '240px', height: '360px' }}
          />
        </motion.div>

        {/* Title */}
        <motion.div variants={item} style={{ textAlign: 'center' }}>
          <h1
            className="font-magic text-gold-shine"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              margin: 0,
              lineHeight: 1.2,
              fontWeight: 900,
              textShadow:
                '0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3), 0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            Magic Fortune English
          </h1>
          <p
            style={{
              color: '#c4b5fd',
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              marginTop: '0.75rem',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>✦</span>
            What does your future hold?
            <span>✦</span>
          </p>
        </motion.div>

        {/* Mode buttons */}
        <motion.div
          variants={item}
          style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '0.5rem',
            maxWidth: '800px'
          }}
        >
          {/* Fortune Cookie */}
          <motion.div
            whileHover={{
              y: -8,
              boxShadow: '0 20px 60px rgba(124, 58, 237, 0.5), 0 0 80px rgba(251, 191, 36, 0.2)',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleCardClick('fortune')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.5rem 2rem',
                borderRadius: '24px',
                background:
                  'linear-gradient(135deg, rgba(45, 27, 105, 0.85) 0%, rgba(30, 27, 75, 0.9) 100%)',
                border: '2px solid transparent',
                backgroundClip: 'padding-box',
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                width: '240px',
                boxShadow:
                  '0 10px 40px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gradient border effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '24px',
                  padding: '2px',
                  background: 'linear-gradient(135deg, #fbbf24, #7c3aed, #a78bfa)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none',
                }}
              />
              <div style={{
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: '80px',
                  lineHeight: '80px',
                  filter: 'drop-shadow(0 4px 12px rgba(251, 191, 36, 0.4))'
                }}>
                  🥠
                </div>
              </div>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div
                  className="font-magic"
                  style={{
                    color: '#fde68a',
                    fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                    fontWeight: 700,
                    textShadow: '0 2px 8px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)',
                  }}
                >
                  Fortune Cookie
                </div>
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                    marginTop: '0.25rem',
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Crack open your fortune!
                </div>
              </div>
              <MagicButton size="sm" style={{ marginTop: '0.25rem', pointerEvents: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={14} /> Start
                </span>
              </MagicButton>
            </motion.div>

          {/* Tarot Card */}
          <motion.div
            whileHover={{
              y: -8,
              boxShadow: '0 20px 60px rgba(124, 58, 237, 0.5), 0 0 80px rgba(167, 139, 250, 0.2)',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleCardClick('tarot')}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.5rem 2rem',
                borderRadius: '24px',
                background:
                  'linear-gradient(135deg, rgba(45, 27, 105, 0.85) 0%, rgba(30, 27, 75, 0.9) 100%)',
                border: '2px solid transparent',
                backgroundClip: 'padding-box',
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                width: '240px',
                boxShadow:
                  '0 10px 40px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gradient border effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '24px',
                  padding: '2px',
                  background: 'linear-gradient(135deg, #a78bfa, #7c3aed, #fbbf24)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none',
                }}
              />
              <div style={{
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={tarotCardIcon}
                  alt="Tarot Card"
                  style={{ width: '70px', height: '98px', filter: 'drop-shadow(0 4px 12px rgba(167, 139, 250, 0.4))' }}
                />
              </div>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div
                  className="font-magic"
                  style={{
                    color: '#fde68a',
                    fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                    fontWeight: 700,
                    textShadow: '0 2px 8px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)',
                  }}
                >
                  Tarot Card
                </div>
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                    marginTop: '0.25rem',
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Past · Present · Future
                </div>
              </div>
              <MagicButton size="sm" style={{ marginTop: '0.25rem', pointerEvents: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={14} /> Start
                </span>
            </MagicButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default IntroPage
