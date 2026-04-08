import { motion } from 'framer-motion'

const themes = {
  dark: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  light: {
    background: 'rgba(0, 0, 0, 0.06)',
    color: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
}

const baseStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 500,
}

const AiGeneratedBanner = ({ theme = 'dark', style = {} }) => {
  const themeStyle = themes[theme] || themes.dark

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ ...baseStyle, ...themeStyle, ...style }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 22 12 17.3 5.8 22l2.4-8.1L2 9.4h7.6z" />
      </svg>
      이 콘텐츠는 AI에 의해 생성되었습니다.
    </motion.div>
  )
}

export default AiGeneratedBanner
