import { useMemo } from 'react'

const STAR_COUNT = 70

/**
 * Deterministic star field using the golden-ratio spiral distribution.
 * Memoised so it never re-renders and never triggers re-layout.
 */
const StarField = () => {
  const stars = useMemo(() => {
    const φ = 1.6180339887
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: ((i * φ * 100) % 100).toFixed(3),
      y: ((i * φ * 137.508) % 100).toFixed(3),
      size: (i % 3) + 1,
      delay: ((i * 0.17) % 3).toFixed(2),
      duration: (1.8 + (i % 3) * 0.7).toFixed(1),
    }))
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',   /* fixed → absolute: #app(스케일드 컨테이너) 기준으로 채움 */
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: 'white',
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default StarField
