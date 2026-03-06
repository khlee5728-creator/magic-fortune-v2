# 🔊 Sound Effects Setup Guide

음향 효과를 위한 오디오 파일 설정 가이드입니다.

## 📁 필요한 오디오 파일

다음 2개의 오디오 파일을 `public/sounds/` 폴더에 추가해야 합니다:

### 1. **intro-ambient.mp3**
- **용도**: IntroPage 배경음악
- **타입**: 앰비언트 루프 음악
- **길이**: 30초 ~ 1분 (루프 가능한 길이)
- **분위기**: 신비롭고 마법 같은 느낌
- **볼륨**: 낮게 (15% 설정됨)
- **추천 키워드**: "mystical ambient", "magic atmosphere", "fantasy background music"

### 2. **card-select.mp3**
- **용도**: 카드 클릭 시
- **타입**: 짧은 효과음
- **길이**: 1~2초
- **효과**: 마법 폭발, 긍정적인 징소리
- **볼륨**: 중간 (50% 설정됨)
- **추천 키워드**: "magic confirm", "spell cast", "positive chime"

---

## 🎵 오디오 파일 생성/다운로드 방법

### 옵션 1: 무료 음원 사이트
- **Freesound.org** - https://freesound.org
  - Creative Commons 라이선스
  - 검색: "magic sound effect", "mystical ambient"

- **Pixabay Music** - https://pixabay.com/music/
  - 무료 사용 가능
  - 검색: "mystical", "magic", "fantasy"

- **Zapsplat** - https://www.zapsplat.com
  - 무료 효과음 (회원가입 필요)
  - 검색: "magic", "spell", "chime"

### 옵션 2: AI 음원 생성
- **ElevenLabs Sound Effects** - https://elevenlabs.io/sound-effects
  - AI 기반 효과음 생성

- **Soundraw** - https://soundraw.io
  - AI 배경음악 생성 (유료)

### 옵션 3: 직접 제작
- **Audacity** (무료) - 간단한 편집 및 루프 생성
- **GarageBand** (Mac) - 음악 및 효과음 제작

---

## 📂 파일 배치 방법

1. 오디오 파일 다운로드/생성
2. 파일을 다음 경로에 배치:
   ```
   public/
     sounds/
       intro-ambient.mp3
       card-select.mp3
   ```

3. 파일 형식: **MP3** (권장) 또는 **OGG**
   - MP3가 브라우저 호환성이 가장 좋습니다
   - 파일 크기: 각 효과음 100KB 이하, 배경음 500KB 이하 권장

---

## 🎚️ 볼륨 조정

코드에서 볼륨을 조정하려면:

### IntroPage.jsx (배경음악 및 효과음)
```javascript
// 배경음악 볼륨 조정 (0.0 ~ 1.0)
useBGM('/sounds/intro-ambient.mp3', {
  volume: 0.15,  // ← 이 값 조정 (현재 15%)
  // ...
})

// 효과음 볼륨 조정
const playSelect = useSound('/sounds/card-select.mp3', {
  volume: 0.5  // ← 이 값 조정 (현재 50%)
})
```

---

## ⚠️ 오디오 파일이 없어도 작동합니다

오디오 파일이 없어도 애플리케이션은 정상 작동합니다:
- 배경음악과 효과음이 재생되지 않을 뿐
- 시각적 효과와 애니메이션은 동일하게 작동
- 브라우저 콘솔에 경고 메시지만 표시됨

### 임시로 배경음악 비활성화하려면:

**IntroPage.jsx**에서 다음 줄을 주석 처리:
```javascript
// useBGM('/sounds/intro-ambient.mp3', {
//   volume: 0.15,
//   loop: true,
//   autoPlay: true,
//   fadeInDuration: 2500,
// })
```

---

## 🧪 테스트 방법

1. 오디오 파일 배치 후 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 http://localhost:8001 열기

3. 각 효과음 확인:
   - ✅ 페이지 로드 시 배경음악 재생
   - ✅ 카드 클릭 시 마법 소리

4. 브라우저 콘솔(F12)에서 오류 확인

---

## 🔇 모바일 대응

iOS Safari는 사용자 인터랙션 전에 자동 재생을 차단합니다:
- 배경음악은 첫 터치 후 재생 시작
- 효과음은 정상 작동

---

## 📝 추가 정보

- **파일 크기 최적화**: https://www.audacityteam.org
- **루프 생성 방법**: 시작과 끝이 자연스럽게 연결되도록 편집
- **브라우저 호환성**: MP3는 모든 최신 브라우저에서 지원

---

## 🆘 문제 해결

### 소리가 안 나올 때
1. 브라우저 음소거 확인
2. 파일 경로 확인 (`public/sounds/파일명.mp3`)
3. 파일 형식 확인 (MP3 또는 OGG)
4. 브라우저 콘솔에서 오류 메시지 확인

### 배경음악이 너무 클 때
- IntroPage.jsx의 `volume: 0.15` 값을 `0.05` ~ `0.1`로 낮추기

### 효과음이 너무 작을 때
- 각 `useSound`의 `volume` 값을 `0.6` ~ `0.8`로 높이기

---

**Happy Coding! 🎉**
