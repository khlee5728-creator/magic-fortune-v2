## 스케일링 시스템 요구사항 명세서 (v1.3)

1.개요

고정 디자인 해상도를 기준으로 비율을 유지하면서 다양한 화면 크기에 맞춰 자동으로 스케일링하는 시스템입니다. 특히 AI Playground 환경에 맞춰 콘텐츠를 **상단 중앙(Top-Center)**에 배치하고 브라우저 리사이즈 시 즉각적으로 대응하는 것을 목표로 합니다.

2.기능 요구사항

2.1 핵심 기능

FR-1: 고정 해상도 기준 스케일링

설명: 지정된 디자인 해상도(예: 1280x800px)를 기준으로 스케일 비율을 계산합니다.

계산 방식: scale = Math.min(viewportWidth / designWidth, viewportHeight / designHeight)

목적: 비율을 유지하면서 화면 크기에 맞춰 조정합니다.

FR-2: 자동 상단 중앙 정렬 (Update)

설명: 스케일된 컨테이너를 화면 상단 끝(top: 0)에 붙이고 가로축은 중앙에 배치합니다.

계산 방식:

left = (viewportWidth - designWidth * scale) / 2

top = 0 (기존 중앙 정렬 공식에서 상단 고정으로 변경)

FR-3: 윈도우 리사이즈 감지

설명: 브라우저 창 크기 변경 시 자동으로 재계산 및 적용합니다.

이벤트: window.addEventListener('resize', resizeHandler)

FR-4: 스케일 값 저장 및 접근

설명: 현재 스케일 값을 저장하여 드래그앤드롭 등 좌표 보정에 활용합니다.

저장 위치:

모듈 내부 변수

window.currentScale (전역 접근용)

3.기술 요구사항

3.1 필수 의존성

TR-1: HTML 구조: id가 "app"인 최상위 컨테이너 요소가 필수입니다.

TR-2: CSS 지원: position: absolute, transform: scale(), transform-origin: top left, width, height 속성을 필수로 사용합니다.

TR-3: JavaScript 환경: ES6 Modules 지원, window 객체 및 표준 DOM API 접근이 가능해야 합니다.

3.2 API 명세

함수: initScaling(options?)

파라미터 (선택사항):

{
designWidth?: number,    // 기본값: 1280
designHeight?: number,   // 기본값: 800
containerId?: string,    // 기본값: 'app'
enableLog?: boolean      // 기본값: false (프로덕션 권장)
}

함수: getCurrentScale()

목적: 현재 적용된 스케일 값(number)을 반환합니다.

전역 변수: window.currentScale

목적: 전역에서 스케일 값에 즉시 접근하여 좌표 보정 계산에 사용합니다.

4.사용 예시

4.1 기본 및 커스텀 사용법

import { initScaling, getCurrentScale } from './utils/scaling.js'

// 기본 설정 (1280x800) 초기화
initScaling();

// 또는 커스텀 해상도로 초기화
initScaling({
designWidth: 1920,
designHeight: 1080,
containerId: 'game-container'
});

4.2 드래그앤드롭 좌표 보정 예시

handleDrag(e) {
const appElement = document.getElementById('app');
const appRect = appElement.getBoundingClientRect();

// 스케일 및 상단 중앙 정렬 위치가 보정된 상대 좌표 계산
const relativeX = (e.clientX - appRect.left) / window.currentScale;
const relativeY = (e.clientY - appRect.top) / window.currentScale;

element.style.left = `${relativeX}px`;
element.style.top = `${relativeY}px`;
}

5.구현 세부사항

5.1 스타일 적용 순서

width, height: 디자인 해상도로 고정합니다.

position: absolute로 설정합니다.

left, top: 상단 중앙 정렬 계산식을 적용합니다 (top: 0 고정).

transform-origin: top left (스케일 기준점)로 설정합니다.

transform: scale(${scale})을 적용합니다.

5.2 스케일 계산 로직

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
const scale = Math.min(
viewportWidth / designWidth,
viewportHeight / designHeight
);

5.3 성능 고려사항

리사이즈 이벤트는 디바운싱 없이 즉시 실행하여 지연 없는 반응성을 확보합니다.

getBoundingClientRect() 계산을 최소화합니다.

스케일 값은 계산 후 전역/내부 변수에 저장하여 중복 계산을 방지합니다.

6.제약사항 및 주의사항

최소/최대 스케일 제한 없음: 매우 작거나 큰 화면에서도 비율에 맞춰 스케일이 적용됩니다.

픽셀 값 보정 필수: 모든 마우스/터치 좌표는 window.currentScale로 보정해야 합니다.

게임 엔진 호환성: Phaser 등 자체 스케일 매니저가 있는 엔진과 혼용 시 주의가 필요합니다.

iframe 사용 시: 부모 프레임의 스케일링과 충돌할 수 있으므로 독립적인 뷰포트 확보가 권장됩니다.

7.확장 가능성

최소/최대 스케일 제한 옵션 및 스케일 변경 이벤트 콜백

디바운싱/쓰로틀링 옵션 추가

가로/세로 모드(Orientation)별 별도 해상도 지원

ResizeObserver API를 활용한 컨테이너 크기 변화 감지

8.테스트 시나리오

8.1 기본 테스트

초기 로드: 다양한 화면 크기에서 콘텐츠가 상단 중앙에 배치되는지 확인합니다.

리사이즈: 창 크기 변경 시 스타일이 즉각 업데이트되는지 확인합니다.

좌표 보정: 스케일이 적용된 상태에서 드래그앤드롭 좌표의 정확도를 확인합니다.

8.2 엣지 케이스

4K 이상의 초고해상도 및 640x480 이하의 저해상도 환경

세로로 극단적으로 긴 화면에서의 상단 배치 상태 확인

9.마이그레이션 가이드

9.1 주의해야 할 코드 패턴

// ❌ 잘못된 예: 스케일 보정 없이 직접 사용 (위치가 어긋남)
element.style.left = e.clientX + 'px';

// ✅ 올바른 예: 스케일 및 캔버스 위치 보정 적용
const appRect = appElement.getBoundingClientRect();
const correctedX = (e.clientX - appRect.left) / window.currentScale;
element.style.left = correctedX + 'px';

10.참고 자료

현재 구현: src/utils/scaling.js

사용 예시: src/pages/TeamSetting.js

초기화 위치: src/main.js