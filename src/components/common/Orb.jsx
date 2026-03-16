import { motion } from 'framer-motion'

/**
 * Floating Orb Button Component
 * Used for displaying character information categories
 *
 * @param {string} icon - Emoji icon to display (will be mapped to custom SVG)
 * @param {string} label - Button label text
 * @param {string} color - Primary color for the orb
 * @param {function} onClick - Click handler
 * @param {number} delay - Animation delay for stagger effect
 * @param {string} type - 'magic' (Luna) or 'starry' (Noir)
 */
const Orb = ({ icon, label, color, onClick, delay = 0, type = 'magic' }) => {
  // Icon mapping: Emoji → Custom SVG file path
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

  const iconSrc = iconMap[icon]
  // Animation variants for floating effect
  const floatingVariants = {
    initial: { y: 0, opacity: 0, scale: 0.8 },
    animate: {
      y: [0, -15, 0],
      opacity: 1,
      scale: 1,
      transition: {
        y: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
      },
    },
  }

  // Different styles for Luna (magic) vs Noir (starry)
  const orbStyles = {
    magic: {
      background: `radial-gradient(circle at 30% 30%, ${color}99, ${color}66 50%, ${color}33 100%)`,
      boxShadow: `0 8px 32px ${color}66, inset 0 0 20px ${color}33`,
      border: `2px solid ${color}99`,
    },
    starry: {
      background: `radial-gradient(circle at 30% 30%, ${color}99, ${color}44 50%, ${color}22 100%)`,
      boxShadow: `0 8px 32px ${color}44, inset 0 0 20px ${color}22`,
      border: `2px solid ${color}66`,
    },
  }

  const currentStyle = orbStyles[type]

  return (
    <motion.button
      variants={floatingVariants}
      initial="initial"
      animate="animate"
      whileHover={{
        scale: 1.1,
        boxShadow: `0 12px 48px ${color}88, inset 0 0 30px ${color}44`,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        position: 'relative',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        ...currentStyle,
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        border: 'none',
        outline: 'none',
        padding: 0,
        overflow: 'visible',
      }}
    >
      {/* Glowing highlight effect */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '35%',
          height: '35%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.3)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />

      {/* Icon - Custom SVG or Emoji fallback */}
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={label}
          style={{
            width: '80px',
            height: '80px',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
          }}
        />
      ) : (
        <span style={{ fontSize: '2rem', position: 'relative', zIndex: 1 }}>
          {icon}
        </span>
      )}

      {/* Label */}
      <span
        style={{
          fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 1,
          maxWidth: '120px',
          lineHeight: 1.1,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          display: 'block',
        }}
      >
        {label}
      </span>
    </motion.button>
  )
}

export default Orb
