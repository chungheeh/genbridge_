# GenBridge 정보구조(Information Architecture) 문서

---

## 목차

- 사이트맵(Site Map)
- 사용자 흐름(User Flow)
- 내비게이션 구조(Navigation Structure)
- 페이지 계층(Page Hierarchy)
- 콘텐츠 조직(Content Organization)
- 인터랙션 패턴(Interaction Patterns)
- URL 구조(URL Structure)
- 컴포넌트 계층(Component Hierarchy)

---

## 1. 사이트맵 (Site Map)

```
메인페이지/genbridge
├── 로그인(/login)
├── 회원가입(/signup)
├── 로그아웃(/logout)
├── (인증 이후, 역할별 분기)
│   ├── 노인/senior
│   │   ├── 질문 등록(/senior/ask)
│   │   ├── 답변 확인(/senior/answers)
│   │   ├── 답변 상세(/senior/answers/:id)
│   │   └── 내 정보(/profile)
│   └── 청년/youth
│       ├── 답변 대기 목록(/youth/questions)
│       ├── 답변 작성(/youth/answer/:id)
│       ├── 포인트 내역(/youth/points)
│       └── 내 정보(/profile)
├── 도움말(/help)
└── 오류(/error)
```

---

## 2. 사용자 흐름 (User Flow)

### [공통]
- 첫 진입 → 로그인/회원가입 → 역할(노인/청년) 선택 및 인증 → 역할별 대시보드 이동

### [노인]
1. 로그인 → 질문 등록(텍스트/음성)  
2. Whisper API로 음성 변환 → 질문 제출  
3. Pinecone로 유사 질문 검색  
4. 유사 답변 있으면 즉시 확인, 만족 시 채택(종료)  
5. 불만족/유사 답변 없으면 청년에게 전달  
6. 청년 답변 도착 시 답변 확인 및 채택

### [청년]
1. 로그인 → 답변 대기 목록 확인  
2. 답변할 질문 선택 → 답변 작성(텍스트/영상)  
3. 답변 제출 → 노인 채택 시 포인트 적립  
4. 포인트 내역 확인

---

## 3. 내비게이션 구조 (Navigation Structure)

- **탑바(Topbar) 고정형**
    - 로고(홈)
    - [노인]
        - 질문하기
        - 답변 확인
        - 내 정보
        - 로그아웃
    - [청년]
        - 답변 하기
        - 답변 확인
        - 내 정보
        - 스토어
    - 도움말(공통)

> 모바일 환경에서는 햄버거 메뉴로 전환

---

## 4. 페이지 계층 (Page Hierarchy)

| 1차(Top)         | 2차(Section)        | 3차(Detail)                |
|------------------|---------------------|----------------------------|
| /                | /login, /signup     |                            |
| /                | /logout             |                            |
| /senior          | /ask, /answers      | /answers/:id               |
| /youth           | /questions, /answer | /answer/:id, /points       |
| /profile         |                     |                            |
| /help            |                     |                            |
| /error           |                     |                            |

---

## 5. 콘텐츠 조직 (Content Organization)

- **노인**
    - 질문 등록: 텍스트 입력, 음성 입력(Whisper 연동), 제출 버튼, 입력 가이드
    - 답변 확인: 답변 리스트, 답변 상세(채택/불만족 선택), 음성 읽어주기 버튼
    - 내 정보: 개인정보, 활동 내역, 로그아웃

- **청년**
    - 답변 대기: 질문 리스트, 질문 상세, 답변 작성(텍스트/영상 업로드), 제출
    - 포인트 내역: 적립/사용 내역, 총 포인트
    - 내 정보: 개인정보, 활동 내역, 로그아웃

- **공통**
    - 도움말: 서비스 안내, 사용법, FAQ
    - 에러: 에러 메시지, 재시도 안내

---

## 6. 인터랙션 패턴 (Interaction Patterns)

- **필수 인증**: 모든 주요 페이지 접근 시 로그인 필요(JWT)
- **음성 입력**: 마이크 버튼 클릭 → Whisper API 호출 → 실시간 변환 결과 표시
- **질문 제출**: 입력 후 제출 → 로딩 표시 → 유사 질문 자동 검색 및 결과 안내
- **답변 채택**: 답변 목록에서 채택 버튼 클릭 → 포인트 지급 안내 모달
- **실시간 알림**: 답변 도착, 포인트 적립 등 주요 이벤트 알림(웹 푸시/토스트)
- **에러 처리**: API 실패 시 표준 에러 메시지("죄송합니다. 다시 시도해주세요") 노출
- **접근성**: 큰 글씨, 명확한 버튼, 키보드 내비게이션, 스크린리더 지원
- **반응형**: 모바일/데스크탑 모두 최적화, 주요 버튼/입력창 크기 자동 조정

---

## 7. URL 구조 (URL Structure)

| 역할   | 페이지            | URL 패턴                      | 설명                           |
|--------|-------------------|-------------------------------|--------------------------------|
| 공통   | 로그인            | /login                        | 로그인 폼                      |
| 공통   | 회원가입          | /signup                       | 회원가입 폼                    |
| 공통   | 로그아웃          | /logout                       | 로그아웃 처리                  |
| 노인   | 질문 등록         | /senior/ask                   | 텍스트/음성 질문 입력           |
| 노인   | 답변 확인         | /senior/answers               | 답변 목록                      |
| 노인   | 답변 상세         | /senior/answers/:id           | 답변 상세/채택                 |
| 청년   | 답변 대기         | /youth/questions              | 답변할 질문 목록                |
| 청년   | 답변 작성         | /youth/answer/:id             | 질문에 대한 답변 작성           |
| 청년   | 포인트 내역       | /youth/points                 | 포인트 적립/사용 내역           |
| 공통   | 내 정보           | /profile                      | 개인정보/활동 내역              |
| 공통   | 도움말            | /help                         | 서비스 안내/FAQ                 |
| 공통   | 에러              | /error                        | 에러 메시지                     |

> SEO 최적화를 위해 각 URL은 명확하고 한글이 아닌 영문으로 구성

---

## 8. 컴포넌트 계층 (Component Hierarchy)

```
<App>
  ├─ <Topbar>
  │    ├─ <Logo />
  │    ├─ <NavMenu>
  │    │    ├─ <NavItem />
  │    │    └─ <ProfileMenu />
  │    └─ <HelpButton />
  ├─ <Routes>
  │    ├─ <AuthRoute>
  │    │    ├─ <LoginPage />
  │    │    └─ <SignupPage />
  │    ├─ <SeniorRoute>
  │    │    ├─ <AskPage />
  │    │    ├─ <AnswersPage />
  │    │    └─ <AnswerDetailPage />
  │    ├─ <YouthRoute>
  │    │    ├─ <QuestionsPage />
  │    │    ├─ <AnswerWritePage />
  │    │    └─ <PointsPage />
  │    ├─ <ProfilePage />
  │    ├─ <HelpPage />
  │    └─ <ErrorPage />
  ├─ <Modal />
  ├─ <ToastNotification />
  └─ <Footer />
```

- **주요 컴포넌트 설명**
    - `<Topbar>`: 반응형, 고정형 상단 내비게이션
    - `<AskPage>`: 텍스트/음성 입력, Whisper API 연동
    - `<AnswersPage>`: 답변 목록, 각 답변 채택/불만족 처리
    - `<QuestionsPage>`: 청년용 질문 대기 목록
    - `<AnswerWritePage>`: 답변 작성(텍스트/영상 업로드)
    - `<PointsPage>`: 포인트 적립 내역
    - `<Modal>`, `<ToastNotification>`: 피드백 및 실시간 알림

---

## 추가 고려사항

- **반응형 디자인**: Tailwind CSS 활용, 모바일/데스크탑 모두 최적화
- **접근성(Accessibility)**: 큰 글씨, 명확한 버튼, 스크린리더/키보드 내비게이션 지원
- **SEO**: 각 페이지별 title/description 메타 태그, 명확한 URL 구조
- **보안**: 모든 주요 페이지 JWT 인증 필수, 역할별 접근 제한
- **에러/로딩 UX**: 표준화된 에러 메시지, 로딩 스피너, 재시도 버튼 제공

---

**GenBridge 정보구조(IA)는 노인과 청년 모두가 쉽고 안전하게 소통할 수 있도록, 직관적이고 반응형이며 접근성이 뛰어난 사용자 경험을 목표로 설계되었습니다.**
```