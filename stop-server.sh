#!/bin/bash
# File: arioncomply-v1/testing/workflow-gui/stop-server.sh
# Purpose: Stop the Workflow GUI static server
# Usage: bash stop-server.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PORT=10000

echo "🛑 Stopping Workflow GUI server on port $PORT..."

if [ -f .server.pid ]; then
  PID="$(cat .server.pid || true)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    kill -9 "$PID" 2>/dev/null || true
    echo "✅ Killed PID $PID"
  fi
  rm -f .server.pid
fi

# Fallback: clean any process bound to the port
lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true

echo "✅ Server stopped (if it was running)."

