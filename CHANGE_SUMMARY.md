# 변경사항 요약

## 작성 기준

- `CURRENT_WORK_PROGRESS.md`의 "현재 변경사항을 기능 단위로 나누어 정리한다" 및 "진행상황 문서를 변경 시마다 업데이트한다" 규칙을 따른다.
- `think/project-handbook/07-collaboration-and-development-rules.md`의 문서 업데이트/검증 기록 규칙에 맞춰 변경 내용, 이유, 검증 결과를 함께 남긴다.

## 1. 문의 게시판 수정 동작 변경

### 문제

고객 문의 게시판에서 기존 문의글을 수정하면 기존 글이 업데이트되지 않고 새 문의글이 추가로 생성됐다.

### 원인

- 수정 버튼은 기존 문의 내용을 작성 폼에 채우고 작성 화면으로 이동했다.
- 하지만 저장 시에는 항상 `POST /api/inquiries`를 호출해 새 문의를 생성했다.
- 기존 문의 ID를 보존하거나 `PATCH` 수정 API를 호출하는 흐름이 없었다.

### 변경 내용

- `code/src/pages/customer/BoardTab.jsx`
  - `editingPostId` 상태를 추가했다.
  - 새 글 작성과 기존 글 수정을 구분하도록 저장 로직을 분기했다.
  - 수정 시 기존 문의를 local state에서 교체하도록 변경했다.
- `code/src/api/inquiries.js`
  - `PATCH /api/inquiries/{inquiry_id}`를 호출하는 `updateInquiry()`를 추가했다.
- `code/src/pages/customer/StorePage.jsx`
  - 수정된 문의가 부모 `inquiryPosts` 상태에도 반영되도록 `handleInquiryUpdated()`를 추가했다.
- `server/main.py`
  - `PATCH /api/inquiries/{inquiry_id}` 엔드포인트를 추가했다.
- `server/app/inquiries.py`
  - 고객 본인 문의만 수정할 수 있는 `update_inquiry()`를 추가했다.
  - 답변이 이미 등록된 문의는 수정하지 못하도록 했다.
- `server/app/validation.py`
  - 문의 수정 payload 검증 함수 `validate_inquiry_update()`를 추가했다.

### 검증 결과

- 문의 작성 후 수정 시 `PATCH /api/inquiries/{id}`가 호출되는 것을 확인했다.
- 수정 후 기존 제목은 사라지고 수정된 제목만 1개 남는 것을 화면 QA로 확인했다.
- QA용 문의글은 DB에서 정리했다.

## 2. 패션스토어 루미 누락/오염 복구

### 문제

고객 화면의 주문했던 스토어에서 `패션스토어 루미`가 사라졌거나, 일부 데이터에서 `패션스토어 루`처럼 잘린 이름이 섞여 보였다.

### 원인

- `패션스토어 루미` 자체가 삭제된 것은 아니었다.
- 스토어 수정/조회 조건이 잘못되어 다른 운영자의 스토어 row가 잘못 갱신될 수 있었다.
- 그 결과 중복 스토어 row와 잘못된 `패션스토어 루` row가 생겼다.

### 변경 내용

- `server/app/repositories.py`
  - 스토어 수정 시 `owner_user_id`가 아니라 실제 `store.id` 기준으로 수정하도록 고쳤다.
  - 운영자 소유 스토어 조회는 다시 `owner_user_id` 기준으로 유지했다.
- `server/app/customer_home.py`
  - demo seed 복구 시 store name만 기준으로 찾지 않고 `owner_user_id`를 우선 기준으로 사용하도록 변경했다.
  - 기존 운영자 소유 스토어를 유지하면서 이름/카테고리/상세 정보를 정상 demo 값으로 복구하도록 했다.
- DB 데이터 정리
  - 잘못 생성된 `패션스토어 루` row를 제거했다.
  - 중복된 `북카페 서랍`, `맛있는 빵집` 관련 row를 현재 구조에 맞게 정리했다.
  - 주문/문의/상담/상품 참조가 올바른 canonical store row를 바라보도록 정리했다.

### 검증 결과

- `customer01 / 1234` 기준 `/api/customer/home` 응답에 `패션스토어 루미`가 포함되는 것을 확인했다.
- 잘못된 `패션스토어 루` 이름은 응답과 DB에서 0건임을 확인했다.
- `operator01 / 1234` 기준 운영자 스토어가 `패션스토어 루미`로 반환되는 것을 확인했다.
- `operator_bakery`, `operator_bookcafe`도 각각 `맛있는 빵집`, `북카페 서랍`으로 정상 연결되는 것을 확인했다.
- Playwright 화면 QA에서 고객 홈의 "주문했던 스토어" 영역에 `패션스토어 루미`가 표시되는 것을 확인했다.

## 3. 공통 검증

- Backend health: `GET /api/health` 200 OK
- Frontend availability: `http://203.234.62.35:8002` 200 OK
- Frontend build: `npm run build` 성공
- Python compile: 변경된 backend 파일 `py_compile` 성공
- JS/JSX LSP diagnostics: 변경된 frontend 파일에서 문제 없음
- Python LSP diagnostics: `basedpyright-langserver` 미설치로 실행 불가
- `git diff --check`: 통과

## 4. 현재 변경 파일

- `code/src/api/inquiries.js`
- `code/src/pages/customer/BoardTab.jsx`
- `code/src/pages/customer/StorePage.jsx`
- `server/app/customer_home.py`
- `server/app/inquiries.py`
- `server/app/repositories.py`
- `server/app/validation.py`
- `server/main.py`
- `CHANGE_SUMMARY.md`

## 5. 참고

- `.sisyphus/run-continuation/`은 작업 세션용 untracked 디렉터리이며 커밋 대상에서 제외한다.
