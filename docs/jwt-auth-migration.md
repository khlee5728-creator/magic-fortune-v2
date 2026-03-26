---
name: jwt-auth-migration
description: |
  Poly AI Playground의 모든 컨텐츠(게임/액티비티)에서 OpenAI API 호출을 JWT 인증 방식으로 마이그레이션할 때 사용하는 스킬입니다.
  다음 상황에서 반드시 이 스킬을 참조하세요:
  - "JWT 인증 추가해줘", "API 인증 마이그레이션", "토큰 인증으로 바꿔줘"
  - 새로운 게임/액티비티 컨텐츠를 만들 때 OpenAI API 호출이 포함된 경우
  - 기존 fetch() 호출을 백엔드 인증 방식으로 교체할 때
  - "401 오류", "인증 실패", "Unauthorized" 에러를 디버깅할 때
  - "CORS 오류", "스트리밍 응답", "TTS 오디오 재생" 관련 작업을 할 때
  - config.js, callOpenAIAPI, callStreamingAPI, getCookie, backendUrl 관련 작업을 할 때
  ⛔ 다음 상황에서는 이 스킬을 사용하지 않음:
  - 게임 기능 개발/테스트 중 (JWT, 인증, 배포 언급이 없는 경우)
  - 운영 배포와 무관한 일반 코드 작업
---

# 컨텐츠 JWT 인증 마이그레이션 가이드

## ⚠️ 적용 시점 주의

> 이 스킬은 **운영 서버 배포 직전 마지막 단계**에만 사용합니다.

| 구분 | 설명 |
|------|------|
| ✅ 사용하는 경우 | 사용자가 **"JWT"**, **"인증"**, **"배포"** 를 명시적으로 언급할 때 |
| ❌ 사용하지 않는 경우 | 게임 기능 개발·테스트 중, 위 키워드 언급 없이 코드 작업 요청 시 |

개발/테스트 단계에서 게임 기능을 구현할 때는 이 스킬을 적용하지 않습니다.
인증 마이그레이션은 기능이 완성된 후 배포 직전에 한 번만 수행합니다.

---

## 개요

Poly AI Playground 백엔드의 모든 OpenAI API 엔드포인트는 **JWT 토큰 인증**을 요구합니다.
새 컨텐츠를 만들거나 기존 컨텐츠를 수정할 때 이 가이드의 패턴을 따르세요.

---

## STEP 0: 컨텐츠 유형 파악 (가장 먼저 확인)

| 유형 | 특징 | 예시 |
|------|------|------|
| **A. 순수 HTML + script.js** | 별도 `.js` 파일 존재 | story_builder |
| **B. 인라인 스크립트** | `<script>` 블록이 HTML 안에만 있음 | ghost_buster, whats_your_animal_type |
| **C. Vite/React 번들앱** | `index.html` + `src/` 구조 | Magic Fortune English 등 |

유형에 따라 아래 해당 섹션으로 이동하세요.

---

## STEP 1: config.js 로드 (공통 - 모든 유형 필수)

> 🚫 **`config.js`는 플랫폼에서 중앙 관리합니다. 개별 게임 폴더에 별도로 생성하지 마세요.**
> 개별 게임은 플랫폼이 제공하는 `window.CONFIG`를 그대로 참조하기만 하면 됩니다.

**`index.html` 또는 메인 HTML 파일의 `<head>` 맨 앞에 추가:**

```html
<head>
  <!-- ✅ 반드시 다른 모든 스크립트보다 먼저 위치해야 함 -->
  <script src="/config.js"></script>
  
  <!-- 이후 나머지 스크립트들... -->
</head>
```

> ⚠️ **주의**: `window.CONFIG`가 정의되기 전에 다른 스크립트가 실행되면 `undefined` 오류 발생

---

## STEP 2: 공통 함수 추가

### 유형 A (순수 HTML + script.js)
→ **`script.js` 파일 상단**에 아래 함수 추가

### 유형 B (인라인 스크립트)
→ **API 호출하는 `<script>` 블록 맨 위**에 아래 함수 추가

### 유형 C (Vite/React)
→ **`src/utils/api.js`** (없으면 생성) 에 아래 함수 추가하고, 사용하는 컴포넌트에서 import

```javascript
// 백엔드 URL 설정
// ※ 개발/운영 환경에 따라 config.js의 apiUrl이 자동으로 전환됩니다
const backendUrl = (window.CONFIG && window.CONFIG.apiUrl)
  ? window.CONFIG.apiUrl
  : 'https://devplayground.polarislabs.ai.kr/api-v1';

// 쿠키 읽기 헬퍼
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

// JWT 토큰 가져오기 (쿠키 우선, 없으면 localStorage)
function getJwtToken() {
  return getCookie('access_token') || localStorage.getItem('authToken') || '';
}

// 401 처리: 토큰 만료 시 로그인 페이지로 이동
function handleUnauthorized() {
  alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
  window.location.href = '/login'; // 실제 로그인 경로로 변경
}

// ─────────────────────────────────────────────
// [일반] 공통 OpenAI API 호출 함수 (JSON / Blob)
// ─────────────────────────────────────────────
async function callOpenAIAPI(endpoint, payload) {
  const jwtToken = getJwtToken();
  const url = `${backendUrl}${endpoint}`;

  // 최대 3회 재시도
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        handleUnauthorized();
        return null;
      }

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        // 백엔드 래핑 형식: { code: "200", data: { ... } }
        if ((data.code === '200' || data.code === 200) && data.data) {
          return data.data;
        }
        // 직접 형식: { choices: [...] } 또는 { data: [...] }
        return data;
      } else {
        // 바이너리 응답 (오디오 TTS 등) → Blob 반환
        return response.blob();
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === 2) throw error;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Backend API call failed after multiple retries.');
}

// ─────────────────────────────────────────────
// [스트리밍] /chat/stream 전용 함수
// onChunk(text): 토큰이 도착할 때마다 호출됨
// onDone(): 스트리밍 완료 시 호출됨
// ─────────────────────────────────────────────
async function callStreamingAPI(endpoint, payload, onChunk, onDone) {
  const jwtToken = getJwtToken();
  const url = `${backendUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({ ...payload, stream: true })
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  if (!response.ok) {
    throw new Error(`스트리밍 API 오류: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // SSE 형식: "data: {...}\n\n" 파싱
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    for (const line of lines) {
      const jsonStr = line.replace('data: ', '').trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed?.choices?.[0]?.delta?.content || '';
        if (text) onChunk(text);
      } catch {
        // 파싱 실패한 청크는 무시
      }
    }
  }

  if (onDone) onDone();
}
```

---

## STEP 3: 기존 fetch() 교체

**기존 코드 (교체 전):**
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  body: JSON.stringify(payload)
});
```

**변경 후 (일반 JSON 응답):**
```javascript
const data = await callOpenAIAPI('/chat/completions', payload);
```

**변경 후 (스트리밍 — 화면에 글자가 흘러나오는 효과):**
```javascript
let fullText = '';
await callStreamingAPI('/chat/stream', payload,
  (chunk) => {
    fullText += chunk;
    document.getElementById('output').textContent = fullText; // 실시간 표시
  },
  () => {
    console.log('스트리밍 완료:', fullText);
  }
);
```

**변경 후 (TTS 오디오 재생):**
```javascript
const audioBlob = await callOpenAIAPI('/audio/speech', {
  model: 'tts-1',
  input: '읽어줄 텍스트',
  voice: 'alloy'
});
if (audioBlob) {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
  // 재생 완료 후 메모리 해제
  audio.onended = () => URL.revokeObjectURL(audioUrl);
}
```

> ✅ endpoint는 **path만** 입력 (`/chat/completions`, `/audio/speech` 등)  
> ✅ `backendUrl`은 함수 내부에서 자동으로 붙음

---

## STEP 4: Vite/React에서 import 사용법 (유형 C)

```javascript
// 사용하는 컴포넌트 파일 상단에 추가
import { callOpenAIAPI, callStreamingAPI } from '../utils/api';

// 컴포넌트 내부에서 호출
const data = await callOpenAIAPI('/chat/completions', payload);
```

> ⚠️ `src/utils/api.js`의 경로는 컴포넌트 위치에 따라 `'../../utils/api'` 등으로 달라질 수 있음

---

## 백엔드 엔드포인트 목록

### Chat
| endpoint | 함수 | 설명 |
|----------|------|------|
| `/chat/completions` | `callOpenAIAPI` | Chat Completion (표준) |
| `/chat` | `callOpenAIAPI` | Chat Completion (단축) |
| `/chat/stream` | `callStreamingAPI` | 스트리밍 (글자 순차 출력) |

### Image
| endpoint | 함수 | 설명 |
|----------|------|------|
| `/images/generations` | `callOpenAIAPI` | DALL-E 3 이미지 생성 |
| `/images/generations/dall-e-2` | `callOpenAIAPI` | DALL-E 2 이미지 생성 |

### Audio
| endpoint | 함수 | 설명 |
|----------|------|------|
| `/audio/speech` | `callOpenAIAPI` | TTS (텍스트 → 음성, Blob 반환) |
| `/audio/transcriptions` | `callOpenAIAPI` | STT (음성 → 텍스트) |

> ⚠️ `window.CONFIG.apiUrl`이 `.../api-v1` 형태이면  
> endpoint는 `/api/chat/completions` ❌ → `/chat/completions` ✅ (앞에 `/api` 붙이지 않음)

---

## Vite/React 전용 주의사항

```javascript
// vite.config.js - proxy target은 환경변수 또는 고정 URL만 사용
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // ❌ 잘못된 방법: window.CONFIG는 빌드 시점에 없음
        // target: window.CONFIG.apiUrl,
        
        // ✅ 올바른 방법: 고정 URL 또는 환경변수
        target: process.env.VITE_PROXY_TARGET || 'https://playground.polarislabs.ai.kr',
        changeOrigin: true
      }
    }
  }
})
```

실제 런타임 요청 URL은 `src/utils/api.js`의 `window.CONFIG?.apiUrl`로 결정됩니다.

---

## 자주 발생하는 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| `window.CONFIG is undefined` | config.js 로드 순서 문제 | `<head>` 맨 앞에 config.js 이동 |
| 401 Unauthorized | 토큰 키 이름 불일치 또는 만료 | `authToken` (localStorage), `access_token` (쿠키) 확인 후 재로그인 |
| endpoint 404 오류 | path에 `/api` 중복 | base가 `.../api-v1`이면 `/chat/completions`만 사용 |
| CORS 오류 (blocked by CORS policy) | 로컬 개발 시 도메인 불일치 | `vite.config.js`의 proxy 설정 확인, 또는 백엔드 팀에 CORS 허용 요청 |
| 스트리밍이 한 번에 표시됨 | 잘못된 함수 사용 | `/chat/stream`은 반드시 `callStreamingAPI` 사용 |
| 오디오가 재생 안 됨 | Blob URL 미생성 | `URL.createObjectURL(blob)` 후 `new Audio(url).play()` 패턴 사용 |
| 기존 story_builder 패턴 | config.js 누락 가능성 | index.html `<head>` 확인 필수 |

---

## 체크리스트

마이그레이션 완료 후 확인:

- [ ] `<head>` 맨 앞에 `<script src="/config.js"></script>` 추가됨
- [ ] `backendUrl`, `getJwtToken`, `getCookie`, `callOpenAIAPI` 함수 추가됨
- [ ] 스트리밍이 필요한 경우 `callStreamingAPI` 함수도 추가됨
- [ ] 기존 `fetch()` 직접 호출이 모두 교체됨
- [ ] endpoint path에 `/api` 중복 접두어 없음
- [ ] Vite/React(유형 C)라면 `import` 구문 추가됨
- [ ] 401 발생 시 `handleUnauthorized`의 로그인 경로(`/login`)가 실제 경로와 일치함
- [ ] TTS 사용 시 `URL.revokeObjectURL`로 메모리 해제 처리됨
- [ ] 로그인 후 실제 API 호출 테스트 완료
