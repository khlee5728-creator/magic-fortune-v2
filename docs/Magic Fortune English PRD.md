![][image1]  
Magic Fortune English

**버전:** 1.0

**상태:** 초안 (Draft)

**작성일:** 2024-05-22

**대상:** 기획자, 개발자, 디자이너

## **1\. 제품 개요 (Detailed Product Description)**

### **1.1 프로젝트 배경 및 목적**

'Magic Fortune English'는 영어 교육용 플랫폼인 **AI Playground** 내의 핵심 액티비티로, 아이들이 좋아하는 '운세'와 '신비로움'이라는 요소를 영어 학습에 접목했습니다. 단순히 단어를 암기하는 방식에서 벗어나, AI가 생성하는 개인화된 메시지를 통해 자연스럽게 문장을 익히고 발음을 듣는 경험을 제공하는 것을 목적으로 합니다.

### **1.2 핵심 비전**

"매일매일 궁금한 나의 행운, 영어로 열어보는 마법의 세계"

학습자(7\~13세)가 스스로 참여하고 싶어 하는 재미있는 활동을 통해 영어에 대한 거부감을 줄이고, 실생활과 밀접한 표현을 시제별로 학습합니다.

## **2\. 참조 서비스 (Reference Services)**

| 서비스명 | 선정 사유 및 벤치마킹 포인트 |
| :---- | :---- |
| **Duolingo Kids** | 어린이 대상의 직관적인 UI/UX와 캐릭터 중심의 상호작용 방식 참고 |
| **Starfall** | 기초 영문법과 문장 구조를 게임화(Gamification)하여 전달하는 방식 참고 |
| **LlamaIndex/OpenAI Apps** | 실시간 AI 문장 생성의 자연스러움과 초등 수준의 프롬프트 엔지니어링 벤치마킹 |
| **Hello Tarot (앱)** | 타로 카드를 뒤집는 물리적인 인터랙션과 시각적인 신비로움 연출 참고 |

## **3\. 핵심 기능 및 상세 사양 (Core Features & Specifications)**

### **3.1 AI 포춘쿠키 (AI Fortune Cookie)**

사용자가 쿠키를 선택해 깨뜨리는 과정을 통해 오늘의 행운 메시지를 학습합니다.

* **인터랙션:** 5개의 쿠키 중 1개 선택 \-\> 클릭 시 바삭하게 깨지는 애니메이션(Lottie) \-\> 메시지 등장.  
* **AI 문장 생성:** \- 난이도: 초등 필수 영단어 800개 내외, CEFR B1 수준.  
  * 톤앤매너: 긍정적, 격려, 초등학생 생활 밀착형(학교, 친구, 취미 등).  
* **오디오:** 생성된 텍스트를 Fortune Teller 캐릭터의 목소리로 TTS 재생.

### **3.2 AI 타로카드 (AI Tarot Card)**

과거, 현재, 미래의 시제를 타로 카드 이미지를 통해 시각적/문법적으로 학습합니다.

* **인터랙션:** 셔플된 10장 중 3장 선택 \-\> 순서대로 과거(Past), 현재(Present), 미래(Future) 할당.  
* **AI 이미지 생성 (DALL-E 기반):** \- 컨셉: 초등학생 생활 패턴(급식, 운동장, 시험, 생일 파티 등) \+ 타로 특유의 몽환적인 화풍.  
  * 일관성: 동일한 캐릭터나 테마가 유지되도록 프롬프트 제어.  
* **AI 문장 생성:**  
  * **Past:** 과거형 문장 (예: You studied hard yesterday.)  
  * **Present:** 현재(진행)형 문장 (예: You are having fun with friends.)  
  * **Future:** 미래형 문장 (예: You will get a special gift soon.)  
* **오디오:** 캐릭터 보이스 액팅이 가미된 TTS 재생.

### **3.3 화면 흐름 및 공통 사양**

* **인트로:** Fortune Cookie / Tarot Card 모드 선택창. Start 클릭 시 로딩 시작.  
* **로딩(대기) 화면:** AI가 텍스트/이미지를 생성하는 동안 '마법 구슬이 움직이는 영상'이나 캐릭터 애니메이션을 재생하여 지루함 방지.  
* **캐릭터:** 'Fortune Teller' (점술가) 캐릭터가 전 과정을 안내하며, Lottie를 활용해 말하기/움직이기 애니메이션 적용.  
* **재시도:** 활동 완료 후 'Try Again'을 통해 인트로로 즉시 복귀.

## **4\. 사용자 페르소나 및 시나리오 (User Persona & Scenarios)**

### **4.1 페르소나**

* **이름:** 김민준 (10세, 초등 3학년)  
* **특징:** 스마트 기기 조작에 능숙함. 긴 글보다는 이미지와 짧은 애니메이션을 선호함. 영어 학원 숙제 외에 재미있는 영어 콘텐츠를 찾고 있음.

### **4.2 사용자 시나리오**

1. 민준이는 태블릿에서 'Magic Fortune English'를 실행한다.  
2. 오늘 하루가 어떨지 궁금해 'Tarot Card' 모드를 선택하고 Start를 누른다.  
3. 마법 같은 인트로 영상을 보며 기대감을 갖는다.  
4. 카드 3장을 신중하게 고른다.  
5. 과거, 현재, 미래 카드가 뒤집히며 AI가 그린 멋진 그림과 영어 문장이 나타난다.  
6. 점술가 캐릭터의 목소리를 들으며 문장을 따라 읽어본다.  
7. "You will have a yummy snack\!"이라는 미래 메시지를 보고 기분 좋게 활동을 마친다.

## **5\. 기술 스택 권장 사항 (Technical Stack Recommendations)**

| 분류 | 기술 스택 | 선정 이유 |
| :---- | :---- | :---- |
| **Frontend** | **React \+ Vite** | 빠른 개발 속도와 컴포넌트 기반 UI 관리, 태블릿 환경 최적화 |
| **Interaction** | **Framer Motion** | 카드 뒤집기, 쿠키 깨지기 등 고품질 UI 인터랙션을 부드럽게 구현 |
| **Animation** | **Lottie** | Fortune Teller 캐릭터의 복잡한 애니메이션을 가볍고 고품질로 렌더링 |
| **AI (LLM)** | **OpenAI GPT-4** | 초등 수준에 맞는 자연스러운 영어 문장 생성 및 시제 제어 |
| **AI (Image)** | **OpenAI DALL-E 3** | 텍스트 프롬프트에 기반한 창의적이고 교육적인 타로 이미지 생성 |
| **TTS** | **Web Speech API or OpenAI TTS** | 캐릭터의 개성을 살릴 수 있는 고품질 음성 합성 |
| **Platform** | **PWA (Web-based)** | iOS/Android 태블릿 PC 대응을 위한 반응형 웹 및 앱 패키징 용이성 |

## **7\. 제약 사항 (Constraints)**

* **저장 방식:** 별도의 DB 서버 없이 Local Storage만 활용하여 개인화 정보 유지 (개인정보 보호 및 서버 비용 절감).  
* **해상도:** 모바일 스마트폰은 지원하지 않으며, Tablet PC(4:3 또는 16:10 비율) 가로 모드에 최적화된 레이아웃 제공.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAACyUlEQVR4Xu3by4uOURzA8flPZoZybyaXRjLJNWpMLIZyKZfFRBQiTMbIJZfUhJHbRrkXiynXQiKXtQ0rG7YWoojN4Zx6p/fyD/xefRaf3uec5/Juv53zPC133v1JAADE1VI/AQBALIINACA4wQYAEJxgAwAITrABAAQn2AAAghNsAADBCTYAgOAEGwBAcIINACA4wQYAEJxgAwAITrABAAQn2ICmsGLt9tTa2lp0TO8qv3PmLUu33/5Ou4/fTJOmdJS5aZ2zUlt7e1rSu76cq9w/f2lfma/cn4+7uhfXXAMQlWADmsaEiVPS8tX95fj6y+9p3dZDaWjkcRlfe/GtxFrl2k07T6UDZ+7X3H/44tO0ccfJsfGW/SNpy8B50QaEJ9iApjFu3Ph04urbsfG+0/fGAu7olRc1MTZ49kFaunJDuvHqRxnn3zy+MPqp5pl5xW3XsWsN/wUQiWADmsK5ex9LnN18/bOM8+pZDrhb/8b1MZZX2yZP7axZOctB19bW1vDcHGx5pa1+HiASwQY0hbz1OXdBT1q9eW8xvas7DQyPlnOXH35JnTPnlPfUOmbMLmGWo636/hxl9cGWgy4HW16pq/8/gEgEG9AUFixblS4/+Nwwn+UYy+FVGQ+df5K2DV6quSYHXV6Fq547culZ6tu4Z2zVDiAqwQY0heogq5e/+lzUs6YcV7ZHc7RVX5NX1/K2aGWct1Lzl6X1zwKISLAB4eWty/rtzGr5XOWDg6vPv6buhb0l2Nb0D5Z33/IXpfkL0so7bmfvfihRN3znfcOzACISbMB/JwfewZFH6dabXw3nAJqRYAMACE6wAQAEJ9gAAIITbAAAwQk2AIDgBBsAQHCCDQAgOMEGABCcYAMACE6wAQAEJ9gAAIITbAAAwQk2AIDgBBsAQHCCDQAgOMEGABCcYAMACE6wAQAEJ9gAAIITbAAAwf0FzCxNtTJl+8QAAAAASUVORK5CYII=>