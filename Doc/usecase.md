# GenBridge 상세 Use Case 문서

---

## 목차

- Actor Definitions
- Use Case Scenarios
- Main Steps
- Exception Handling
- Comprehensive Actor Definitions
- Detailed Use Case Scenarios
- Main Steps and Flow of Events
- Alternative Flows and Edge Cases
- Preconditions and Postconditions
- Business Rules and Constraints
- Exception Handling Procedures
- User Interface Considerations
- Data Requirements and Data Flow
- Security and Privacy Considerations

---

## 1. Actor Definitions (행위자 정의)

| 행위자        | 정의                                                         | 권한 및 역할                          |
|---------------|-------------------------------------------------------------|---------------------------------------|
| 노인 사용자   | 질문을 등록하고, 답변을 확인 및 채택하는 주 사용자            | 질문 등록, 답변 열람/채택, 피드백      |
| 청년 사용자   | 질문에 답변을 작성하고, 포인트를 적립하는 주 사용자           | 답변 작성/제출, 포인트 확인            |
| 시스템        | 음성 인식, 벡터 검색, 자동 응답, 데이터 저장 등 자동화 주체   | 음성→텍스트 변환, 유사 질문 검색, 데이터 관리 |
| 관리자(옵션)  | 서비스 운영 및 모니터링, 데이터 관리, 에러 대응               | 데이터 관리, 사용자 관리, 통계          |

---

## 2. Use Case Scenarios (사용 시나리오)

### 시나리오 1: 노인 사용자의 질문 등록 및 자동 답변 확인
- 노인은 음성 또는 텍스트로 질문을 등록한다.
- 시스템은 Whisper API로 음성을 텍스트로 변환한다.
- Pinecone을 통해 유사 질문을 탐색한다.
- 유사 질문이 있으면 즉시 답변을 제공한다.
- 노인이 답변에 만족하면 채택하고, 그렇지 않으면 청년에게 질문이 전달된다.

### 시나리오 2: 청년 사용자의 답변 작성 및 포인트 적립
- 청년은 대기 중인 질문 목록을 확인한다.
- 답변할 질문을 선택하고 텍스트/영상으로 답변을 작성한다.
- 노인이 답변을 채택하면 청년에게 포인트가 지급된다.

---

## 3. Main Steps (주요 단계)

### [노인]
1. 로그인/회원가입(JWT 인증)
2. 질문 등록(텍스트/음성)
3. 음성 입력 시 Whisper API로 변환
4. 질문 벡터화 및 Pinecone 유사 질문 검색
5. 유사 답변 제공 및 만족 여부 선택
6. (만족) → 답변 채택 및 종료
7. (불만족/유사 없음) → 청년에게 질문 전달

### [청년]
1. 로그인/회원가입(JWT 인증)
2. 답변 대기 목록 확인
3. 답변할 질문 선택
4. 답변 작성(텍스트/영상)
5. 답변 제출
6. 노인 채택 시 포인트 적립

---

## 4. Exception Handling (예외 처리)

- Whisper API, Pinecone, DB 등 외부/내부 API 실패 시
    - 사용자에게 "죄송합니다. 다시 시도해주세요" 메시지 출력
    - 시스템 로그 기록 및 관리자 알림
- 유사 질문 검색 결과 없음
    - "준비된 답변이 없습니다" 안내 후 청년에게 질문 전달
- 청년 답변 미제출/노인 답변 미채택
    - 일정 시간 경과 시 리마인더 알림, 미채택 시 "답변 대기 중" 표시

---

## 5. Comprehensive Actor Definitions (상세 행위자 정의)

| 행위자        | 상세 설명                                                                                         |
|---------------|--------------------------------------------------------------------------------------------------|
| 노인 사용자   | 디지털 기기 사용이 익숙하지 않은 고령층, 음성 중심 인터페이스 선호, 질문 해결에 집중               |
| 청년 사용자   | 디지털 친화적, 사회적 기여와 포인트 적립 동기, 멀티미디어 답변(텍스트/영상) 활용 가능               |
| 시스템        | AI 기반 자동화, 데이터 저장/검색/분석, 역할별 UI 분기, 실시간 알림 및 에러 처리 담당                |
| 관리자(옵션)  | 서비스 품질 모니터링, 데이터 백업, 이상 징후 감지 및 대응, 정책/공지사항 관리                      |

---

## 6. Detailed Use Case Scenarios (상세 시나리오)

### [노인] 질문 등록 및 답변 확인

1. 노인은 로그인 후 "질문하기" 페이지 진입
2. 텍스트 입력 또는 마이크 버튼 클릭해 음성 녹음
3. Whisper API 호출, 실시간 텍스트 변환 결과 확인
4. 질문 제출 → 시스템이 Pinecone에 벡터 저장 및 유사 질문 검색
5. 유사 답변이 있으면 즉시 표시, 없다면 "준비된 답변이 없습니다" 안내
6. 답변에 만족 시 "채택" 클릭 → 종료 및 피드백
7. 불만족 시 "더 좋은 답변 요청" → 청년에게 질문 전달

### [청년] 답변 작성 및 포인트 적립

1. 청년은 로그인 후 "답변 대기" 페이지 진입
2. 답변할 질문 목록 확인, 상세 보기
3. 텍스트/영상으로 답변 작성, 제출
4. 노인에게 답변 전달, 노인 채택 시 포인트 적립
5. 포인트 내역 페이지에서 적립 내역 확인

---

## 7. Main Steps and Flow of Events (이벤트 흐름)

**노인 질문 등록~답변 채택 전체 플로우**

1. [Precondition] 노인/청년 회원가입 및 로그인 완료
2. [Trigger] 노인 질문 등록
3. [System] 음성→텍스트 변환(필요 시), 질문 벡터화 및 유사 질문 검색
4. [System] 유사 답변 제공 → 노인 만족 여부 입력
5. [노인] 만족(채택) → [System] 종료, 청년 포인트 지급
6. [노인] 불만족/유사 없음 → [System] 청년에게 질문 전달
7. [청년] 답변 작성, 제출 → [노인] 답변 확인 및 채택 → 포인트 지급

---

## 8. Alternative Flows and Edge Cases (대안 흐름 및 엣지 케이스)

- 음성 입력 불가/Whisper API 장애: 텍스트 입력만 허용, 안내 메시지 제공
- Pinecone 장애: 임시로 유사 질문 검색 생략, "답변 준비 중" 안내
- 청년 답변 미제출: 일정 시간 후 자동 알림, 미채택 시 관리자 개입 가능
- 노인 답변 미채택: 리마인더 알림, 일정 기간 후 자동 종료 및 피드백 요청
- 데이터 저장 실패: 재시도 안내, 지속 실패 시 관리자 알림 및 장애 공지

---

## 9. Preconditions and Postconditions (선행조건 및 종료조건)

| 구분        | 내용                                                                                   |
|-------------|----------------------------------------------------------------------------------------|
| 선행조건    | - 회원가입 및 로그인(JWT) 완료<br>- 역할(노인/청년) 선택<br>- 필수 정보 입력 완료        |
| 종료조건    | - 노인 질문에 대한 답변이 채택됨<br>- 포인트가 청년에게 적립됨<br>- 질문/답변 DB 저장     |

---

## 10. Business Rules and Constraints (업무 규칙 및 제약)

- 모든 주요 기능은 인증(로그인) 후에만 접근 가능
- 질문/답변/포인트 이력은 MongoDB에 실시간 저장
- 질문 등록 시 음성 또는 텍스트 중 1개 필수 입력
- 답변 채택 시 포인트는 1회만 지급, 중복 지급 불가
- 동일 질문 중복 등록 방지(유사도 기준)
- 개인정보 및 민감 데이터는 암호화 저장

---

## 11. Exception Handling Procedures (예외 처리 절차)

- 외부 API(Whisper, Pinecone) 장애 시
    - 사용자에게 표준 에러 메시지("죄송합니다. 다시 시도해주세요") 노출
    - 장애 발생 로그 기록 및 관리자에게 알림
- 데이터 저장 실패 시
    - 재시도 안내, 지속 실패 시 장애 공지
- 인증 만료/로그아웃 상태
    - 로그인 페이지로 리다이렉트, "세션이 만료되었습니다" 안내

---

## 12. User Interface Considerations (UI/UX 고려사항)

- **노인 대상**: 큰 글씨, 명확한 버튼, 음성 안내, 직관적 네비게이션
- **청년 대상**: 빠른 목록 탐색, 멀티미디어 답변 지원, 포인트 시각화
- **공통**: 반응형 디자인(Tailwind CSS), 접근성(스크린리더, 키보드 내비), 표준화된 에러/로딩 UX
- **SEO**: 명확한 URL, 각 페이지별 메타 태그, 접근성 최적화

---

## 13. Data Requirements and Data Flow (데이터 요구사항 및 흐름)

| 데이터 유형      | 내용 및 흐름                                                                                                 |
|------------------|------------------------------------------------------------------------------------------------------------|
| 사용자 정보      | 회원가입/로그인 시 입력, JWT로 인증, MongoDB 저장                                                            |
| 질문 데이터      | 질문 등록(텍스트/음성) → Whisper 변환(필요 시) → Pinecone 벡터화 및 검색 → MongoDB 저장                      |
| 답변 데이터      | 청년 답변 등록(텍스트/영상) → 노인에게 전달 → 채택 시 포인트 지급 → MongoDB 저장                              |
| 포인트 이력      | 답변 채택 시 포인트 적립/사용 내역 MongoDB 저장, 청년 포인트 내역 페이지에서 조회                             |
| 로그/이벤트      | 주요 이벤트(질문 등록, 답변 채택, 에러 등) 기록, 관리자 모니터링 가능                                        |

---

## 14. Security and Privacy Considerations (보안 및 개인정보 고려사항)

- **인증/인가**: JWT 기반, 모든 주요 기능 접근 시 인증 필요
- **암호화**: 사용자 정보, 질문/답변 데이터 암호화 저장
- **접근제어**: 역할별 페이지 제한(노인/청년 구분), 관리자 권한 별도 분리
- **데이터 최소화**: 민감 정보 최소 수집, 불필요 데이터 저장 금지
- **에러/로그 관리**: 민감 정보 로그 미출력, 장애 발생 시 관리자에게만 상세 정보 제공
- **정기 보안 점검**: 외부 API 연동 보안, 취약점 점검, 개인정보보호법 및 관련 규정 준수
- **백업 및 복구**: MongoDB 정기 백업, 장애 발생 시 신속 복구 프로세스 마련

---

**GenBridge의 Use Case는 노인과 청년 모두가 쉽고 안전하게 소통하며, AI 기반 자동화와 데이터 보안을 최우선으로 고려하여 설계되었습니다.**
```
