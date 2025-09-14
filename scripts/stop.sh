#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="${SCRIPT_DIR%/scripts}"
cd "$ROOT_DIR"

if [[ ! -f .server.pid ]]; then
  echo "No PID file found. Is the server running?" >&2
  exit 1
fi

PID=$(cat .server.pid || true)
if [[ -z "${PID:-}" ]]; then
  echo "PID file is empty. Removing stale file." >&2
  rm -f .server.pid
  exit 1
fi

if ps -p "$PID" >/dev/null 2>&1; then
  echo "Stopping server PID $PID ..."
  kill "$PID" || true
  # Wait briefly, then force if needed
  for i in 1 2 3 4 5; do
    if ps -p "$PID" >/dev/null 2>&1; then sleep 0.2; else break; fi
  done
  if ps -p "$PID" >/dev/null 2>&1; then
    echo "Force killing PID $PID ..."
    kill -9 "$PID" || true
  fi
else
  echo "No running process with PID $PID. Removing stale PID file."
fi

rm -f .server.pid
echo "Server stopped."

