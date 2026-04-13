# AI Agent Development Guidelines

이 파일은 이 프로젝트에서 작업하는 AI Agent(Claude)가 따라야 할 규칙을 정의합니다.

---

## 프로젝트 개요

- **프로젝트명**: 소규모 판매자용 고객지원 플랫폼
- **기술 스택**: React + Vite (FE), FastAPI (BE), AI 모델 (AI)
- **팀 구성**: FE팀, BE팀, AI팀 (병렬 개발)
- **배포**: 검증 완료 후 즉시 배포

---

## 🎯 개발 워크플로우

### 브랜치 구조
```
main              ← 프로덕션 (배포 가능 상태)
  ↑ (PR + 테스트 통과)
develop           ← 통합 개발
  ↑ (PR + 테스트 통과)
feat/be/*         ← BE 기능 개발 (이 브랜치)
feat/fe/*         ← FE 기능 개발
feat/ai/*         ← AI 기능 개발
```

### 작업 순서
1. **작업 전**: 현재 develop/main과 동기화
2. **개발**: feat/be 브랜치에서만 작업
3. **테스트**: 로컬에서 필수 테스트 실행
4. **커밋**: 명확한 메시지로 커밋 (아래 규칙 참조)
5. **PR**: develop으로 PR 생성
6. **병합**: 테스트 통과 후 즉시 merge

---

## 📋 커밋 메시지 규칙

### 형식
```
<type>: <subject>

<body (선택)>
```

### type 종류
- `feat`: 새 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링 (기능 변화 없음)
- `docs`: 문서 수정
- `test`: 테스트 추가/수정
- `chore`: 빌드/의존성 변경

### 예시
```
feat: JWT 토큰 검증 로직 추가

- access_token 검증
- refresh_token 자동 갱신
- 만료된 토큰 처리
```

---

## 🔄 PR 작성 규칙

### PR 제목
```
[BE] 기능 요약 (15-50글자)
```

### PR 본문 (필수)
```markdown
## 📝 변경 사항
- 구현한 기능 설명

## 🔗 의존성
- FE API 변경 있음? (FE 담당자 @mention)
- AI 연동 변경? (AI 담당자 @mention)
- DB 마이그레이션 필요?

## ✅ 테스트
- 로컬 테스트 통과
- API 엔드포인트 정상 작동 확인
```

---

## 🧪 테스트 필수 항목

### Before commit
```bash
# 1. 로컬 빌드 확인
cd server
pip install -r requirements.txt

# 2. API 테스트 (pytest 있으면)
python -m pytest

# 3. 서버 실행 확인
PYTHONPATH="$(pwd)/.pydeps:$(pwd)" python3 -m uvicorn main:app --host 0.0.0.0 --port 4000
```

### Before PR
```bash
# GitHub Actions가 자동으로 실행될 테스트:
# - 백엔드 빌드 성공
# - pytest 통과 (있으면)
# - 의존성 충돌 없음

# ❌ 이것들은 테스트 실패 원인:
# - import 에러
# - 문법 에러
# - 의존성 누락
# - pytest 실패
```

---

## 🤝 팀 협업 규칙

### API 변경 시
```
❌ FE를 깨트리면 안됨!

변경 전 확인:
1. 기존 엔드포인트 변경 여부 확인
2. FE 개발자에게 @mention으로 알림
3. 호환성 테스트 후 진행
4. PR에 변경 사항 명시

예: /api/auth/login 응답 형식 변경
  - 기존: { accessToken, refreshToken }
  - 변경: { token: { access, refresh } }
  → FE 개발자 반드시 @mention
```

### DB 변경 시
```
마이그레이션 필수:
1. database.py에서 스키마 정의
2. 기존 데이터 호환성 확인
3. BE 팀원에게 알림
4. PR에 마이그레이션 스크립트 포함
```

### AI 모델 연동 시
```
입출력 형식 고정:
1. 입력: 예상 포맷 명시
2. 출력: 응답 구조 문서화
3. AI 팀과 공동 테스트
4. repository.py에 예시 코드 작성
```

---

## 📦 코드 구조 및 위치

```
server/
├── main.py                    ← FastAPI 앱 (수정 금지, import만)
├── app/
│   ├── __init__.py
│   ├── auth.py               ← 사용자 인증 로직
│   ├── database.py           ← DB 연결 & 스키마
│   ├── repositories.py       ← 데이터 조회/저장
│   ├── security.py           ← JWT, 암호화
│   ├── validation.py         ← 입력 검증
│   ├── exceptions.py         ← 커스텀 에러
│   └── config.py             ← 환경 변수
├── requirements.txt          ← 패키지 목록
└── .env.example              ← 환경 변수 템플릿
```

### 각 파일의 역할
- **main.py**: 엔드포인트만 정의 (비즈니스 로직은 app/ 에서)
- **auth.py**: 회원가입, 로그인, 토큰 관리
- **database.py**: MySQL 연결, 테이블 정의
- **repositories.py**: 쿼리 실행 (SELECT, INSERT, UPDATE)
- **security.py**: 비밀번호 해싱, JWT 검증
- **validation.py**: 요청 데이터 검증
- **exceptions.py**: 에러 처리

---

## ❌ 금지 사항

| 항목 | 이유 |
|------|------|
| main.py에 비즈니스 로직 작성 | 재사용 불가, 유지보수 어려움 |
| FE API 호환성 확인 없이 merge | FE 배포 실패 |
| 의존성 수동으로 requirements.txt 추가 | 버전 충돌 |
| .env 파일 커밋 | 보안 위험 |
| 테스트 생략 | 버그를 찾기 어려움 |
| 직접 main 브랜치 push | 배포 실패 위험 |

---

## ✅ 확인 체크리스트 (매 PR)

```
PR 생성 전 확인:
☐ feat/be 브랜치에서 작업했나?
☐ develop과 merge conflict 없나?
☐ 로컬에서 빌드 성공?
☐ pytest 통과했나?
☐ API 변경 시 FE 팀에 알렸나?
☐ DB 변경 시 마이그레이션 포함했나?
☐ 커밋 메시지가 명확한가?
☐ .env, node_modules 등 커밋 안 했나?

PR 본문 확인:
☐ 변경 사항 설명 있나?
☐ 의존성 알림 (@mention) 했나?
☐ 테스트 통과 확인했나?
```

---

## 🚨 에러 대응

### pytest 실패 시
```bash
# 1. 로컬에서 재현
python -m pytest -v

# 2. 에러 메시지 읽기 (원인 파악)
# 3. 코드 수정
# 4. 다시 테스트
pytest -v

# 5. 통과 후 push
```

### API 호환성 깨진 경우
```
1. FE 개발자에게 긴급 알림
2. 호환성 유지하는 방식으로 수정
   - 기존 필드 유지 + 새 필드 추가
   - 또는 버전 분리 (/api/v1/, /api/v2/)
3. FE 팀과 함께 테스트
4. PR에 대응 방식 명시
```

### DB 연결 실패 시
```
1. server/.env 확인
   - MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD
2. MySQL 실행 확인
3. 데이터베이스 생성 확인
4. database.py의 테스트 함수 실행
```

---

## 🔗 관련 문서

- [WORKFLOW_SETUP.md](./WORKFLOW_SETUP.md) - 전체 워크플로우
- [README.md](./README.md) - 프로젝트 설정 & 실행
- [server/app/](./server/app/) - 백엔드 코드 구조
- specs/ - 기술 명세서

---

## AI Agent를 위한 특수 지침

### 작업 시작 시
```
1. 이 파일 읽기 (CLAUDE.md)
2. git status 확인 (현재 상태)
3. git branch 확인 (feat/be에 있나?)
4. 필요하면 git fetch/pull (최신화)
```

### 코딩 중
```
- 기존 코드 패턴 따르기
- 주석은 로직이 복잡할 때만
- 한 번에 한 가지 기능만 구현
- 테스트 먼저 고려하기 (TDD)
```

### PR 생성 전
```
1. 로컬에서 테스트 실행
2. commit 메시지 형식 확인
3. PR 템플릿 채우기
4. 팀 알림 필요 시 @mention
```

### 의도하지 않은 변경 방지
```
✗ main 브랜치에 직접 push
✗ .env, node_modules 커밋
✗ 다른 팀 코드 수정 (요청 없이)
✓ 질문 있으면 PR 코멘트로 물어보기
✓ 불확실하면 일단 커밋 후 피드백 받기
```

---

## 마지막 체크

**이 파일을 읽은 AI Agent는 다음을 약속합니다:**
- ✅ 워크플로우 규칙 준수
- ✅ PR 전 테스트 실행
- ✅ 팀 협업 규칙 따르기
- ✅ 보안 및 호환성 확인
- ✅ 불명확한 부분은 먼저 물어보기

---

**최종 수정**: 2026-04-13
**버전**: 1.0.0
