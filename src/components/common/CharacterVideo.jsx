import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * CharacterVideo
 *
 * Props:
 *   srcs         — array of PNG paths (cycles through poses in order, loops)
 *   poseDuration — ms each pose is shown before crossfading to next (default 2000)
 *   noEntrance   — suppress slide-in entrance animation (for floating use)
 *   style / panelStyle — CSS overrides
 *
 * Animation layers:
 *   1. Entrance  : slide in from left (opacity 0→1, x -60→0)
 *   2. Float     : continuous up-down loop (y 0→-18→0, 3.5s)
 *   3. Pose swap : crossfade between each PNG every poseDuration ms
 */
const CharacterVideo = ({ srcs = [], style = {}, panelStyle = {}, poseDuration = 2000, noEntrance = false }) => {
  const poses = srcs
  const [poseIndex, setPoseIndex] = useState(0)

  useEffect(() => {
    if (poses.length <= 1) return
    const timer = setInterval(() => {
      setPoseIndex(prev => (prev + 1) % poses.length)
    }, poseDuration)
    return () => clearInterval(timer)
  }, [poses.length, poseDuration])

  if (poses.length === 0) return null

  return (
    <motion.div
      initial={noEntrance ? false : { opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{
        width: '392px',
        height: '560px',
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
        ...panelStyle,
      }}
    >
      {/* Float wrapper — continuous up-down bob */}
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        {/* Pose crossfade — AnimatePresence switches between image files */}
        <AnimatePresence mode="wait">
          <motion.picture
            key={poseIndex}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 0 18px rgba(167,139,250,0.5)) drop-shadow(0 0 5px rgba(245,197,24,0.18))',
            }}
          >
            <source
              srcSet={poses[poseIndex]?.replace('.png', '.webp')}
              type="image/webp"
            />
            <img
              src={poses[poseIndex]}
              alt="character"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                display: 'block',
                ...style,
              }}
            />
          </motion.picture>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default CharacterVideo
