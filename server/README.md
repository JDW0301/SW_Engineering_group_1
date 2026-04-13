# Server

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

## 3. Auth endpoints

- `POST /api/auth/signup/customer`
- `POST /api/auth/signup/operator`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
