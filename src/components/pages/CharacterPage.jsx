import { useState, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { characterData, getCharacterInfo } from '../../data/characterData'
import { getRandomGreeting, greetingManager } from '../../data/characterGreetings'
import { usePreloadTTS } from '../../hooks/usePreloadTTS'
import Orb from '../common/Orb'
import InfoPanel from '../common/InfoPanel'
import Character from '../common/Character'
import MagicButton from '../common/MagicButton'
import TTSPlayer from '../common/TTSPlayer'
import useSound from '../../hooks/useSound'
import { AudioContext } from '../../App'

// Import assets for proper path resolution with base: './'
import mysticalPattern from '/images/effects/mystical-pattern.svg'
import lightRays from '/images/effects/light-rays.svg'
import particleStar from '/images/effects/particle-star.svg'
import shootingStar from '/images/effects/shooting-star.svg'

/**
 * Continuous Loading Animation - No stage breaks, smooth text transitions
 */
const ContinuousLoadingAnimation = ({ getMessage, ttsProgress }) => {
  const [frameIndex, setFrameIndex] = useState(0)

  // Sprite animation - runs continuously without interruption
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 16)
    }, 100) // 10fps
    return () => clearInterval(interval)
  }, [])

  const getSpritePosition = (index) => {
    const row = Math.floor(index / 4)
    const col = index % 4
    return `${(col * 100) / 3}% ${(row * 100) / 3}%`
  }

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
      {/* Luna Flying Sprite - Continuous animation */}
      <motion.div
        animate={{
          y: [0, -20, 0], // Bouncing flight effect
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: '224px',
          height: '256px',
          backgroundImage: `url(${import.meta.env.BASE_URL}images/characters/luna/luna-flying-sprite.webp)`,
          backgroundSize: '400%',
          backgroundPosition: getSpritePosition(frameIndex),
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden',
          filter: 'drop-shadow(0 8px 30px rgba(167, 139, 250, 0.6))',
        }}
      />

      {/* Message - Only text changes, animation continues */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={getMessage(ttsProgress)} // Re-render when message changes
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
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
          {getMessage(ttsProgress)}
        </motion.h2>
      </AnimatePresence>

      {/* Soft glow particles - appear in final stage (67-100%) */}
      <AnimatePresence>
        {ttsProgress >= 67 && (
          <>
            {/* Ambient glow around character */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                filter: 'blur(40px)',
              }}
            />

            {/* Small floating particles using particle-star.svg */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [0, -60],
                  x: [0, (i % 2 === 0 ? 20 : -20)],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  left: `${25 + i * 10}%`,
                  top: '70%',
                  width: '32px',
                  height: '32px',
                  backgroundImage: `url(${particleStar})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Character Introduction Page
 * Showcases Luna and Noir with interactive information orbs
 */
const CharacterPage = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState('luna') // 'luna' | 'noir'
  const [selectedOrb, setSelectedOrb] = useState(null) // category id or null
  const [greeting, setGreeting] = useState(null)
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)

  const audioControl = useContext(AudioContext)
  const playSelect = useSound(`${import.meta.env.BASE_URL}sounds/card-select.mp3`, { volume: 0.4 })

  // Preload all TTS audio for instant playback
  const { isReady: ttsReady, progress: ttsProgress } = usePreloadTTS()

  const currentCharacter = characterData[activeTab]

  // Handle tab switching
  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return
    playSelect()
    audioControl?.onSFXPlay()

    // Reset greeting queue for previous character
    greetingManager.reset(activeTab)

    setActiveTab(tab)
    setSelectedOrb(null)
    setGreeting(null)
    setIsPlayingTTS(false)
  }

  // Handle orb click
  const handleOrbClick = (categoryId) => {
    playSelect()
    audioControl?.onSFXPlay()
    setSelectedOrb(categoryId)
  }

  // Handle TTS playback ended - reset to idle state
  const handleTTSEnded = () => {
    setIsPlayingTTS(false)
    setGreeting(null) // Hide greeting text when audio ends
  }

  // Handle character click - instant greeting with pre-cached TTS
  const handleCharacterClick = () => {
    if (isPlayingTTS) return

    playSelect()
    audioControl?.onSFXPlay()

    // Get random pre-written greeting
    const randomGreeting = getRandomGreeting(activeTab)

    // Set greeting immediately - TTS is already cached!
    setGreeting(randomGreeting)
    setIsPlayingTTS(true)

    // Instant playback (< 0.1s) because TTS was preloaded! ⚡
  }

  // Get selected category info for panel
  const selectedCategory = selectedOrb
    ? getCharacterInfo(activeTab, selectedOrb)
    : null

  // Orb positioning - Full screen absolute positions (avoids BGM button at bottom-right)
  // Layout: Symmetrical left-right arrangement
  // Top row: 2 orbs (left & right) - increased margin from edges
  // Middle row: 2 orbs (left & right) - avoiding BGM button
  // Updated for 140px Orb size (previously 120px)
  const lunaOrbPositions = [
    { top: '170px', left: '180px', delay: 0 },     // 🔮 Style - Top Left (adjusted for 140px Orb)
    { top: '170px', right: '180px', delay: 0.1 },  // 💫 Reading Style - Top Right (adjusted for 140px Orb)
    { top: '430px', left: '140px', delay: 0.2 },   // ⚡ Specialty - Middle Left (adjusted for 140px Orb)
    { top: '430px', right: '140px', delay: 0.3 },  // 🌙 Tools - Middle Right (adjusted for 140px Orb, avoids BGM)
  ]

  const noirOrbPositions = [
    { top: '170px', left: '180px', delay: 0 },
    { top: '170px', right: '180px', delay: 0.1 },
    { top: '430px', left: '140px', delay: 0.2 },
    { top: '430px', right: '140px', delay: 0.3 },
  ]

  const orbPositions = activeTab === 'luna' ? lunaOrbPositions : noirOrbPositions
  const orbType = activeTab === 'luna' ? 'magic' : 'starry'

  // Background image based on active character (WebP with PNG fallback)
  const backgroundImage = activeTab === 'luna' ? `${import.meta.env.BASE_URL}images/characters/luna/luna-background.webp` : `${import.meta.env.BASE_URL}images/characters/noir/noir-background.webp`

  // TTS voice based on active character
  const ttsVoice = activeTab === 'luna' ? 'nova' : 'alloy'
  // nova: Bright, energetic female voice (Luna)
  // alloy: Neutral, smooth young voice (Noir)

  // Notify parent when character page is ready (activity finished)
  useEffect(() => {
    if (ttsReady) {
      // Notify parent that content has finished loading
      window.parent.postMessage({
        op: 'contentFinished',
        data: {},
        from: 'child'
      }, '*');
    }
  }, [ttsReady])

  // Show loading screen while TTS is preloading
  if (!ttsReady) {
    // Get message based on progress
    const getMessage = (progress) => {
      if (progress < 34) return "Let's ride the magic broom!"
      if (progress < 67) return "I can see Luna and Noir's house!"
      return "Almost there! Are you ready?"
    }
    // Calculate filled stars (3 total)
    const filledStars = Math.min(3, Math.ceil(ttsProgress / 34))
    const stars = Array.from({ length: 3 }, (_, i) => i < filledStars)

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 0%, #2d1b69 0%, #0d0821 60%)',
        }}
      >
        {/* Background - Layer 1: Mystical pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -2,
            backgroundImage: `url(${mysticalPattern})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '512px 512px',
            opacity: 0.3,
          }}
        />

        {/* Background - Layer 2: Light rays */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            backgroundImage: `url(${lightRays})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: 'cover',
            opacity: 0.5,
          }}
        />


        {/* Main content - Continuous animation */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
          }}
        >
          {/* Continuous Loading Animation - No stage breaks */}
          <ContinuousLoadingAnimation getMessage={getMessage} ttsProgress={ttsProgress} />

          {/* Broom flight path indicator - Shooting stars */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            {stars.map((isFilled, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isFilled ? 1 : 0.7,
                  opacity: isFilled ? 1 : 0.25,
                }}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                }}
                style={{
                  width: '48px',
                  height: '48px',
                  position: 'relative',
                }}
              >
                {/* Shooting star SVG */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${shootingStar})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: isFilled
                      ? 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.9)) brightness(1.2)'
                      : 'grayscale(0.8) opacity(0.4)',
                    transition: 'filter 0.3s ease',
                  }}
                />

                {/* Passing glow effect when filled */}
                {isFilled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '70px',
                      height: '70px',
                      background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Dot loader (same as LoadingOverlay) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
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

          {/* Subtle hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            style={{
              fontSize: '0.85rem',
              color: '#a78bfa',
              textAlign: 'center',
              marginTop: '8px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
            }}
          >
            Just a moment, please...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background - Layer 0: Character-specific main background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${activeTab}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -3,
            backgroundImage: `url(${backgroundImage})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
          }}
        />
      </AnimatePresence>

      {/* Background - Layer 1: Mystical pattern overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          backgroundImage: `url(${mysticalPattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '512px 512px',
          opacity: 0.3,
        }}
      />

      {/* Background - Layer 2: Light rays effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          backgroundImage: `url(${lightRays})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          opacity: 0.5,
        }}
      />

      {/* Exit Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          zIndex: 50,
        }}
      >
        <MagicButton onClick={onExit} size="sm">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            Back
          </span>
        </MagicButton>
      </motion.div>

      {/* Main Content Area */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Title & Toggle Navigation - Fixed Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                position: 'absolute',
                top: '24px',
                left: '0',
                right: '0',
                margin: '0 auto',
                zIndex: 40,
                textAlign: 'center',
                width: '500px',
              }}
            >
              <h1
                className="font-magic text-gold-shine"
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                  fontWeight: 800,
                  margin: 0,
                  marginBottom: '8px',
                  textShadow: `
                    0 0 30px rgba(251, 191, 36, 0.9),
                    0 0 60px rgba(251, 191, 36, 0.6),
                    0 0 90px rgba(251, 191, 36, 0.4),
                    0 0 10px rgba(255, 255, 255, 0.8),
                    0 4px 12px rgba(0, 0, 0, 0.7),
                    0 8px 24px rgba(0, 0, 0, 0.5),
                    0 12px 36px rgba(0, 0, 0, 0.3)
                  `,
                }}
              >
                {currentCharacter.name}
              </h1>
              <p
                style={{
                  color: '#c4b5fd',
                  fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                  margin: 0,
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)',
                }}
              >
                {currentCharacter.title.en} · {currentCharacter.title.ko}
              </p>

              {/* Luna/Noir Toggle - Moved here from top */}
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    background: 'rgba(30, 27, 75, 0.8)',
                    padding: '6px',
                    borderRadius: '20px',
                    border: '2px solid rgba(167, 139, 250, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTabSwitch('luna')}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '14px',
                      border: 'none',
                      background: activeTab === 'luna'
                        ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                        : 'transparent',
                      color: '#ffffff',
                      fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: activeTab === 'luna'
                        ? '0 4px 16px rgba(124, 58, 237, 0.5)'
                        : 'none',
                    }}
                  >
                    Luna
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTabSwitch('noir')}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '14px',
                      border: 'none',
                      background: activeTab === 'noir'
                        ? 'linear-gradient(135deg, #1e3a8a, #60a5fa)'
                        : 'transparent',
                      color: '#ffffff',
                      fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: activeTab === 'noir'
                        ? '0 4px 16px rgba(30, 58, 138, 0.5)'
                        : 'none',
                    }}
                  >
                    Noir
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Character & Orbs - Full Screen Layout */}
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '120px',
                paddingBottom: '80px',
              }}
            >
              {/* Character - clickable for greeting */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCharacterClick}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                <Character
                  character={activeTab}
                  isTalking={isPlayingTTS}
                  size="lg"
                />
              </motion.div>

              {/* Orbs positioned in full screen - Absolute positions */}
              {currentCharacter.categories.map((category, index) => (
                <div
                  key={category.id}
                  style={{
                    position: 'absolute',
                    ...orbPositions[index],
                    zIndex: 20,
                  }}
                >
                  <Orb
                    icon={category.icon}
                    label={category.label.en}
                    color={category.color}
                    onClick={() => handleOrbClick(category.id)}
                    delay={category.delay || orbPositions[index].delay}
                    type={orbType}
                  />
                </div>
              ))}
            </div>

            {/* Greeting Display with TTS - Floating at bottom */}
            <AnimatePresence>
              {greeting && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '16px 28px',
                    background: 'rgba(124, 58, 237, 0.2)',
                    border: '2px solid rgba(167, 139, 250, 0.5)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '600px',
                    width: '90%',
                    zIndex: 50,
                  }}
                >
                  <p
                    style={{
                      color: '#fde68a',
                      fontSize: '1.1rem',
                      margin: 0,
                      textAlign: 'center',
                      fontWeight: 600,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {greeting}
                  </p>

                  {/* Hidden TTS Player - auto-plays greeting audio */}
                  <div style={{ display: 'none' }}>
                    <TTSPlayer
                      text={greeting}
                      voice={ttsVoice}
                      autoPlay={true}
                      onEnded={handleTTSEnded}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instruction hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                position: 'fixed',
                bottom: '20px',
                left: '0',
                right: '0',
                margin: '0 auto',
                width: 'fit-content',
                color: '#fde68a',
                fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                textAlign: 'center',
                fontWeight: 600,
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '10px 24px',
                borderRadius: '20px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                whiteSpace: 'nowrap',
                zIndex: 30,
              }}
            >
              Click the orbs to learn more • Tap the character for a greeting
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info Panel */}
      <InfoPanel
        isOpen={!!selectedOrb}
        onClose={() => setSelectedOrb(null)}
        category={selectedCategory}
        characterType={activeTab}
      />
    </div>
  )
}

export default CharacterPage
