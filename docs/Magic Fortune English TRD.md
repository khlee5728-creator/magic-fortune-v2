![][image1]  
Magic Fortune English 기술 요구사항 명세서

**프로젝트명:** Magic Fortune English

**문서 버전:** 1.0

**상태:** 승인 대기

**작성일:** 2024-05-22

## **1\. 프로젝트 개요 (Executive Summary)**

### **1.1 프로젝트 정의**

본 프로젝트는 **AI Playground** 영어 교육 플랫폼 내에 탑재되는 인터랙티브 학습 액티비티입니다. AI(OpenAI) 기술을 활용하여 사용자에게 개인화된 행운 메시지와 타로 결과를 제공하며, 자연스럽게 초등 수준의 영문법(시제)과 어휘를 학습하도록 설계되었습니다.

### **1.2 핵심 기술적 접근 방식**

* **AI 기반 개인화:** OpenAI의 GPT-4(텍스트) 및 DALL-E(이미지) 모델을 활용하여 매번 새로운 학습 콘텐츠 생성.  
* **하이브리드 멀티 디바이스 대응:** 하나의 코드베이스(React)로 웹과 태블릿(iOS, Android) 환경에 최적화된 UX 제공.  
* **비동기 사용자 경험 최적화:** AI 생성 시간(Latency) 동안 인트로 영상을 재생하여 사용자 이탈 방지.

## **2\. 시스템 아키텍처 (System Architecture)**

### **2.1 전체 시스템 구성도**

시스템은 크게 사용자 기기(Client), 공용 백엔드(Backend), AI 엔진(OpenAI)의 3계층 구조로 이루어집니다.

\[사용자 기기 (Tablet/Web)\]  
      |  
      | (HTTPS 요청: API 호출)  
      v  
\[공용 백엔드 서버 (devplayground.polarislabs.ai.kr)\]  
      |  
      | (OpenAI API 통신: API Key 보안 관리)  
      v  
\[OpenAI API (GPT-4, DALL-E 3, TTS)\]

### **2.2 컴포넌트 역할**

1. **Frontend (React):** UI 렌더링, Lottie 애니메이션 제어, 로컬 데이터 저장.  
2. **Backend (Proxy Server):** 프론트엔드와 OpenAI 사이의 중계 역할. API 키를 안전하게 숨기고 요청을 가공함.  
3. **AI Engine:** 텍스트 생성, 이미지 생성, 음성 변환(TTS) 처리.

## **3\. 기술 명세 (Technical Specifications)**

### **3.1 프론트엔드 (Frontend)**

* **Framework:** React \+ Vite (빠른 개발 및 빌드 속도 보장)  
* **Interaction:** Framer Motion (카드 뒤집기, 버튼 피드백 등 부드러운 전환)  
* **Animation:** Lottie-react (Fortune Teller 캐릭터의 벡터 기반 애니메이션 실행)  
* **Styling:** Tailwind CSS (다양한 해상도의 태블릿 화면에 대응하는 반응형 디자인)

### **3.2 백엔드 및 API 연동**

제공된 PlayGround Backend API를 다음과 같이 활용합니다.

| 기능 | API 엔드포인트 | 역할 |
| :---- | :---- | :---- |
| **문장 생성** | POST /api/chat/completions | 포춘쿠키 메시지 및 타로 설명 텍스트 생성 |
| **이미지 생성** | POST /api/images/generations | 타로 카드 이미지(과거/현재/미래) 생성 |
| **음성 합성** | POST /api/audio/speech | 생성된 문장을 캐릭터 음성으로 변환 |

### **3.3 데이터 모델 (Data Model)**

본 프로젝트는 별도의 DB 서버를 사용하지 않고 브라우저/앱의 **Local Storage**를 사용합니다.

* **User Info:** 기본 회원 정보 및 최근 활동 내역.  
* **Session State:** 현재 선택한 쿠키/카드 정보, AI 응답 데이터(텍스트/이미지 URL).

## **4\. 인프라 (Infrastructure)**

### **4.1 호스팅 및 환경**

* **Backend URL:** https://devplayground.polarislabs.ai.kr/api 고정 사용.

### **4.2 태블릿 최적화 전략**

* **뷰포트 제어:** 모바일 접속 차단 및 태블릿 전용 가로 모드 강제 UI 구성.  
* **터치 타겟:** 모든 버튼과 인터랙션 요소는 최소 44x44px 이상의 터치 영역 확보.

## **5\. 보안 요구사항 (Security Requirements)**

### **5.1 데이터 보호**

* **HTTPS:** 모든 통신은 보안 프로토콜을 통해 암호화됨.  
* **API 보안:** 클라이언트 코드에 OpenAI API Key를 직접 노출하지 않고, 반드시 백엔드 서버를 통해서만 호출.  
* **개인정보:** 회원 정보는 최소한으로 유지하며, 민감 정보는 서버 세션 또는 암호화된 로컬 저장소에 보관.

## **6\. 성능 요구사항 (Performance Requirements)**

### **6.1 응답 시간 목표 (Target Response Time)**

* **UI 반응성:** 100ms 이내 (클릭 시 즉각적인 애니메이션 시작).  
* **AI 생성 대기:** 최대 10\~15초 예상. 이를 보완하기 위해 **인트로 영상**을 생성 완료 시점까지 루프 재생.

### **6.2 리소스 최적화**

* Lottie 파일은 JSON 포맷으로 사용해 이미지 대비 용량을 90% 이상 절감.  
* 이미지 생성 결과는 클라우드 캐시를 활용하여 동일 세션 내 중복 다운로드 방지.

## **7\. 개발 및 테스트 전략 (Development & Test)**

### **7.1 개발 워크플로우**

* **Git Flow:** main(운영), develop(개발), feature/\*(기능 단위) 브랜치 전략 사용.

### **7.2 테스트 시나리오**

1. **AI 응답 테스트:** 부적절한 메시지가 생성되지 않도록 프롬프트 가드레일 확인.  
2. **멀티 디바이스 테스트:** iPad 및 갤럭시 탭 등 주요 태블릿 해상도별 레이아웃 확인.  
3. **네트워크 테스트:** 오프라인 또는 불안정한 네트워크 시 에러 메시지 처리 확인.

## **8\. 외부 연동 및 장애 대응 (Third-Party & Failover)**

### **8.1 OpenAI 서비스 장애 시**

* **Fallback 전략:** AI 서버 응답 실패 시, 사전에 준비된 '고정형(Static) 행운 메시지 20종' 중 하나를 무작위로 출력하여 서비스 중단 방지.  
* **에러 핸들링:** "마법 구슬이 잠시 쉬고 있어요. 잠시 후 다시 시도해 주세요\!"와 같은 아동 친화적 안내 문구 표시.

## **9\. 모니터링 및 유지보수 (Monitoring)**

* **Error Tracking:** Sentry 연동을 통해 사용자 기기에서 발생하는 런타임 에러 실시간 수집.  
* **Usage Analytics:** AI 호출 횟수 및 인기 모드(쿠키 vs 타로) 통계 수집.

## **10\. 위험 분석 (Risk Analysis)**

| 위험 요소 | 영향도 | 완화 전략 |
| :---- | :---- | :---- |
| **OpenAI 비용 초과** | 높음 | 일일 호출 제한(Quota) 설정 및 백엔드 측면 캐싱 적용 |
| **부적절한 텍스트 생성** | 중간 | 프롬프트 내에 "초등학생에게 적합한" 가이드라인 강제 주입 |
| **이미지 생성 지연** | 낮음 | 고품질 인트로 애니메이션 및 프로그레스 바 제공으로 체감 시간 단축 |

**작성자:** 시스템 아키텍트 (System Architect)

**참조 문서:**

**![][image2]**

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAAB+ElEQVR4Xu3bMWtTURgG4HYQFAURjMEkNzc3mdyE4Ozi0C7i6B/wNwhuDsXNSRD0P7gJDh0qjg4uuqtLN8FdW78PcvBwicsNOD0PfNxz3p7bri8nzd4eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALCj1Wp1Yz6ff982bds+j+f7eP6OOY/5kc/FYvG0/h0lr8/EvK7PAAAwUJSvg5i7uY6SdRjzItdN00xi/aTKj8o7sf62XC6vlv14PL4c2XGUu2V15lPXdW3ZAwAwwGQyuR4l62Wut5WuKG13osxdjPxtr4x9iP29ss91ZGdln0aj0ZXIvuTfqHMAAAba3KKd9/NeGduPAnc79m/qM1noYk7rrOu6cd7ExdyscwAABopidfSPwvY485iTmF8xnyPer89E9jVLW53Fe+vIPsbzWp0DADBQ3pBlKduSZxk7zvXmY86TvD3rnTmrPyJNsX+Xpa3OAADYQd6iNU1zf1sec5jr8vFoFrfy8+l0Osvbtfxft+qdWzGvyh4AgB1tbs5O6y8WpNlsdqnOo5Q9zAKX5yN7tskO2uobpJE/iv3P9Xp9oWQAAPxHeZMW86CfAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPDXH6Y/ZUBmc7POAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,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>