import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { characterData, getCharacterInfo } from '../../data/characterData'
import { getRandomGreeting } from '../../data/characterGreetings'
import { usePreloadTTS } from '../../hooks/usePreloadTTS'
import Orb from '../common/Orb'
import InfoPanel from '../common/InfoPanel'
import Character from '../common/Character'
import MagicButton from '../common/MagicButton'
import TTSPlayer from '../common/TTSPlayer'
import useSound from '../../hooks/useSound'
import { AudioContext } from '../../App'

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
  const playSelect = useSound('/sounds/card-select.mp3', { volume: 0.4 })

  // Preload all TTS audio for instant playback
  const { isReady: ttsReady, progress: ttsProgress } = usePreloadTTS()

  const currentCharacter = characterData[activeTab]

  // Handle tab switching
  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return
    playSelect()
    audioControl?.onSFXPlay()
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
  const lunaOrbPositions = [
    { top: '180px', left: '200px', delay: 0 },     // 🔮 Style - Top Left (+50px margin)
    { top: '180px', right: '200px', delay: 0.1 },  // 💫 Reading Style - Top Right (+50px margin)
    { top: '420px', left: '150px', delay: 0.2 },   // ⚡ Specialty - Middle Left (+50px margin)
    { top: '420px', right: '150px', delay: 0.3 },  // 🌙 Tools - Middle Right (+50px margin, avoids BGM)
  ]

  const noirOrbPositions = [
    { top: '180px', left: '200px', delay: 0 },
    { top: '180px', right: '200px', delay: 0.1 },
    { top: '420px', left: '150px', delay: 0.2 },
    { top: '420px', right: '150px', delay: 0.3 },
  ]

  const orbPositions = activeTab === 'luna' ? lunaOrbPositions : noirOrbPositions
  const orbType = activeTab === 'luna' ? 'magic' : 'starry'

  // Background image based on active character
  const backgroundImage = activeTab === 'luna' ? '/luna-background.png' : '/noir-background.png'

  // TTS voice based on active character
  const ttsVoice = activeTab === 'luna' ? 'nova' : 'onyx'
  // nova: Friendly, warm female voice (Luna)
  // onyx: Deep, authoritative male voice (Noir)

  // Show loading screen while TTS is preloading
  if (!ttsReady) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ marginBottom: '24px' }}
        >
          <Sparkles size={48} color="#fbbf24" />
        </motion.div>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#fbbf24',
          }}
        >
          Loading Character Voices...
        </h2>
        <p
          style={{
            fontSize: '1.1rem',
            color: '#c4b5fd',
            marginBottom: '8px',
          }}
        >
          {ttsProgress}%
        </p>
        <div
          style={{
            width: '300px',
            height: '8px',
            background: 'rgba(167, 139, 250, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ttsProgress}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #7c3aed, #fbbf24)',
              borderRadius: '4px',
            }}
          />
        </div>
        <p
          style={{
            marginTop: '20px',
            fontSize: '0.9rem',
            color: '#a78bfa',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          ✨ Preparing magical voices for instant playback...
        </p>
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
          backgroundImage: 'url(/mystical-pattern.svg)',
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
          backgroundImage: 'url(/light-rays.svg)',
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
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
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
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: activeTab === 'luna'
                        ? '0 4px 16px rgba(124, 58, 237, 0.5)'
                        : 'none',
                    }}
                  >
                    ✨ Luna
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
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: activeTab === 'noir'
                        ? '0 4px 16px rgba(30, 58, 138, 0.5)'
                        : 'none',
                    }}
                  >
                    🌟 Noir
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
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#a78bfa',
                fontSize: '0.85rem',
                textAlign: 'center',
                opacity: 0.8,
                zIndex: 30,
              }}
            >
              Click the orbs to learn more • Tap the character for a greeting ✨
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
