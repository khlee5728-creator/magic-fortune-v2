import { useState, useCallback, useLayoutEffect, useEffect, createContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IntroPage from './components/pages/IntroPage'
import LoadingOverlay from './components/pages/LoadingOverlay'
import FortuneActivityPage from './components/pages/FortuneActivityPage'
import TarotActivityPage from './components/pages/TarotActivityPage'
import CharacterPage from './components/pages/CharacterPage'
import StarField from './components/common/StarField'
import BGMToggle from './components/common/BGMToggle'
import { generateFortuneCookieContent, generateTarotContent } from './api/openai'
import { getRandomFortune, getRandomTarot } from './data/fallbackMessages'
import { saveActivity } from './utils/localStore'
import { initScaling } from './utils/scaling'
import useBGM from './hooks/useBGM'

// AudioContext for global audio control
export const AudioContext = createContext(null)

const PAGE_VARIANTS = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 1.02, transition: { duration: 0.3 } },
}

// 디자인 기준 해상도 (PRD: Tablet PC 16:10 가로 모드)
const DESIGN_WIDTH  = 1280
const DESIGN_HEIGHT = 800

function App() {
  // appState: 'intro' | 'loading' | 'fortune' | 'tarot' | 'character'
  const [appState, setAppState] = useState('intro')
  const [mode, setMode] = useState(null)
  const [aiContent, setAiContent] = useState(null)

  // Background music ON/OFF state (saved to localStorage)
  const [isBGMEnabled, setIsBGMEnabled] = useState(() => {
    const saved = localStorage.getItem('magic-fortune-bgm-enabled')
    return saved !== null ? saved === 'true' : true // Default: ON
  })

  // Background music (global, plays across pages)
  const bgm = useBGM('/sounds/intro-ambient.mp3', {
    volume: 0.15,
    loop: true,
    autoPlay: false, // Start when user clicks a card
    fadeInDuration: 2500,
  })

  // 첫 paint 전에 스케일 적용 (레이아웃 플래시 방지)
  useLayoutEffect(() => {
    const cleanup = initScaling({
      designWidth:  DESIGN_WIDTH,
      designHeight: DESIGN_HEIGHT,
      containerId:  'app',
      enableLog:    import.meta.env.DEV,
    })
    return cleanup
  }, [])

  const handleStart = useCallback(async (selectedMode) => {
    // If character mode, go directly to character page without loading
    if (selectedMode === 'character') {
      // Start background music when user clicks a card (only if enabled)
      if (isBGMEnabled) {
        bgm.play()
      }
      setAppState('character')
      return
    }

    // Start background music when user clicks a card (only if enabled)
    if (isBGMEnabled) {
      bgm.play()
    }

    setMode(selectedMode)
    setAppState('loading')

    let content
    try {
      if (selectedMode === 'fortune') {
        content = await generateFortuneCookieContent()
      } else {
        content = await generateTarotContent()
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
      if (selectedMode === 'fortune') {
        content = { text: getRandomFortune() }
      } else {
        content = getRandomTarot()
      }
    }

    saveActivity(selectedMode, content)
    setAiContent(content)
    setAppState(selectedMode)
  }, [bgm, isBGMEnabled])

  const handleTryAgain = useCallback(() => {
    setAiContent(null)
    setMode(null)
    setAppState('intro')
  }, [])

  const handleCharacterExit = useCallback(() => {
    setAppState('intro')
  }, [])

  // Toggle BGM ON/OFF
  const toggleBGM = useCallback(() => {
    setIsBGMEnabled(prev => {
      const newState = !prev
      localStorage.setItem('magic-fortune-bgm-enabled', String(newState))

      if (newState) {
        // Turned ON: play music if we're past intro page
        if (appState !== 'intro') {
          bgm.play()
        }
      } else {
        // Turned OFF: immediately pause music
        bgm.pause(true) // immediate pause
      }

      return newState
    })
  }, [bgm, appState])

  // Audio control object to pass down via context
  const audioControl = {
    bgm,
    isBGMEnabled,
    toggleBGM,
    // TTS playback handlers (only duck if BGM is enabled)
    onTTSStart: () => {
      if (isBGMEnabled) bgm.duck(0.01, 500) // 1% volume - TTS가 최대한 또렷하게 들림
    },
    onTTSEnd: () => {
      if (isBGMEnabled) bgm.restore(800)
    },
    // Sound effect playback handler (only duck if BGM is enabled)
    onSFXPlay: () => {
      if (isBGMEnabled) {
        bgm.duck(0.08, 200)
        setTimeout(() => bgm.restore(400), 300)
      }
    },
  }

  return (
    <AudioContext.Provider value={audioControl}>
      <>
      {/* Portrait mode warning — position: fixed이므로 #app 바깥에 배치
          (transform된 조상 안에 fixed 사용 시 뷰포트 기준 동작이 깨짐) */}
      <div
        id="portrait-warning"
        style={{
          display: 'none',
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#0d0821',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Please Rotate Your Device
        </h2>
        <p style={{ opacity: 0.7, fontSize: '1rem' }}>
          Magic Fortune English works best in landscape mode!
        </p>
      </div>

      {/* ── 스케일링 컨테이너 ──────────────────────────────────────────────
          initScaling()이 이 요소에 width/height/position/transform을 주입합니다.
          초기 스타일은 index.css의 #app 규칙에서 정의됩니다.           */}
      <div
        id="app"
        className="no-select"
      >
        <StarField />

        {/* BGM Toggle Button - hidden on IntroPage, visible on activity pages */}
        {appState !== 'intro' && <BGMToggle />}

        <AnimatePresence mode="wait">
          {appState === 'intro' && (
            <motion.div key="intro" {...PAGE_VARIANTS} style={{ width: '100%', height: '100%' }}>
              <IntroPage onStart={handleStart} />
            </motion.div>
          )}

          {appState === 'loading' && (
            <motion.div key="loading" {...PAGE_VARIANTS} style={{ width: '100%', height: '100%' }}>
              <LoadingOverlay mode={mode} />
            </motion.div>
          )}

          {appState === 'fortune' && (
            <motion.div key="fortune" {...PAGE_VARIANTS} style={{ width: '100%', height: '100%' }}>
              <FortuneActivityPage content={aiContent} onTryAgain={handleTryAgain} />
            </motion.div>
          )}

          {appState === 'tarot' && (
            <motion.div key="tarot" {...PAGE_VARIANTS} style={{ width: '100%', height: '100%' }}>
              <TarotActivityPage content={aiContent} onTryAgain={handleTryAgain} />
            </motion.div>
          )}

          {appState === 'character' && (
            <motion.div key="character" {...PAGE_VARIANTS} style={{ width: '100%', height: '100%' }}>
              <CharacterPage onExit={handleCharacterExit} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </>
    </AudioContext.Provider>
  )
}

export default App
