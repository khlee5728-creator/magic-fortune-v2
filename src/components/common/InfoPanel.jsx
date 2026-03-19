import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// Import assets for proper path resolution with base: './'
import mysticalPattern from '/images/effects/mystical-pattern.svg'

/**
 * Slide-up Information Panel Component
 * Displays character information with bilingual content
 *
 * @param {boolean} isOpen - Whether the panel is visible
 * @param {function} onClose - Close handler
 * @param {object} category - Category data with icon, label, and content
 * @param {string} characterType - 'luna' or 'noir' for styling
 */
const InfoPanel = ({ isOpen, onClose, category, characterType = 'luna' }) => {
  if (!category) return null

  // Language tab state
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  // Icon mapping: Emoji → Custom SVG file path (same as Orb.jsx)
  const iconMap = {
    '✨': '/icons/luna/eye-icon.svg',           // Luna: About - 미래를 보는 눈
    '🌙': '/icons/luna/moon-stars-icon.svg',    // Luna: Favorites - 별관찰+달
    '🎭': '/icons/luna/smiley-wink-icon.svg',   // Luna: TMI - 귀여운 비밀
    '🔮': '/icons/luna/cards-icon.svg',         // Luna: Items - 타로 카드
    '🌟': '/icons/noir/star-icon.svg',          // Noir: Hunter - 빛나는 별
    '🔔': '/icons/noir/bell-icon.svg',          // Noir: Favorites - 은방울
    '💭': '/icons/noir/chat-circle-icon.svg',   // Noir: Logic - 생각 구름
    '😺': '/icons/noir/cat-icon.svg',           // Noir: Moods - 고양이 얼굴
  }

  const iconSrc = iconMap[category.icon]

  // Icons for sentence cards
  const sentenceIcons = ['🔮', '✨', '💫', '🌟', '💖', '😊', '🎯', '⭐']

  // Split text into sentences (by newline)
  const getSentences = (text) => {
    return text.split('\n').filter(s => s.trim().length > 0)
  }

  // Color schemes for different characters
  const colorSchemes = {
    luna: {
      background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.95) 0%, rgba(109, 40, 217, 0.98) 100%)',
      border: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.5)',
    },
    noir: {
      background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.95) 0%, rgba(23, 37, 84, 0.98) 100%)',
      border: '#60a5fa',
      glow: 'rgba(96, 165, 250, 0.5)',
    },
  }

  const scheme = colorSchemes[characterType]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              maxHeight: '70%',
              background: scheme.background,
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px',
              border: `3px solid ${scheme.border}`,
              borderBottom: 'none',
              boxShadow: `0 -10px 60px ${scheme.glow}, inset 0 2px 0 rgba(255, 255, 255, 0.1)`,
              zIndex: 101,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Decorative pattern overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${mysticalPattern})`,
                backgroundSize: '256px 256px',
                opacity: 0.08,
                pointerEvents: 'none',
              }}
            />

            {/* Header */}
            <div
              style={{
                position: 'relative',
                padding: '24px 32px 16px',
                borderBottom: `2px solid ${scheme.border}66`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={category.label.en}
                    style={{
                      width: '48px',
                      height: '48px',
                      filter: 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.4))',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                )}
                <div>
                  <h3
                    className="font-magic"
                    style={{
                      fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                      color: '#fde68a',
                      margin: 0,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {category.label.en}
                  </h3>
                  <p
                    style={{
                      fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
                      color: '#e0e7ff',
                      margin: 0,
                      marginTop: '2px',
                    }}
                  >
                    {category.label.ko}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  padding: 0,
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content - scrollable */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                overflowY: 'auto',
                padding: '24px 32px 32px',
              }}
            >
              {/* Language Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '20px',
                  justifyContent: 'center',
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLanguage('en')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: selectedLanguage === 'en'
                      ? `2px solid ${scheme.border}`
                      : '2px solid rgba(255, 255, 255, 0.2)',
                    background: selectedLanguage === 'en'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedLanguage === 'en'
                      ? `0 4px 12px ${scheme.glow}`
                      : 'none',
                  }}
                >
                  English
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLanguage('ko')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: selectedLanguage === 'ko'
                      ? `2px solid ${scheme.border}`
                      : '2px solid rgba(255, 255, 255, 0.2)',
                    background: selectedLanguage === 'ko'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedLanguage === 'ko'
                      ? `0 4px 12px ${scheme.glow}`
                      : 'none',
                  }}
                >
                  한국어
                </motion.button>
              </div>

              {/* Content Cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedLanguage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {getSentences(category.content[selectedLanguage]).map((sentence, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>
                        {sentenceIcons[i % sentenceIcons.length]}
                      </span>
                      <p
                        style={{
                          fontSize: selectedLanguage === 'en' ? 'clamp(0.9rem, 2vw, 1.05rem)' : 'clamp(0.85rem, 1.8vw, 1rem)',
                          lineHeight: 1.7,
                          color: '#ffffff',
                          margin: 0,
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {sentence}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default InfoPanel
