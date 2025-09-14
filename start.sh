#!/bin/bash

# --- Robust Pathing ---
# Get the directory of the script itself.
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# Assume the project root is the parent of the directory containing this script.
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
# Change to the project root to ensure all commands run from the correct context.
cd "$PROJECT_ROOT" || exit

# Default values
DEFAULT_PORT=11000
PID_FILE=".server.pid"
LOG_FILE="server.log"
TEST_MODE=false

# --- Argument Parsing ---
# This loop handles flags like --test and --port, and also positional arguments.
while [[ $# -gt 0 ]]; do
  case $1 in
    test|--test)
      TEST_MODE=true
      shift # past argument
      ;;
    --port)
      PORT="$2"
      shift # past argument
      shift # past value
      ;;
    *)
      # Assume it's a positional argument for the port
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        PORT="$1"
      fi
      shift # past argument
      ;;
  esac
done

# Use environment variable PORT if set, otherwise use parsed port, otherwise default.
PORT=${PORT:-${LIVE_LONG_PORT:-$DEFAULT_PORT}}

# --- Pre-flight Checks ---
# Check if server is already running
if [ -f "$PID_FILE" ]; then
  echo "Server is already running with PID $(cat $PID_FILE). Please run ./scripts/stop.sh first."
  exit 1
fi

# Check for Python 3
if ! command -v python3 &> /dev/null; then
  echo "Error: python3 is not installed or not in your PATH."
  exit 1
fi

# --- Start Server ---
echo "Starting server on http://127.0.0.1:$PORT..."
python3 -m http.server -b 127.0.0.1 "$PORT" &> "$LOG_FILE" &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"
echo "Server started with PID $SERVER_PID. Logs are in $LOG_FILE."

# --- Execute Mode ---
if [ "$TEST_MODE" = true ]; then
  echo "Running Playwright tests..."
  # Wait a moment for the server to be ready
  sleep 1

  # Run tests and capture exit code
  npx playwright test
  PLAYWRIGHT_EXIT_CODE=$?

  echo "Tests finished. Stopping server..."
  # Now that we are in the project root, this relative path will always work
  scripts/stop.sh

  # Exit with the same code as Playwright
  exit $PLAYWRIGHT_EXIT_CODE
else
  echo "Opening browser..."
  # Open the browser (cross-platform)
  case "$(uname -s)" in
    Linux*)   xdg-open "http://127.0.0.1:$PORT" ;;
    Darwin*)  open "http://127.0.0.1:$PORT" ;;
    CYGWIN*|MINGW*|MSYS*) start "http://127.0.0.1:$PORT" ;;
    *)        echo "Could not detect OS to open browser. Please navigate to http://127.0.0.1:$PORT manually." ;;
  esac
fi