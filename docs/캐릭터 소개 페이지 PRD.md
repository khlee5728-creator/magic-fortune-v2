# **\[PRD\] 영어 교육 활동 캐릭터 소개 페이지 (Luna & Noir)**

## **1\. 개요**

기존 영어 교육용 앱(포춘쿠키, 타로 활동) 내에 주요 캐릭터인 \*\*Luna(점술가)\*\*와 \*\*Noir(고양이)\*\*를 소개하는 인터랙티브 페이지를 추가하여 브랜드 스토리텔링과 학습자 몰입도를 강화한다.

## **2\. 주요 기능 및 화면 구조**

### **2.1 공통 네비게이션**

* **Toggle Navigation:** Luna 페이지와 Noir 페이지를 자유롭게 전환할 수 있는 상단/측면 버튼.  
* **Exit Button:** 캐릭터 소개 섹션을 종료하고 메인 활동(포춘쿠키/타로) 페이지로 돌아가는 버튼.

### **2.2 Luna 소개 페이지 (The Mystic Seer)**

* **배경:** 별도의 이미지 에셋을 활용한 전체 화면 배경 (background-size: cover).  
* **캐릭터:** 중앙에 루나 캐릭터 이미지 배치 (position: absolute).  
* **Magic Orbs (4종):** 캐릭터 주변을 은은하게 떠다니는 보라색/금색 계열의 원형 버튼.  
  * **디자인:** 수정구슬처럼 맑고 영롱한 질감, 내부 아이콘 포함.  
  * **항목:** \- About Luna: 이름, 나이, 마법 능력, 사는 곳 등 기본 정보.  
    * Favorite Things: 좋아하는 음식, 취미, 취향.  
    * Luna's TMI: 반전 성격(길치, 아침잠 등), 출생의 비밀.  
    * Magic Item: 모자, 수정 구슬 등 소장 아이템.  
* **상세 뷰:** Orb 클릭 시 하단에서 **반투명 보라색 Slide-up Panel** 등장 (한글/영어 병기).  
* **인터랙션:** 캐릭터 터치 시 기존 프로젝트의 AI 호출 방식(Open AI API 등)을 사용하여 루나가 건네는 무작위 인사말 생성 및 출력.

### **2.3 Noir 소개 페이지 (The Starry Familiar)**

* **배경:** 밤하늘이나 고양이 테마의 전체 화면 배경.  
* **캐릭터:** 중앙에 느와르 캐릭터 이미지 배치.  
* **Starry Orbs (4종):** **Framer Motion**을 사용하여 불규칙한 궤도로 움직이는 남색/실버 계열 원형 버튼.  
  * **디자인:** 고양이 눈처럼 반짝이거나 차가운 별빛 질감.  
  * **항목:**  
    * Night Hunter: 밤의 활동(지붕 위 별 관찰, 장난감 사냥).  
    * Favorite Things: 목걸이 방울의 유래(루나의 선물).  
    * Cat's Logic: 인간에 대한 엉뚱한 고양이 철학.  
    * Noir's Moods: 꼬리/눈 모양에 따른 기분 변화.  
* **상세 뷰:** Orb 클릭 시 하단에서 **반투명 Slide-up Panel** 등장 (한글/영어 병기).

## **3\. 기술 스택 및 구현 상세**

### **3.1 UI/UX**

* **Framework:** React \+ Vite  
* **Styling:** Tailwind CSS (반투명 효과, 절대 좌표 배치, 그라데이션)  
* **Animation:** framer-motion  
  * Orbs의 부유 효과 (Floating animation).  
  * Slide-up panel의 animate={{ y: 0 }} 효과.  
* **Responsive:** 모바일/태블릿 환경을 고려한 뷰포트 최적화.

### **3.2 AI Interaction**

* **Model:** 기존 활동에서 사용 중인 Open AI API 연동과 동일한 방식   
* **System Prompt 예시:** \- "You are Luna, a kind but clumsy fortune teller. Greet the student in a magical way (1 sentence, English )."

### **3.3 데이터 구조 (Mock-up)**

const characterData \= {  
  luna: {  
    about: { en: "A clumsy yet gifted seer...", ko: "허당미 넘치지만 재능 있는 점술가..." },  
    // ...중략  
  },  
  noir: {  
    nightHunter: { en: "Chasing stars on the roof...", ko: "지붕 위에서 별을 쫓는 밤의 사냥꾼..." },  
    // ...중략  
  }  
};

## **4\. 바이브 코딩(Vibe Coding)을 위한 요청 지침**

1. **상태 관리:** activeTab('luna' | 'noir')과 selectedOrb(null | category) 상태를 사용하여 화면 전환과 패널 노출을 관리할 것.  
2. **에셋 경로:** 배경 이미지와 캐릭터 이미지는 public/assets/images/ 경로를 기본값으로 설정하고 변수 처리할 것.  
3. **컴포넌트 분리:** Orb.jsx, InfoPanel.jsx, CharacterPage.jsx로 모듈화하여 유지보수가 용이하게 할 것.  
4. **접근성:** 버튼 클릭 및 터치 타겟은 최소 44px 이상으로 설정하고, 시각적 피드백(Scale 업 효과)을 줄 것.