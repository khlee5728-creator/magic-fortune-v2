import { useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Users } from 'lucide-react'
import CharacterVideo from '../common/CharacterVideo'
import MagicButton from '../common/MagicButton'
import useSound from '../../hooks/useSound'
import { AudioContext } from '../../App'

// Preload tarot card images for faster rendering
const TAROT_CARD_COUNT = 10
const preloadTarotImages = () => {
  const images = []
  for (let i = 0; i < TAROT_CARD_COUNT; i++) {
    const img = new Image()
    img.src = `/images/tarot/card-${i}.png`
    images.push(img)
  }
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

const IntroPage = ({ onStart, onTarotHover }) => {
  const audioControl = useContext(AudioContext)

  // Sound effects
  const playSelect = useSound('/sounds/card-select.mp3', { volume: 0.5 })

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

  // Prefetch handler for tarot hover
  const handleTarotCardHover = () => {
    if (onTarotHover) {
      onTarotHover()
    }
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleCardClick('character')}
        style={{
          position: 'absolute',
          top: '24px',
          right: '100px', // Space for future close button at right: 24px
          zIndex: 50,
          padding: '10px 20px',
          borderRadius: '20px',
          background: 'rgba(59, 130, 246, 0.15)',
          border: '2px solid rgba(147, 197, 253, 0.4)',
          backdropFilter: 'blur(10px)',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#bfdbfe',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
          transition: 'all 0.2s ease',
        }}
      >
        <Users size={16} />
        Luna & Noir
      </motion.button>

      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          backgroundImage: 'url(/mystical-pattern.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '512px 512px',
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          backgroundImage: 'url(/light-rays.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          opacity: 0.6,
        }}
      />
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
              '/fortune-char-1.png',
              '/fortune-char-2.png',
              '/fortune-char-3.png',
              '/tarot-char-1.png',
              '/tarot-char-2.png',
              '/tarot-char-3.png',
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
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              margin: 0,
              lineHeight: 1.2,
              textShadow:
                '0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3), 0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            Magic Fortune English
          </h1>
          <p
            style={{
              color: '#c4b5fd',
              fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
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
              {/* Decorative pattern overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(/mystical-pattern.svg)',
                  backgroundSize: '256px 256px',
                  opacity: 0.1,
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
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textShadow: '0 2px 8px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)',
                  }}
                >
                  Fortune Cookie
                </div>
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '0.8rem',
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
            onMouseEnter={handleTarotCardHover}
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
              {/* Decorative pattern overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(/mystical-pattern.svg)',
                  backgroundSize: '256px 256px',
                  opacity: 0.1,
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
                  src="/tarot-card-icon.svg"
                  alt="Tarot Card"
                  style={{ width: '70px', height: '98px', filter: 'drop-shadow(0 4px 12px rgba(167, 139, 250, 0.4))' }}
                />
              </div>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div
                  className="font-magic"
                  style={{
                    color: '#fde68a',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textShadow: '0 2px 8px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)',
                  }}
                >
                  Tarot Card
                </div>
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '0.8rem',
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
