# 프론트엔드 변경사항 (Auth/Profile Flow 개선)

## 변경된 파일 목록 (Checklist)
- [x] `src/App.jsx`
  - `user` 상태 추가 및 `getMe`, `login`, `refresh` 시 사용자 정보 저장
  - `isInitializing` 상태를 추가하여 초기 세션 복구 시 로딩 UI 제공 (빈 화면 방지)
  - 회원가입 성공 시 `authSuccess` 상태를 통해 로그인 화면으로 자연스럽게 전환되도록 개선
  - `CustomerApp` 및 `OperatorApp`에 `user` prop 전달
  - `LoginPage`에 `initialIsOperator` prop을 전달하여 회원가입 화면에서 선택했던 역할(이용자/관리자)이 로그인 화면으로 돌아왔을 때 유지되도록 개선
  - `handleUpdateUser` 함수를 추가하여 사용자 프로필 업데이트 및 `localStorage`에 저장 (`profile_${userId}`)
  - `getMe`, `login`, `refresh` 시 `localStorage`에 저장된 프로필 정보를 병합하여 상태 복구
- [x] `src/pages/auth/LoginPage.jsx`
  - 회원가입 성공 후 전달받은 `success` 메시지를 표시하는 UI 추가
  - `initialIsOperator` prop을 받아 초기 탭 상태로 설정하도록 수정
- [x] `src/pages/customer/CustomerApp.jsx`
  - `user` prop을 받아 `CustomerSettings` 컴포넌트로 전달
  - `onUpdateUser` prop을 받아 `CustomerSettings` 컴포넌트로 전달
- [x] `src/pages/customer/CustomerSettings.jsx`
  - 하드코딩된 이름, 전화번호, 이메일 대신 `user` 객체의 데이터를 사용하도록 수정 (`user?.name`, `user?.phone`, `user?.email`)
  - 입력 필드를 제어 컴포넌트(Controlled Component)로 변경하여 상태 관리
  - '저장' 버튼 클릭 시 `onUpdateUser`를 호출하여 변경된 프로필 정보를 상위로 전달 및 알림 표시
- [x] `src/pages/operator/OperatorApp.jsx`
  - `user` prop을 받도록 수정 (일관성 유지)

## 수동 검증 체크리스트 (Manual Verification)
- [ ] 앱 초기 로드 시 세션 복구 중 "로딩 중..." 화면이 표시되는지 확인
- [ ] 회원가입 성공 시 로그인 화면 상단에 "회원가입이 완료되었습니다. 로그인해 주세요." 메시지가 표시되는지 확인
- [ ] 관리자 회원가입 화면으로 이동 후 뒤로가기를 누르거나 회원가입을 완료했을 때, 로그인 화면에서 '관리자 로그인' 탭이 유지되는지 확인
- [ ] 이용자(Customer)로 로그인 후 설정(Settings) 페이지 진입 시, 하드코딩된 정보가 아닌 실제 로그인한 유저의 이름, 전화번호, 이메일이 표시되는지 확인
- [ ] 설정 페이지에서 이름, 전화번호, 이메일을 수정하고 '저장' 버튼 클릭 시 알림이 표시되고 상태가 업데이트되는지 확인
- [ ] 프로필 수정 후 새로고침하거나 다른 페이지로 이동 후 돌아왔을 때 수정된 정보가 유지되는지 확인
- [ ] 로그아웃 후 다른 계정으로 로그인 시 이전 계정의 프로필 정보가 노출되지 않는지 확인
- [ ] 관리자(Operator) 로그인 및 로그아웃 흐름이 정상적으로 동작하는지 확인

## Non-Goals (이번 작업에서 제외된 항목)
- 백엔드 API 수정 및 API 계약(Contract) 변경
- 기존 회원가입 폼의 이메일 입력 필드 제거 또는 수정
- 초기 Auth/Profile 개선 단계에서는 관리자(Operator) 설정 페이지의 하드코딩 데이터 수정을 제외함 (이후 별도 요청으로 반영됨)
- 대규모 리팩토링 및 타입 억제(Type 추가)

---

# 프론트엔드 변경사항 (상담/문의 분리 Stage-1)

## 변경된 파일 목록 (Checklist)
- [x] `src/components/ui/BoardDetail.jsx` (신규)
  - 게시판 형태의 문의 상세 뷰를 위한 재사용 가능한 컴포넌트 추가
  - 고객용(읽기 전용) 및 상담사용(답변 작성 가능) 뷰 지원
- [x] `src/components/ui/index.js`
  - `BoardDetail` 컴포넌트 export 추가
- [x] `src/pages/customer/InquiryDetailPage.jsx`
  - `selectedInquiry.type === "문의"`일 경우 `BoardDetail` 컴포넌트를 렌더링하도록 분기 처리
  - 기존 "상담" 타입은 채팅 형태 유지
- [x] `src/pages/operator/OperatorInquiryDetail.jsx`
  - `selectedInquiry.type === "문의"`일 경우 메인 영역에 `BoardDetail` 컴포넌트를 렌더링하도록 분기 처리
  - 답변 작성 시 상태를 `RESOLVED`로 변경하고 메시지를 추가하는 `handleAnswerSubmit` 함수 구현
  - 기존 "상담" 타입은 채팅 형태 유지
- [x] `src/pages/customer/MainPage.jsx`
  - '최근 문의' 섹션의 목록을 `type === '문의'`인 항목만 표시하도록 필터링 추가

## 수동 검증 체크리스트 (Manual Verification)
- [ ] 고객 앱에서 '상담' 타입의 항목 클릭 시 기존 채팅 형태의 상세 화면이 표시되는지 확인
- [ ] 고객 앱에서 '문의' 타입의 항목 클릭 시 게시판 형태의 상세 화면(읽기 전용)이 표시되는지 확인
- [ ] 고객 앱 메인 화면의 '최근 문의' 목록에 '문의' 타입의 항목만 표시되는지 확인
- [ ] 상담사 앱에서 '상담' 타입의 항목 클릭 시 기존 채팅 형태의 상세 화면이 표시되는지 확인
- [ ] 상담사 앱에서 '문의' 타입의 항목 클릭 시 게시판 형태의 상세 화면이 표시되는지 확인
- [ ] 상담사 앱의 '문의' 상세 화면에서 답변 작성 후 등록 시, 답변이 추가되고 상태가 '해결'로 변경되는지 확인

## Non-Goals (이번 작업에서 제외된 항목)
- 백엔드 파일 수정
- 최상위 라우팅 아키텍처 변경
- 데이터 모델 재작성
- `MOCK_INQUIRIES`와 `MOCK_BOARD_POSTS` 데이터셋 병합

---

# 프론트엔드 변경사항 (상담/문의 분리 Stage-1 후속 패치)

## 변경된 파일 목록 (Checklist)
- [x] `src/pages/customer/MainPage.jsx`
  - '진행 중인 상담' 섹션에서 `type === '상담'`인 항목만 표시되도록 필터링 조건 추가 (기존에는 '문의' 타입도 노출되는 버그 수정)
- [x] `src/components/ui/BoardDetail.jsx`
  - `isOperator`가 true일 경우, `BoardDetail` 내부의 뒤로가기 버튼과 제목 UI를 숨기도록 수정하여 `OperatorInquiryDetail`의 헤더와 중복 노출되는 문제 해결

## 수동 검증 체크리스트 (Manual Verification)
- [ ] 고객 앱 메인 화면의 '진행 중인 상담' 목록에 '상담' 타입의 항목만 표시되는지 확인
- [ ] 상담사 앱의 '문의' 상세 화면 진입 시, 상단 헤더(뒤로가기, 제목)가 중복으로 표시되지 않는지 확인

---

# 프론트엔드 변경사항 (스토어 화면 UI 정리)

## 변경된 파일 목록 (Checklist)
- [x] `src/components/ui/BoardDetail.jsx`
  - 게시판 형태의 문의 상세 뷰에서 `참조 주문` 라벨을 `주문 상품`으로 변경
- [x] `src/pages/customer/StorePage.jsx`
  - 스토어 정보(전화번호, 주소, 영업시간)를 토글 없이 항상 표시되도록 수정
  - 스토어 정보 상단의 중복된 스토어 검색 바 제거
  - 스토어 탭을 `챗봇 / 문의 게시판 / 나의 문의`로 단순화 (상담 탭 숨김 처리, 내부 챗봇 핸드오프 로직은 유지)

## 수동 검증 체크리스트 (Manual Verification)
- [ ] 문의 상세 화면에서 주문 정보 라벨이 '주문 상품'으로 표시되는지 확인
- [ ] 스토어 진입 시 스토어 상세 정보가 토글 없이 항상 노출되는지 확인
- [ ] 스토어 화면 상단에 중복된 검색 바가 제거되었는지 확인
- [ ] 스토어 탭이 '챗봇', '문의 게시판', '나의 문의' 3개만 표시되는지 확인
- [ ] 챗봇에서 상담원 연결 시 내부적으로 상담 탭으로 전환되는 기능이 정상 동작하는지 확인

---

# 프론트엔드 변경사항 (스토어 화면 UI 정리 후속 패치)

## 변경된 파일 목록 (Checklist)
- [x] `src/pages/customer/StorePage.jsx`
  - 챗봇에서 상담원 연결 시(`storeTab === "consult"`) 활성화된 탭이 없어지는 UX 문제를 해결하기 위해, `storeTab`이 `"consult"`일 때도 '챗봇' 탭이 활성화된 것처럼 보이도록 수정

## 수동 검증 체크리스트 (Manual Verification)
- [ ] 챗봇에서 상담원 연결 후에도 '챗봇' 탭이 활성화된 상태로 표시되는지 확인

---

# 프론트엔드 변경사항 (관리자 화면 UI 및 데이터 연동 개선)

## 변경된 파일 목록 (Checklist)
- [x] `src/pages/operator/OperatorApp.jsx`
  - 하드코딩된 `storeName`을 `user?.storeName`으로 변경 (fallback: "패션스토어 루미")
  - `OperatorSettings` 컴포넌트에 `user` prop 전달
- [x] `src/pages/operator/OperatorMain.jsx`
  - 두 번째 KPI 카드의 제목을 `문의량`에서 `대기 문의`로 변경
  - 기간 필터 버튼 제거 및 전체 기간 기준 미해결(`status !== "RESOLVED"`) 문의 개수를 표시하도록 수정
- [x] `src/pages/operator/OperatorSettings.jsx`
  - `user` prop을 받아 스토어 정보(전화번호, 주소, 운영시간, 소개글)의 `defaultValue`에 적용 (fallback 유지)

## 수동 검증 체크리스트 (Manual Verification)
- [ ] 관리자 메인 화면의 두 번째 KPI가 '대기 문의'로 표시되고, 전체 미해결 문의 개수가 정확히 표시되는지 확인
- [ ] 관리자 메인 화면의 '대기 문의' 카드에 기간 필터 버튼이 제거되었는지 확인
- [ ] 관리자 앱 상단 네비게이션에 로그인한 관리자의 스토어 이름이 표시되는지 확인
- [ ] 관리자 설정 화면의 '스토어 관리' 탭에서 로그인한 관리자의 스토어 정보(전화번호, 주소, 운영시간, 소개글)가 기본값으로 표시되는지 확인
