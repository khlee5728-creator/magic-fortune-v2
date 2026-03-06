import CharacterSprite from './CharacterSprite'

/**
 * Fortune Teller Character
 *
 * Uses CharacterSprite for static idle image + talking animation
 * via sprite sheet when character is speaking.
 *
 * @param {string} character - 'luna' or 'noir' (default: 'luna')
 * @param {boolean} isTalking - Whether character is currently talking
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {string} className - Additional CSS classes
 */
const Character = ({
  character = 'luna',
  isTalking = false,
  size = 'md',
  className = ''
}) => {
  return (
    <CharacterSprite
      character={character}
      isTalking={isTalking}
      size={size}
      className={className}
    />
  )
}

export default Character

/* ──────────────────────────────────────────────────────────────────────────
   BACKUP: Original emoji + CSS crystal ball implementation
   (Uncomment this block and replace the above code to revert)

import { motion } from 'framer-motion'

const Character = ({ size = 'md', className = '' }) => {
  const dim = { sm: 80, md: 130, lg: 180 }[size] ?? 130

  return (
    <motion.div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div style={{ fontSize: dim * 0.55, lineHeight: 1 }}>🧙‍♀️</div>
      <motion.div
        style={{
          width: dim * 0.55,
          height: dim * 0.55,
          borderRadius: '50%',
          marginTop: dim * 0.05,
          background: 'radial-gradient(circle at 35% 32%, #c4b5fd 0%, #7c3aed 45%, #1a0b3d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
        }}
        animate={{
          boxShadow: [
            '0 0 18px #7c3aed, 0 0 36px rgba(124,58,237,0.5)',
            '0 0 36px #a78bfa, 0 0 70px rgba(167,139,250,0.7)',
            '0 0 18px #7c3aed, 0 0 36px rgba(124,58,237,0.5)',
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: '22%',
            width: '28%',
            height: '28%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.38)',
            filter: 'blur(3px)',
          }}
        />
        <span style={{ fontSize: dim * 0.22 }}>✨</span>
      </motion.div>
      <div
        style={{
          width: dim * 0.42,
          height: dim * 0.07,
          marginTop: 2,
          borderRadius: '4px',
          background: 'linear-gradient(to right, #5b21b6, #a78bfa, #5b21b6)',
        }}
      />
      <div
        style={{
          width: dim * 0.28,
          height: dim * 0.1,
          background: 'linear-gradient(to bottom, #7c3aed, #4c1d95)',
        }}
      />
      <div
        style={{
          width: dim * 0.5,
          height: dim * 0.055,
          borderRadius: '4px',
          background: '#3b0764',
        }}
      />
    </motion.div>
  )
}

────────────────────────────────────────────────────────────────────────── */
