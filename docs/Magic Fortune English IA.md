# **\[IA\] Magic Fortune English 정보 아키텍처 (Information Architecture)**

**프로젝트명:** Magic Fortune English

**문서 버전:** 1.1 (결과 화면 인페이지 통합 업데이트)

**상태:** 초안 (Draft)

**작성일:** 2024-05-22

## **1\. 사이트 맵 (Site Map)**

본 서비스는 별도의 로그인이나 페이지 이동이 최소화된 **활동 중심의 단일 흐름(Single Flow)** 구조를 가집니다. 특히 결과 확인은 활동 페이지 내 상태 변화를 통해 이루어집니다.

1. **Intro Screen (메인)**  
   * 활동 선택 (포춘쿠키 / 타로카드)  
   * 시작하기 버튼  
2. **Loading Screen (과도기)**  
   * AI 생성 안내 (텍스트/이미지) 및 인트로 영상 재생  
3. **Activity & Result Screen (활동 및 결과 통합)**  
   * **Fortune Cookie:** 쿠키 선택/깨뜨리기 인터랙션 → **(동일 페이지)** 행운 메시지 및 TTS 출력  
   * **Tarot Card:** 카드 셔플/3장 선택 인터랙션 → **(동일 페이지)** 과거/현재/미래 카드 이미지 및 설명 출력  
   * **Common:** 활동 다시 하기(Try Again) 버튼 → Intro 이동

## **2\. 사용자 흐름 (User Flow)**

사용자가 앱에 진입하여 활동을 완료하기까지의 논리적 단계입니다.

1. **시작:** 앱 진입 시 Fortune Teller 캐릭터가 환영 인사말을 함.  
2. **선택:** '포춘쿠키' 또는 '타로카드' 모드 중 하나를 선택 후 'Start' 클릭.  
3. **대기:** AI가 문장과 이미지를 생성하는 동안 신비로운 연출의 영상 시청.  
4. **수행 및 학습 (통합):**  
   * (포춘쿠키) 화면의 쿠키를 클릭하여 깨뜨리면 그 자리에서 바로 영어 메시지가 나타나고 TTS가 재생됨.  
   * (타로카드) 10장의 카드 중 3장을 선택하면 선택된 위치에 AI 생성 이미지와 시제별 문장이 순차적으로 노출됨.  
5. **종료 및 회귀:** 결과 확인 후 화면 하단의 'Try Again' 버튼을 눌러 초기 인트로 화면으로 돌아감.

## **3\. 내비게이션 구조 (Navigation Structure)**

* **내비게이션 타입:** None (고정된 상단/측면 메뉴 바 없음)  
* **구조 특징:**  
  * **Linear State Navigation:** 페이지 이동 대신 '상태(State)' 변화를 통한 선형적 진행으로 아동의 이탈 방지.  
  * **In-page Transition:** 활동과 결과 사이의 경계를 없애 학습 몰입도 유지.  
  * **Contextual Actions:** 각 단계에서 필요한 버튼(Start, Try Again)만 강조하여 노출.

## **4\. 페이지 위계 (Page Hierarchy)**

| Level | Page Name | 주요 기능 및 특징 |
| :---- | :---- | :---- |
| **L1** | **Intro (Home)** | 최상위 페이지, 모드 선택 및 서비스 진입점 |
| **L2-1** | **Fortune Page** | 쿠키 깨뜨리기 인터랙션 \+ 결과 메시지/TTS 학습 (통합 뷰) |
| **L2-2** | **Tarot Page** | 카드 선택 인터랙션 \+ 시제별 이미지/문장 학습 (통합 뷰) |

## **5\. 콘텐츠 조직 (Content Organization)**

| 화면 구분 | 핵심 콘텐츠 요소 | AI 활용 요소 |
| :---- | :---- | :---- |
| **Intro** | 활동 선택 버튼, 점술가 캐릭터 (Lottie) | \- |
| **Loading** | 마법 구슬 영상, 로딩 텍스트 | 백그라운드 AI 요청 시작 |
| **Activity Area (상태 1\)** | 쿠키/카드 그래픽, 인터랙션 가이드 | \- |
| **Result Area (상태 2\)** | 영어 문장, AI 생성 이미지, 다시 하기 버튼 | 행운 메시지(GPT), 타로 이미지(DALL-E), 캐릭터 TTS |

## **6\. 인터랙션 패턴 (Interaction Patterns)**

* **Tap (클릭):** 쿠키/카드 선택, TTS 재생 버튼.  
* **In-place Update:** 클릭한 오브젝트(쿠키, 카드)가 그 자리에서 결과물로 변하거나 확장되는 연출.  
* **Visual Feedback:** 쿠키 파편 효과, 카드 뒤집기(Flip) 애니메이션.  
* **Wait Interaction:** AI 생성 중 지루함을 느끼지 않도록 '마법 연출' 영상을 전체 화면으로 제공.

## **7\. URL 구조 (URL Structure)**

Single Page Application (SPA) 기반이며, 라우팅보다는 상태(State) 파라미터로 현재 단계를 관리합니다.

* / : 인트로  
* /?mode=fortune\&step=active : 포춘쿠키 활동 및 결과 확인 페이지  
* /?mode=tarot\&step=active : 타로 카드 선택 및 결과 확인 페이지  
* \* 로딩 시에는 오버레이(Overlay) 또는 임시 뷰를 활용\*

## **8\. 컴포넌트 계층 구조 (Component Hierarchy)**

App (Main Container)  
├── Common  
│   ├── Character (Lottie Animator)  
│   ├── TTSPlayer (Audio Controller)  
│   └── MagicButton (Styled Button)  
├── Pages  
│   ├── IntroPage (Mode Selector)  
│   ├── LoadingOverlay (AI Generating Video)  
│   ├── FortuneActivityPage  
│   │   ├── CookieController (Interaction State: Hidden/Broken)  
│   │   └── ResultDisplay (Visible after break)  
│   └── TarotActivityPage  
│       ├── CardDeckController (Selection State)  
│       └── TarotResultDisplay (Image/Text reveal in-place)  
└── Shared  
    ├── AIProvider (API Context)  
    └── LocalStore (History Manager)

## **9\. 반응형 및 접근성 고려 사항**

### **9.1 반응형 디자인 (Responsive)**

* **Target:** Tablet PC 가로 모드 고정.  
* **Dynamic Layout:** 활동 단계와 결과 단계의 콘텐츠 양 차이를 고려하여 유동적인 레이아웃 배치 (Flex/Grid).  
* **Touch Size:** 아동이 결과 확인 후 'Try Again'을 쉽게 누를 수 있도록 버튼 크기 최적화.

### **9.2 접근성 및 SEO**

* **Alt Text:** AI 생성 결과물이 나타날 때 해당 영문 텍스트를 이미지의 Alt 값으로 즉시 업데이트하여 스크린 리더 지원.  
* **Visual Cue:** 활동이 끝나고 결과가 나왔음을 알리는 시각적 효과(빛나는 효과 등) 추가.