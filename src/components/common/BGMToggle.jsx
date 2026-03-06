import { useContext } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { AudioContext } from '../../App'

/**
 * BGM Toggle Button
 *
 * A floating crystal ball-styled button for toggling background music on/off.
 * Positioned at top-left corner of #app container, visible on activity pages only.
 * (Top-right is reserved for AI Playground platform buttons)
 *
 * Design: Matches the fortune teller character's crystal ball theme
 * - ON: Purple glow + music note icon (gold)
 * - OFF: Gray + muted icon
 *
 * State is saved to localStorage and restored on app load.
 */
const BGMToggle = () => {
  const audioControl = useContext(AudioContext)
  const isEnabled = audioControl?.isBGMEnabled ?? true

  const handleToggle = () => {
    audioControl?.toggleBGM()
  }

  return (
    <motion.button
      onClick={handleToggle}
      animate={{
        y: [0, -8, 0], // Floating animation
      }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'absolute', // Relative to #app container (scales with app)
        bottom: '24px',
        right: '24px',
        zIndex: 10000, // Above all content
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        background: isEnabled
          ? 'radial-gradient(circle at 35% 32%, #c4b5fd 0%, #7c3aed 45%, #1a0b3d 100%)'
          : 'radial-gradient(circle, #4a4a4a 0%, #2a2a2a 100%)',
        boxShadow: isEnabled
          ? '0 0 20px #7c3aed, 0 0 40px rgba(124, 58, 237, 0.5)'
          : '0 0 10px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}
      aria-label={isEnabled ? 'Mute background music' : 'Unmute background music'}
      title={isEnabled ? 'Turn off background music' : 'Turn on background music'}
    >
      {/* Crystal ball inner glow effect (only when enabled) */}
      {isEnabled && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: '28%',
            left: '22%',
            width: '32%',
            height: '32%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            filter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Icon */}
      {isEnabled ? (
        <Volume2 size={22} color="#fde68a" strokeWidth={2.5} />
      ) : (
        <VolumeX size={22} color="#9ca3af" strokeWidth={2.5} />
      )}
    </motion.button>
  )
}

export default BGMToggle
