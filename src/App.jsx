import { useState, useCallback, useLayoutEffect, useEffect, createContext, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IntroPage from './components/pages/IntroPage'
import LoadingOverlay from './components/pages/LoadingOverlay'
import FortuneActivityPage from './components/pages/FortuneActivityPage'
import TarotActivityPage from './components/pages/TarotActivityPage'
import CharacterPage from './components/pages/CharacterPage'
import StarField from './components/common/StarField'
import BGMToggle from './components/common/BGMToggle'
import { generateFortuneCookieContent, generateTarotText, generateTarotImages } from './api/openai'
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

  // Prefetch cache for tarot (hover optimization)
  const [tarotPrefetch, setTarotPrefetch] = useState(null)
  const tarotAbortController = useRef(null)

  // Background music ON/OFF state (saved to localStorage)
  const [isBGMEnabled, setIsBGMEnabled] = useState(() => {
    const saved = localStorage.getItem('magic-fortune-bgm-enabled')
    return saved !== null ? saved === 'true' : true // Default: ON
  })

  // Background music (global, plays across pages)
  const bgm = useBGM(`${import.meta.env.BASE_URL}sounds/intro-ambient.mp3`, {
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

  // Prefetch handler for tarot hover (saves 2-3 seconds)
  const handleTarotHover = useCallback(async () => {
    // Skip if already prefetching or prefetch completed
    if (tarotPrefetch || tarotAbortController.current) return

    if (import.meta.env.DEV) {
      console.log('[Prefetch] Tarot hover detected, starting generation...')
    }

    // Create AbortController to cancel if user hovers away
    const controller = new AbortController()
    tarotAbortController.current = controller

    try {
      // Generate text first (includes scene descriptions)
      const messages = await generateTarotText()

      if (controller.signal.aborted) {
        if (import.meta.env.DEV) {
          console.log('[Prefetch] Aborted after text generation')
        }
        return
      }

      // Use scene descriptions to generate matching images
      const images = await generateTarotImages(messages)

      if (controller.signal.aborted) {
        if (import.meta.env.DEV) {
          console.log('[Prefetch] Aborted after image generation')
        }
        return
      }

      if (import.meta.env.DEV) {
        console.log('[Prefetch] Completed, caching results')
      }
      setTarotPrefetch({ messages, images })
    } catch (error) {
      if (!controller.signal.aborted) {
        console.warn('[Prefetch] Failed:', error)
      }
    }
  }, [tarotPrefetch])

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

    if (selectedMode === 'fortune') {
      let content
      try {
        content = await generateFortuneCookieContent()
      } catch (error) {
        console.error('AI generation failed, using fallback:', error)
        content = getRandomFortune()
      }
      saveActivity(selectedMode, content)
      setAiContent(content)
      setAppState('fortune')
    } else {
      // Tarot: use prefetched data if available, otherwise generate fresh
      let messages, images

      if (tarotPrefetch) {
        if (import.meta.env.DEV) {
          console.log('[Tarot] Using prefetched data (instant!)')
        }
        messages = tarotPrefetch.messages
        images = tarotPrefetch.images
        setTarotPrefetch(null) // Clear cache
        tarotAbortController.current = null
      } else {
        if (import.meta.env.DEV) {
          console.log('[Tarot] No prefetch, generating fresh')
        }
        try {
          // Generate text first (includes scene descriptions)
          messages = await generateTarotText()
          // Use scene descriptions to generate matching images
          images = await generateTarotImages(messages)
        } catch (error) {
          console.error('AI generation failed, using fallback:', error)
          const fallback = getRandomTarot()
          saveActivity('tarot', fallback)
          setAiContent(fallback)
          setAppState('tarot')
          return
        }
      }

      // Both text and images ready → enter activity page with complete content
      const completedContent = {
        past:    { text: messages.past,    image: images.pastImg,    label: 'Past',    tense: 'past' },
        present: { text: messages.present, image: images.presentImg, label: 'Present', tense: 'present' },
        future:  { text: messages.future,  image: images.futureImg,  label: 'Future',  tense: 'future' },
      }
      saveActivity('tarot', completedContent)
      setAiContent(completedContent)
      setAppState('tarot')
    }
  }, [bgm, isBGMEnabled, tarotPrefetch])

  const handleTryAgain = useCallback(() => {
    // 플랫폼에 Play Again 알림 전송
    window.parent.postMessage({
      op: 'playAgain',
      data: {},
      from: 'child'
    }, '*');

    setAiContent(null)
    setMode(null)
    setAppState('intro')

    // Automatically start Prefetch for next tarot attempt
    // This optimizes 2nd+ attempts while avoiding waste on 1st attempt
    setTimeout(() => {
      handleTarotHover()
    }, 500) // Small delay to let intro page render first
  }, [handleTarotHover])

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
      if (isBGMEnabled) bgm.duck(0.01, 2) // 1% volume, Priority 2 (TTS - highest)
    },
    onTTSEnd: () => {
      if (isBGMEnabled) bgm.restore(800, 2) // Priority 2 - only TTS can restore
    },
    // Sound effect playback handler (only duck if BGM is enabled)
    onSFXPlay: () => {
      if (isBGMEnabled) {
        bgm.duck(0.05, 1)  // 5% volume, Priority 1 (SFX - lower than TTS)
        setTimeout(() => bgm.restore(600, 1), 800)  // Priority 1 - won't restore during TTS
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
