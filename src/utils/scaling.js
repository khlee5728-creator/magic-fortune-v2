/**
 * 스케일링 시스템 (v1.3)
 *
 * 고정 디자인 해상도를 기준으로 비율을 유지하며 다양한 화면 크기에 맞춰
 * 자동 스케일링합니다. 콘텐츠는 상단 중앙(Top-Center)에 배치됩니다.
 *
 * 사용법:
 *   import { initScaling, getCurrentScale } from './utils/scaling.js'
 *   initScaling()                              // 기본 1280×800
 *   initScaling({ designWidth: 1920, designHeight: 1080 })
 *
 * 좌표 보정:
 *   const correctedX = (e.clientX - appRect.left) / window.currentScale
 */

// ── 내부 상태 ────────────────────────────────────────────────────────────────
let _currentScale = 1

// ── 기본값 ───────────────────────────────────────────────────────────────────
const DEFAULTS = {
  designWidth:  1280,
  designHeight: 800,
  containerId:  'app',
  enableLog:    false,
}

// ── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * 스케일링 초기화.
 * 즉시 스케일을 적용하고 resize 이벤트에 리스너를 등록합니다.
 *
 * @param {object} [options]
 * @param {number} [options.designWidth=1280]
 * @param {number} [options.designHeight=800]
 * @param {string} [options.containerId='app']
 * @param {boolean} [options.enableLog=false]
 * @returns {() => void} 이벤트 리스너 제거용 클린업 함수
 */
export function initScaling(options = {}) {
  const { designWidth, designHeight, containerId, enableLog } = {
    ...DEFAULTS,
    ...options,
  }

  function applyScale() {
    const container = document.getElementById(containerId)
    if (!container) {
      if (enableLog) console.warn(`[Scaling] #${containerId} 요소를 찾을 수 없습니다.`)
      return
    }

    // FR-1: 스케일 계산
    const viewportWidth  = window.innerWidth
    const viewportHeight = window.innerHeight
    const scale = Math.min(
      viewportWidth  / designWidth,
      viewportHeight / designHeight,
    )

    // FR-2: 상단 중앙 배치 (top: 0 고정)
    const left = (viewportWidth - designWidth * scale) / 2
    const top  = 0

    // 5.1 스타일 적용 순서
    container.style.width           = `${designWidth}px`
    container.style.height          = `${designHeight}px`
    container.style.position        = 'absolute'
    container.style.left            = `${left}px`
    container.style.top             = `${top}px`
    container.style.transformOrigin = 'top left'
    container.style.transform       = `scale(${scale})`

    // FR-4: 스케일 값 저장
    _currentScale        = scale
    window.currentScale  = scale  // 전역 접근용

    if (enableLog) {
      console.log(
        `[Scaling] scale=${scale.toFixed(4)} | viewport=${viewportWidth}×${viewportHeight} | left=${left.toFixed(1)}`,
      )
    }
  }

  // 즉시 적용
  applyScale()

  // FR-3: 리사이즈 감지 (디바운싱 없이 즉시 실행)
  window.addEventListener('resize', applyScale)

  // 클린업 함수 반환
  return () => window.removeEventListener('resize', applyScale)
}

/**
 * 현재 적용된 스케일 값을 반환합니다.
 * @returns {number}
 */
export function getCurrentScale() {
  return _currentScale
}
