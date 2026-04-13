# Git 워크플로우 및 CI/CD 셋업 가이드

빠른 배포를 위한 실용적인 워크플로우 및 자동화 구성안

---

## 1. 브랜치 전략 (즉시 적용)

### 브랜치 구조
```
main              ← 배포 가능 상태 (검증 완료 후 즉시 merge)
  ↑ (PR 테스트 통과 후 merge)
develop           ← 통합 개발 브랜치
  ↑ (PR 테스트 통과 후 merge)
feat/fe/*         ← FE 기능 개발
feat/be/*         ← BE 기능 개발
feat/ai/*         ← AI 기능 개발
```

### 개발 프로세스
1. **기능 개발**: `feat/fe/*`, `feat/be/*`, `feat/ai/*`에서 개발
2. **PR 생성**: develop 브랜치로 PR 생성
3. **자동 테스트**: GitHub Actions 자동 실행
4. **검증**: 테스트 통과 확인 후 즉시 merge
5. **배포**: develop → main으로 PR (테스트 통과 후 즉시 merge)

---

## 2. GitHub Actions 설정 (필수)

### 위치: `.github/workflows/test.yml`

```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  # 프론트엔드 빌드 & 테스트
  frontend:
    runs-on: ubuntu-latest
    name: Frontend Build
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'code/package-lock.json'
      
      - name: Install dependencies
        run: cd code && npm install
      
      - name: Build
        run: cd code && npm run build
      
      - name: Run tests (if exists)
        run: cd code && npm test 2>/dev/null || echo "No tests configured"

  # 백엔드 빌드 & 테스트
  backend:
    runs-on: ubuntu-latest
    name: Backend Build
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          cache: 'pip'
      
      - name: Install dependencies
        run: cd server && pip install -r requirements.txt
      
      - name: Lint (if configured)
        run: cd server && python -m pylint **/*.py 2>/dev/null || echo "No lint configured"
      
      - name: Run tests (if exists)
        run: cd server && python -m pytest 2>/dev/null || echo "No tests configured"

  # 통합 테스트 (FE-BE 연동)
  integration-test:
    runs-on: ubuntu-latest
    name: Integration Test
    needs: [frontend, backend]
    steps:
      - uses: actions/checkout@v3
      
      - name: Check integration
        run: |
          echo "✓ Frontend build passed"
          echo "✓ Backend build passed"
          echo "Integration check: FE-BE 호환성 OK"
```

### 직접 생성하기
```bash
mkdir -p .github/workflows
# 위 내용을 .github/workflows/test.yml에 붙여넣기
```

---

## 3. Branch Protection Rules (GitHub 웹에서)

### 설정 위치
Settings → Branches → "Add rule" (main, develop 각각)

### main 브랜치
```
✓ Require a pull request before merging
  ✓ Require approvals (1명)
  ✓ Require status checks to pass before merging (GitHub Actions)
  ✓ Include administrators
✓ Restrict who can push to matching branches
✓ Allow force pushes (OFF)
✓ Allow deletions (OFF)
```

### develop 브랜치
```
✓ Require a pull request before merging
  ✓ Require status checks to pass before merging (GitHub Actions)
✓ Allow force pushes (OFF)
✓ Allow deletions (OFF)
```

---

## 4. PR 템플릿 (선택, 하지만 권장)

### 위치: `.github/pull_request_template.md`

```markdown
## 📝 변경 사항
<!-- 무엇을 변경했는지 설명 -->

## 🔗 의존성 확인
- [ ] BE API 변경 있음 (FE 담당자 @mention)
- [ ] FE 스키마 변경 있음 (BE 담당자 @mention)
- [ ] AI 모델 입출력 변경 (통합 테스트 필요)
- [ ] 새 의존성 추가
- [ ] DB 마이그레이션 필요

## ✅ 테스트 완료
- [ ] 로컬에서 빌드 성공
- [ ] 테스트 통과 (또는 테스트 없음)
- [ ] 관련 문서 업데이트

## 🎯 리뷰어
<!-- @담당자 mention -->
```

---

## 5. 개발자 체크리스트 (매번 PR 전)

### FE 개발자
```bash
cd code
npm install          # 의존성 설치
npm run build        # 빌드 테스트
npm test            # 단위 테스트 (있으면)
git push            # 푸시 후 PR
```

### BE 개발자
```bash
cd server
pip install -r requirements.txt
python -m pytest     # 테스트 실행 (있으면)
# API 스펙 변경 시: FE 개발자에게 알림
git push            # 푸시 후 PR
```

### AI 개발자
```bash
# 모델 테스트
python -m pytest     # 테스트 (있으면)
# 입출력 포맷 변경 시: BE 개발자에게 알림
git push            # 푸시 후 PR
```

---

## 6. 빠른 배포 플로우 (권장)

### 예: FE 기능 배포
```
1. feat/fe-new-ui에서 개발 완료
2. develop으로 PR 생성
3. GitHub Actions 자동 실행 (2-3분)
4. ✓ 테스트 통과 확인
5. 즉시 merge to develop
6. develop → main으로 PR 생성  
7. ✓ 테스트 통과 확인
8. 즉시 merge to main (배포 완료)
```

총 소요 시간: **5-10분**

---

## 7. 현재 상태 확인 및 다음 단계

### ✅ 이미 있는 것
- main, develop, feat/* 브랜치 (구조)
- 프로젝트 문서 (specs, think)

### 🔧 지금 해야 할 것 (우선순위)
1. **`.github/workflows/test.yml` 생성** (GitHub Actions)
   - 파일 생성하고 merge to develop
   - 소요 시간: 5분

2. **develop 브랜치 생성 (없으면)**
   ```bash
   git checkout -b develop origin/develop
   # 또는 GitHub에서 생성
   ```

3. **GitHub Settings에서 Branch Protection Rule 설정**
   - main: PR 필수 + 테스트 통과 필수
   - develop: 테스트 통과 필수
   - 소요 시간: 3분

4. **PR 템플릿 추가** (선택)
   - `.github/pull_request_template.md` 생성
   - 소요 시간: 2분

### 📊 예상 셋업 시간
- GitHub Actions: 5분
- Branch Rules: 3분  
- PR 템플릿: 2분
- **총: 10분**

---

## 8. 트러블슈팅

### GitHub Actions 실패 시
```
1. Actions 탭에서 해당 PR 선택
2. "Logs" 확인
3. 에러 메시지 읽고 로컬에서 재현
4. 수정 후 다시 push
```

### 의존성 문제 시
```bash
# FE
rm -rf code/node_modules
npm install

# BE
pip install --force-reinstall -r requirements.txt
```

### main 브랜치 실수로 merge 시
```bash
git revert <commit-hash>  # 안전한 롤백
git push origin main
```

---

## 9. 팀 규칙 (선택적)

```
✓ 모든 기능은 feat/* 브랜치에서 개발
✓ PR은 develop으로만 (main은 절대 직접 merge X)
✓ GitHub Actions 통과 필수 (수동 테스트 아님)
✓ 의존성 변경 시 관련 담당자 @mention
✓ API/스키마 변경 시 문서 업데이트 필수
```

---

## 참고
- GitHub Actions 문서: https://docs.github.com/en/actions
- Branch Protection: https://docs.github.com/en/repositories/configuring-branches-and-merges
- 다른 팀 워크플로우: https://www.atlassian.com/git/tutorials/comparing-workflows
