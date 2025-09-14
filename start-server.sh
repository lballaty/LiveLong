#!/bin/bash
# File: arioncomply-v1/testing/workflow-gui/start-server.sh
# Purpose: Start a simple static server for the Workflow GUI and open browser
# Usage: bash start-server.sh [PORT] | [-p PORT] | with PORT env var

set -euo pipefail

# Always run from this script's directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Default port (can be overridden by args or PORT env var)
PORT_DEFAULT=11000
PORT=${PORT:-$PORT_DEFAULT}

# Parse optional CLI args
if [[ $# -gt 0 ]]; then
  case "$1" in
    -p|--port)
      if [[ -z "${2:-}" ]]; then
        echo "❌ Missing value for --port"; exit 2
      fi
      PORT="$2"; shift 2 ;;
    *)
      # If first arg is a number, treat as port
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        PORT="$1"; shift 1
      fi ;;
  esac
fi

echo "🌐 Starting Workflow GUI web server on port $PORT..."

# Basic checks
if [ ! -f "index.html" ]; then
  echo "❌ index.html not found in $(pwd)"
  exit 1
fi

echo "🧹 Checking for any server already on port $PORT..."
lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true

echo "🚀 Launching python http.server on http://localhost:$PORT ..."
python3 -m http.server "$PORT" > server.log 2>&1 &
SERVER_PID=$!

# Give it a moment to start
sleep 2

# Verify server
if ! curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
  echo "❌ Failed to start web server on port $PORT"
  kill -9 "$SERVER_PID" 2>/dev/null || true
  exit 1
fi

# Save PID for stop script
echo "$SERVER_PID" > .server.pid

# Open default browser
URL="http://localhost:$PORT"
if command -v open >/dev/null 2>&1; then
  echo "🌐 Opening browser via 'open'..."
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  echo "🌐 Opening browser via 'xdg-open'..."
  xdg-open "$URL" >/dev/null 2>&1 || true
else
  echo "ℹ️ Please open your browser to: $URL"
fi

echo ""
echo "✅ Workflow GUI running at $URL"
echo "💡 To stop: bash ./stop-server.sh"
echo ""
