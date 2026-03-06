import { motion } from 'framer-motion'

/**
 * Reusable magic-themed button used throughout the app.
 * Minimum touch target: 44×44px (per TRD accessibility requirements).
 */
const MagicButton = ({
  children,
  onClick,
  variant = 'primary',   // 'primary' | 'secondary' | 'gold'
  size    = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  style = {},
}) => {
  const variants = {
    primary:   { background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: '1.5px solid #a78bfa' },
    secondary: { background: 'rgba(45, 27, 105, 0.8)',                    border: '1.5px solid #7c3aed' },
    gold:      { background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: '1.5px solid #fde68a' },
  }

  const sizes = {
    sm: { padding: '8px 18px',  fontSize: '0.9rem',  borderRadius: '12px' },
    md: { padding: '12px 28px', fontSize: '1.05rem', borderRadius: '16px' },
    lg: { padding: '16px 40px', fontSize: '1.2rem',  borderRadius: '20px' },
  }

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.05, boxShadow: '0 0 24px rgba(167,139,250,0.6)' }}
      whileTap={disabled   ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={className}
      style={{
        ...variants[variant],
        ...sizes[size],
        color: 'white',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minHeight: '44px',
        minWidth: '44px',
        backdropFilter: 'blur(6px)',
        letterSpacing: '0.02em',
        ...style,
      }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

export default MagicButton
