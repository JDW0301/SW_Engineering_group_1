/home/donguk/project2/SW_Engineering_group_1 해당 경로 안에서 md파일들을 읽고 DB와 서버, 클라이언트를 실행하는 방법에 대해 알려주어라# Server

Auth-first FastAPI server for the HelpDesk project.

## 1. Setup

```bash
cd server
cp .env.example .env
python3 -m pip install --target .pydeps -r requirements.txt
```

Create the MySQL database first, then run:

```bash
mysql -u root -p swe_helpdesk < sql/schema.sql
```

## 2. Run

```bash
PYTHONPATH="$(pwd)/.pydeps:$(pwd)" python3 -m uvicorn main:app --host 0.0.0.0 --port 4000
```

Default server URL:

- `http://localhost:4000`

## 2.1 Current FE/BE development wiring

For the current shared development and demo check environment, align the frontend API proxy with the backend that owns the active data:

```text
Browser
-> Frontend preview: 8125
-> /api proxy target: Backend 4010
-> Shared MySQL DB used by that backend
```

The frontend port is only the entry point for loading the screen. The visible data depends on which backend and database the frontend's `/api` requests reach. If two frontend ports point to different backend ports, the same account can show different data.

Before demo or team testing, confirm these values with the backend owner:

- Backend port: `4010`
- Database connected by that backend: final shared project DB
- Frontend `/api` proxy target: `http://127.0.0.1:4010`

## 3. Auth endpoints

- `POST /api/auth/signup/customer`
- `POST /api/auth/signup/operator`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
