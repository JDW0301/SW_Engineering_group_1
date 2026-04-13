#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_RUN_DIR="$ROOT_DIR/.dev-run"
MYSQL_DATA_DIR="$ROOT_DIR/.local-mysql/data"
MYSQL_RUN_DIR="$ROOT_DIR/.local-mysql/run"
MYSQL_SOCKET="$MYSQL_RUN_DIR/mysql.sock"
MYSQL_PID_FILE="$MYSQL_RUN_DIR/mysql.pid"
MYSQL_ERR_LOG="$MYSQL_RUN_DIR/mysql.err"
MYSQL_OUT_LOG="$MYSQL_RUN_DIR/mysql.out"
DB_NAME="swe_helpdesk"

SERVER_DIR="$ROOT_DIR/server"
SERVER_ENV_FILE="$SERVER_DIR/.env"
SERVER_ENV_EXAMPLE_FILE="$SERVER_DIR/.env.example"
SERVER_PYDEPS_DIR="$SERVER_DIR/.pydeps"
SERVER_REQUIREMENTS_FILE="$SERVER_DIR/requirements.txt"
SERVER_PID_FILE="$DEV_RUN_DIR/server.pid"
SERVER_LOG_FILE="$DEV_RUN_DIR/server.log"

FRONTEND_DIR="$ROOT_DIR/code"
FRONTEND_PID_FILE="$DEV_RUN_DIR/frontend.pid"
FRONTEND_LOG_FILE="$DEV_RUN_DIR/frontend.log"

mkdir -p "$DEV_RUN_DIR" "$MYSQL_DATA_DIR" "$MYSQL_RUN_DIR"

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name"
    exit 1
  fi
}

ensure_prerequisites() {
  require_command node
  require_command npm
  require_command python3
  require_command mysqld
  require_command mysql
  require_command mysqladmin
  require_command curl
}

ensure_server_env() {
  if [[ ! -f "$SERVER_ENV_FILE" ]]; then
    cp "$SERVER_ENV_EXAMPLE_FILE" "$SERVER_ENV_FILE"
    python3 - <<'PY' "$SERVER_ENV_FILE"
from pathlib import Path
import secrets
import sys
env_path = Path(sys.argv[1])
content = env_path.read_text()
replacements = {
    'DB_PORT=3306': 'DB_PORT=3307',
    'DB_PASSWORD=password': 'DB_PASSWORD=',
    'JWT_ACCESS_SECRET=change-this-access-secret': f'JWT_ACCESS_SECRET={secrets.token_urlsafe(32)}',
    'JWT_REFRESH_SECRET=change-this-refresh-secret': f'JWT_REFRESH_SECRET={secrets.token_urlsafe(32)}',
}
for old, new in replacements.items():
    content = content.replace(old, new)
env_path.write_text(content)
PY
    echo "[SERVER] Created server/.env for local development."
  fi
}

ensure_dependencies() {
  if ! python3 -m pip --version >/dev/null 2>&1; then
    echo "[SERVER] Bootstrapping pip..."
    curl -fsSL https://bootstrap.pypa.io/get-pip.py -o "$DEV_RUN_DIR/get-pip.py"
    python3 "$DEV_RUN_DIR/get-pip.py" --user --break-system-packages >/dev/null
  fi

  if [[ ! -f "$SERVER_PYDEPS_DIR/.deps-installed" ]]; then
    echo "[SERVER] Installing backend Python dependencies..."
    mkdir -p "$SERVER_PYDEPS_DIR"
    python3 -m pip install --user --upgrade pip --break-system-packages >/dev/null
    python3 -m pip install --target "$SERVER_PYDEPS_DIR" -r "$SERVER_REQUIREMENTS_FILE" --break-system-packages
    touch "$SERVER_PYDEPS_DIR/.deps-installed"
  fi

  if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    echo "[FRONTEND] Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install)
  fi
}

initialize_mysql_data_dir() {
  if [[ -d "$MYSQL_DATA_DIR/mysql" ]]; then
    return
  fi

  echo "[DB] Initializing local MySQL data directory..."
  mysqld --no-defaults --initialize-insecure --datadir="$MYSQL_DATA_DIR" --basedir=/usr >/dev/null 2>&1
}

wait_for_mysql() {
  local retries=30
  while (( retries > 0 )); do
    if mysqladmin --socket="$MYSQL_SOCKET" -u root ping >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
    retries=$((retries - 1))
  done

  return 1
}

wait_for_server() {
  local retries=30
  while (( retries > 0 )); do
    if curl -s http://127.0.0.1:4000/api/health >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
    retries=$((retries - 1))
  done

  return 1
}

get_frontend_url() {
  if [[ ! -f "$FRONTEND_LOG_FILE" ]]; then
    return 1
  fi

  python3 - <<'PY' "$FRONTEND_LOG_FILE"
from pathlib import Path
import re
import sys

log_path = Path(sys.argv[1])
content = log_path.read_text(errors="ignore")
match = re.search(r"Local:\s+(http://[^\s]+)", content)
if match:
    print(match.group(1))
PY
}

wait_for_frontend_url() {
  local retries=20
  while (( retries > 0 )); do
    local frontend_url
    frontend_url="$(get_frontend_url || true)"
    if [[ -n "$frontend_url" ]]; then
      echo "$frontend_url"
      return 0
    fi
    sleep 1
    retries=$((retries - 1))
  done

  return 1
}

is_frontend_running() {
  pgrep -f "vite --host 0.0.0.0" >/dev/null 2>&1
}

start_mysql() {
  initialize_mysql_data_dir

  if mysqladmin --socket="$MYSQL_SOCKET" -u root ping >/dev/null 2>&1; then
    echo "[DB] MySQL is already running."
  else
    echo "[DB] Starting local MySQL..."
    nohup mysqld --no-defaults \
      --datadir="$MYSQL_DATA_DIR" \
      --socket="$MYSQL_SOCKET" \
      --port=3307 \
      --bind-address=127.0.0.1 \
      --pid-file="$MYSQL_PID_FILE" \
      --log-error="$MYSQL_ERR_LOG" \
      > "$MYSQL_OUT_LOG" 2>&1 &

    if ! wait_for_mysql; then
      echo "[DB] Failed to start MySQL. Check $MYSQL_ERR_LOG"
      exit 1
    fi
  fi

  echo "[DB] Ensuring database and schema exist..."
  mysql --socket="$MYSQL_SOCKET" -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql --socket="$MYSQL_SOCKET" -u root "$DB_NAME" < "$SERVER_DIR/sql/schema.sql"
  mysql --socket="$MYSQL_SOCKET" -u root "$DB_NAME" -e "SHOW COLUMNS FROM app_user LIKE 'email';" >/dev/null 2>&1 || mysql --socket="$MYSQL_SOCKET" -u root "$DB_NAME" -e "ALTER TABLE app_user ADD COLUMN email VARCHAR(255) NULL AFTER login_id;"
  mysql --socket="$MYSQL_SOCKET" -u root "$DB_NAME" -e "UPDATE app_user SET email = CONCAT(login_id, '@example.com') WHERE email IS NULL OR email = '';"
  mysql --socket="$MYSQL_SOCKET" -u root "$DB_NAME" -e "ALTER TABLE app_user MODIFY COLUMN email VARCHAR(255) NOT NULL;"
  mysql --socket="$MYSQL_SOCKET" -u root "$DB_NAME" -e "SHOW INDEX FROM app_user WHERE Key_name = 'uk_app_user_email';" | grep -q uk_app_user_email || mysql --socket="$MYSQL_SOCKET" -u root "$DB_NAME" -e "ALTER TABLE app_user ADD UNIQUE INDEX uk_app_user_email (email);"
}

start_server() {
  if curl -s http://127.0.0.1:4000/api/health >/dev/null 2>&1; then
    echo "[SERVER] Backend is already running on http://localhost:4000"
    return
  fi

  echo "[SERVER] Starting backend..."
  (
    cd "$SERVER_DIR"
    nohup env PYTHONPATH="$SERVER_PYDEPS_DIR:$SERVER_DIR" python3 -m uvicorn main:app --host 0.0.0.0 --port 4000 > "$SERVER_LOG_FILE" 2>&1 &
    echo $! > "$SERVER_PID_FILE"
  )

  if ! wait_for_server; then
    echo "[SERVER] Failed to start backend. Check $SERVER_LOG_FILE"
    exit 1
  fi

  echo "[SERVER] Backend started at http://localhost:4000"
}

start_frontend() {
  if is_frontend_running; then
    local frontend_url
    frontend_url="$(get_frontend_url || true)"
    if [[ -n "$frontend_url" ]]; then
      echo "[FRONTEND] Frontend is already running at $frontend_url"
    else
      echo "[FRONTEND] Frontend is already running. Check $FRONTEND_LOG_FILE for the active port."
    fi
    return
  fi

  echo "[FRONTEND] Starting frontend..."
  (
    cd "$FRONTEND_DIR"
    nohup npm run dev -- --host 0.0.0.0 > "$FRONTEND_LOG_FILE" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
  )

  local frontend_url
  frontend_url="$(wait_for_frontend_url || true)"
  if [[ -n "$frontend_url" ]]; then
    echo "[FRONTEND] Frontend started at $frontend_url"
  else
    echo "[FRONTEND] Frontend started. Check $FRONTEND_LOG_FILE for the active port."
  fi
}

ensure_prerequisites
ensure_server_env
ensure_dependencies
start_mysql
start_server
start_frontend

echo
echo "Done."
echo "- DB socket: $MYSQL_SOCKET"
echo "- Backend:   http://localhost:4000/api/health"
frontend_url="$(get_frontend_url || true)"
if [[ -n "$frontend_url" ]]; then
  echo "- Frontend:  $frontend_url"
else
  echo "- Frontend:  check $FRONTEND_LOG_FILE for the current Vite port"
fi
