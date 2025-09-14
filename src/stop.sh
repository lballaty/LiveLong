#!/bin/bash

PID_FILE=".server.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "Server is not running (no PID file found)."
  exit 0
fi

PID=$(cat "$PID_FILE")
echo "Stopping server with PID $PID..."

# Kill the process
if kill "$PID" 2>/dev/null; then
  echo "Server stopped."
else
  echo "Failed to stop server. It may have already been stopped."
fi

# Clean up
rm -f "$PID_FILE"