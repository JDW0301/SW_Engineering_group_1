# SW_Engineering_group_1

소규모 판매자를 위한 고객지원 플랫폼 프로젝트입니다.

- 프론트엔드: React + Vite
- 백엔드: FastAPI
- DB: MySQL

## 1. 프로젝트 구조

```text
SW_Engineering_group_1/
├─ code/        # 프론트엔드
├─ server/      # 백엔드
├─ specs/       # 명세 문서
├─ think/       # 기획/정리 문서
└─ data/        # 참고 데이터
```

## 2. 처음 실행하는 사람 기준 빠른 시작

저장소를 clone한 뒤 프로젝트 루트에서 아래 한 줄만 실행하면 됩니다.

```bash
./start-dev.sh
```

이 스크립트가 자동으로 처리하는 일:

1. 필수 명령어 확인
2. `server/.env` 생성
3. 프론트 `node_modules` 설치
4. 서버 Python 패키지 설치
5. 로컬 MySQL 데이터 디렉토리 초기화
6. DB 실행 및 스키마 반영
7. 서버 실행
8. 프론트 실행

종료:

```bash
./stop-dev.sh
```

프론트 접속 주소는 보통 아래입니다.

```text
http://localhost:5173
```

포트가 이미 사용 중이면 `5174`, `5175`처럼 자동 변경될 수 있습니다. 실제 포트는 `.dev-run/frontend.log`에서 확인할 수 있습니다.

## 3. 실행 전 준비

### WSL 사용 시 주의

이 프로젝트는 WSL에서 실행할 경우 **Linux용 Node.js**를 사용하는 것을 권장합니다.

Windows Node가 WSL 경로를 직접 읽으면 Vite가 잘못된 디렉토리를 서빙해서 `404` 또는 무한 로딩이 발생할 수 있습니다.

### WSL용 Node 설치

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

node -v
npm -v
which node
which npm
```

`which node` 결과가 `/home/.../.nvm/...` 형태면 정상입니다.

## 4. 의존성 수동 설치

### 프론트엔드

```bash
cd code
npm install
```

### 백엔드

```bash
cd server
python3 -m pip install --target .pydeps -r requirements.txt
```

## 5. DB 수동 실행

이 프로젝트는 로컬 MySQL 인스턴스를 프로젝트 내부의 `.local-mysql/` 아래에서 실행하도록 구성했습니다.

### DB 시작

```bash
nohup mysqld --no-defaults \
  --datadir="$(pwd)/.local-mysql/data" \
  --socket="$(pwd)/.local-mysql/run/mysql.sock" \
  --port=3307 \
  --bind-address=127.0.0.1 \
  --pid-file="$(pwd)/.local-mysql/run/mysql.pid" \
  --log-error="$(pwd)/.local-mysql/run/mysql.err" \
  > "$(pwd)/.local-mysql/run/mysql.out" 2>&1 &
```

### DB 확인

```bash
mysqladmin --socket="$(pwd)/.local-mysql/run/mysql.sock" -u root ping
```

정상 응답:

```bash
mysqld is alive
```

### DB 접속

```bash
mysql --socket="$(pwd)/.local-mysql/run/mysql.sock" -u root swe_helpdesk
```

## 6. 서버 수동 실행

```bash
cd server
PYTHONPATH="$(pwd)/.pydeps:$(pwd)" python3 -m uvicorn main:app --host 0.0.0.0 --port 4000
```

정상 실행 시:

```bash
Server running on port 4000
```

헬스 체크:

```bash
http://localhost:4000/api/health
```

정상 응답:

```json
{"message":"ok"}
```

## 7. 프론트엔드 수동 실행

```bash
cd code
npm run dev -- --host 0.0.0.0
```

정상 실행 시 예시:

```bash
Local:   http://localhost:5173/
```

브라우저 접속:

```text
http://localhost:5173
```

포트가 이미 사용 중이면 `5174`, `5175`처럼 자동 변경될 수 있습니다.

## 8. 테스트 계정

### 고객 계정

- 아이디: `customer01`
- 이메일: `customer01@example.com`
- 비밀번호: `1234`

### 운영자 계정

- 아이디: `operator01`
- 이메일: `operator01@example.com`
- 비밀번호: `1234`

## 9. 실행 순서 요약

### 자동 실행 스크립트

루트 디렉토리에서 아래 스크립트를 실행하면 됩니다.

```bash
./start-dev.sh
```

종료:

```bash
./stop-dev.sh
```

`start-dev.sh`는 아래 순서로 자동 실행합니다.

1. DB 실행
2. 서버 실행
3. 프론트 실행

프론트 포트는 Vite가 자동으로 잡기 때문에, 실제 접속 포트는 `.dev-run/frontend.log`에서 확인할 수 있습니다.

### 터미널 1: DB

```bash
nohup mysqld --no-defaults \
  --datadir="$(pwd)/.local-mysql/data" \
  --socket="$(pwd)/.local-mysql/run/mysql.sock" \
  --port=3307 \
  --bind-address=127.0.0.1 \
  --pid-file="$(pwd)/.local-mysql/run/mysql.pid" \
  --log-error="$(pwd)/.local-mysql/run/mysql.err" \
  > "$(pwd)/.local-mysql/run/mysql.out" 2>&1 &
```

### 터미널 2: 서버

```bash
cd server
PYTHONPATH="$(pwd)/.pydeps:$(pwd)" python3 -m uvicorn main:app --host 0.0.0.0 --port 4000
```

### 터미널 3: 프론트

```bash
cd code
npm run dev -- --host 0.0.0.0
```

## 10. 종료 방법

### DB 종료

```bash
mysqladmin --socket="$(pwd)/.local-mysql/run/mysql.sock" -u root shutdown
```

### 서버 종료

실행 중인 터미널에서 `Ctrl + C`

### 프론트 종료

실행 중인 터미널에서 `Ctrl + C`

## 11. 참고

- 백엔드 기준으로 회원가입 / 로그인 / 토큰 발급 / `/api/auth/me` 동작 확인 완료
- 운영자 회원가입 시 `store` 테이블도 함께 생성되도록 구현됨
