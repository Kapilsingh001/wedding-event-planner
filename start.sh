#!/usr/bin/env bash

# Starts the Vite frontend and the local JSON Server API together.
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js (which includes npm) and try again." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing project dependencies..."
  npm ci
fi

cleanup() {
  echo
  echo "Stopping Wedding Event Planner services..."
  kill "$api_pid" "$web_pid" 2>/dev/null || true
  wait "$api_pid" "$web_pid" 2>/dev/null || true
}

echo "Starting API at http://localhost:3001..."
npm run server &
api_pid=$!

echo "Starting website at http://localhost:5173..."
npm run dev -- --host 127.0.0.1 &
web_pid=$!

trap cleanup INT TERM EXIT
wait "$api_pid" "$web_pid"
