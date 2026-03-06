import { motion } from 'framer-motion'

const MESSAGES = {
  fortune: [
    '🔮 The Fortune Teller is gazing into the crystal ball…',
    '✨ Your lucky message is being crafted with magic…',
    '🌟 Almost ready — the stars are aligning for you!',
  ],
  tarot: [
    '🃏 Shuffling the mystical tarot cards just for you…',
    '🎨 Painting your magical past, present, and future…',
    '✨ The ancient cards are revealing your story…',
  ],
}

/**
 * Full-screen loading overlay displayed while AI content is being generated.
 * Shows an animated magic orb and cycling status messages.
 */
const LoadingOverlay = ({ mode }) => {
  const msgs = MESSAGES[mode] ?? MESSAGES.fortune

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
      {/* Magic Orb */}
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

      {/* Cycling status text */}
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <motion.div
          key={msgs[0]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -12] }}
          transition={{ duration: 3.5, times: [0, 0.15, 0.85, 1], repeat: Infinity, repeatDelay: 0 }}
        >
          {msgs.map((msg, i) => (
            <motion.p
              key={msg}
              initial={{ opacity: 0, display: 'none' }}
              animate={{
                opacity: [0, 1, 1, 0],
                display: 'block',
              }}
              transition={{
                delay: i * 3.5,
                duration: 3.2,
                times: [0, 0.1, 0.85, 1],
                repeat: Infinity,
                repeatDelay: (msgs.length - 1) * 3.5,
              }}
              style={{
                color: '#c4b5fd',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(0.9rem, 2.2vw, 1.15rem)',
                margin: 0,
                position: i === 0 ? 'relative' : 'absolute',
              }}
            >
              {msg}
            </motion.p>
          ))}
        </motion.div>

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
    </div>
  )
}

export default LoadingOverlay
