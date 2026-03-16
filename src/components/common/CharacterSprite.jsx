import { motion } from 'framer-motion'

/**
 * CharacterSprite Component
 *
 * Displays character with sprite sheet animation support
 * - Shows static idle image by default
 * - Plays sprite animation when talking
 *
 * @param {string} character - 'luna' or 'noir'
 * @param {boolean} isTalking - Whether character is currently talking
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {string} className - Additional CSS classes
 *
 * Required assets in /public:
 * - /luna-idle.png (static Luna image)
 * - /luna-talking-sprite.png (Luna sprite sheet, 4x4 grid = 16 frames)
 * - /noir-idle.png (static Noir image)
 * - /noir-talking-sprite.png (Noir sprite sheet, 4x4 grid = 16 frames)
 */
const CharacterSprite = ({
  character = 'luna',
  isTalking = false,
  size = 'lg',
  className = ''
}) => {
  // Size mapping
  const dimensions = {
    sm: { width: 160, height: 240 },
    md: { width: 196, height: 294 },
    lg: { width: 240, height: 360 },
  }
  const dim = dimensions[size] || dimensions.lg

  // Image paths
  const idleImage = `/${character}-idle.png`
  const spriteImage = `/${character}-talking-sprite.png`

  // Sprite sheet configuration
  // 4x4 grid (16 frames total)
  const spriteColumns = 4
  const spriteRows = 4
  const spriteFrames = spriteColumns * spriteRows // 16 frames
  const frameDuration = 0.08 // seconds per frame (total: 1.28s for full animation)

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        width: `${dim.width}px`,
        height: `${dim.height}px`,
      }}
    >
      {/* Subtle floating animation wrapper - Gentle breathing effect */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Static idle image */}
        <motion.img
          src={idleImage}
          alt={`${character} character`}
          animate={{
            opacity: isTalking ? 0 : 1,
            scale: isTalking ? 0.98 : 1,
            y: 0,
            filter: isTalking
              ? 'blur(2px) drop-shadow(0 0 18px rgba(167,139,250,0.5)) drop-shadow(0 0 5px rgba(245,197,24,0.18))'
              : 'blur(0px) drop-shadow(0 0 18px rgba(167,139,250,0.5)) drop-shadow(0 0 5px rgba(245,197,24,0.18))',
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            pointerEvents: 'none',
          }}
        />

        {/* Sprite sheet animation (only visible when talking) */}
        <motion.div
          animate={{
            opacity: isTalking ? 1 : 0,
            scale: isTalking ? 1 : 1.02,
            y: 0,
            filter: isTalking
              ? 'blur(0px) drop-shadow(0 0 18px rgba(167,139,250,0.5)) drop-shadow(0 0 5px rgba(245,197,24,0.18))'
              : 'blur(2px) drop-shadow(0 0 18px rgba(167,139,250,0.5)) drop-shadow(0 0 5px rgba(245,197,24,0.18))',
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${spriteImage})`,
              backgroundSize: `${spriteColumns * 100}% ${spriteRows * 100}%`,
              backgroundPosition: '0% 0%',
              backgroundRepeat: 'no-repeat',
              transform: 'scale(0.80) translateY(10%)',
              transformOrigin: 'center center',
              animation: isTalking
                ? `sprite-talk-grid ${frameDuration * spriteFrames}s steps(1) infinite`
                : 'none',
            }}
          />
        </motion.div>

        {/* Talking indicator sparkles */}
        {isTalking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-10px',
              fontSize: '2rem',
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
            }}
          >
            ✨
          </motion.div>
        )}
      </motion.div>

      {/* CSS keyframes for 4x4 grid sprite animation */}
      <style>{`
        @keyframes sprite-talk-grid {
          /* Row 1 */
          0%    { background-position: 0% 0%; }
          6.25% { background-position: 33.333% 0%; }
          12.5% { background-position: 66.666% 0%; }
          18.75%{ background-position: 100% 0%; }
          /* Row 2 */
          25%   { background-position: 0% 33.333%; }
          31.25%{ background-position: 33.333% 33.333%; }
          37.5% { background-position: 66.666% 33.333%; }
          43.75%{ background-position: 100% 33.333%; }
          /* Row 3 */
          50%   { background-position: 0% 66.666%; }
          56.25%{ background-position: 33.333% 66.666%; }
          62.5% { background-position: 66.666% 66.666%; }
          68.75%{ background-position: 100% 66.666%; }
          /* Row 4 */
          75%   { background-position: 0% 100%; }
          81.25%{ background-position: 33.333% 100%; }
          87.5% { background-position: 66.666% 100%; }
          93.75%{ background-position: 100% 100%; }
          100%  { background-position: 0% 0%; }
        }
      `}</style>
    </div>
  )
}

export default CharacterSprite
