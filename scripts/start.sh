#!/usr/bin/env bash
set -euo pipefail

# Start a static file server from the repo root and open the browser.
# Defaults to port 8000, override with first arg or --port/-p or PORT env var.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="${SCRIPT_DIR%/scripts}"
cd "$ROOT_DIR"

PORT_DEFAULT="8000"
PORT="${PORT:-$PORT_DEFAULT}"

if [[ $# -gt 0 ]]; then
  case "${1:-}" in
    -p|--port)
      if [[ $# -lt 2 ]]; then echo "Error: --port requires a value" >&2; exit 1; fi
      PORT="$2"; shift 2 ;;
    *)
      # If first arg looks like a number, treat as port
      if [[ "$1" =~ ^[0-9]+$ ]]; then PORT="$1"; shift; fi ;;
  esac
fi

if [[ -f .server.pid ]]; then
  PID=$(cat .server.pid || true)
  if [[ -n "${PID:-}" && -e /proc/$PID ]] || ps -p "$PID" >/dev/null 2>&1; then
    echo "Server already running (PID $PID). Use scripts/stop.sh to stop it." >&2
    exit 1
  else
    rm -f .server.pid
  fi
fi

CMD=""
if command -v python3 >/dev/null 2>&1; then
  CMD=(python3 -m http.server "$PORT" --bind 127.0.0.1)
elif command -v python >/dev/null 2>&1; then
  CMD=(python -m http.server "$PORT" --bind 127.0.0.1)
else
  echo "Error: Python is required (python3 or python)." >&2
  exit 1
fi

echo "Starting server at http://localhost:$PORT ..."
nohup "${CMD[@]}" > server.log 2>&1 &
PID=$!
echo $PID > .server.pid

# Small delay to let the server bind
sleep 0.5 || true

URL="http://localhost:$PORT"
if command -v open >/dev/null 2>&1; then
  open "$URL" || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" || true
else
  echo "Open $URL in your browser." >&2
fi

echo "Server PID $PID (log: server.log)."

