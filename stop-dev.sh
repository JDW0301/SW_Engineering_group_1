#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_RUN_DIR="$ROOT_DIR/.dev-run"
MYSQL_SOCKET="$ROOT_DIR/.local-mysql/run/mysql.sock"
MYSQL_PID_FILE="$ROOT_DIR/.local-mysql/run/mysql.pid"
SERVER_PID_FILE="$DEV_RUN_DIR/server.pid"
FRONTEND_PID_FILE="$DEV_RUN_DIR/frontend.pid"

stop_by_pid_file() {
  local label="$1"
  local pid_file="$2"

  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid"
      echo "[$label] Stopped process $pid"
    else
      echo "[$label] No running process found for PID $pid"
    fi
    rm -f "$pid_file"
  else
    echo "[$label] No PID file found"
  fi
}

stop_by_pattern() {
  local label="$1"
  local pattern="$2"
  local pids

  pids="$(pgrep -f "$pattern" || true)"
  if [[ -n "$pids" ]]; then
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      kill "$pid" >/dev/null 2>&1 || true
      echo "[$label] Stopped process $pid"
    done <<< "$pids"
  fi
}

if mysqladmin --socket="$MYSQL_SOCKET" -u root ping >/dev/null 2>&1; then
  mysqladmin --socket="$MYSQL_SOCKET" -u root shutdown
  echo "[DB] MySQL stopped"
elif [[ -f "$MYSQL_PID_FILE" ]]; then
  pid="$(cat "$MYSQL_PID_FILE")"
  if kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid"
    echo "[DB] MySQL process $pid stopped"
  fi
fi

stop_by_pid_file "SERVER" "$SERVER_PID_FILE"
stop_by_pid_file "FRONTEND" "$FRONTEND_PID_FILE"
stop_by_pattern "SERVER" "uvicorn main:app"
stop_by_pattern "FRONTEND" "vite --host 0.0.0.0"
