import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

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
                backgroundImage: 'url(/mystical-pattern.svg)',
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
                <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                <div>
                  <h3
                    className="font-magic"
                    style={{
                      fontSize: '1.5rem',
                      color: '#fde68a',
                      margin: 0,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {category.label.en}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
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
              {/* English content */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  🇬🇧 English
                </div>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: '#ffffff',
                    margin: 0,
                    whiteSpace: 'pre-line',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {category.content.en}
                </p>
              </div>

              {/* Korean content */}
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  🇰🇷 한국어
                </div>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.8,
                    color: '#e0e7ff',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {category.content.ko}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default InfoPanel
