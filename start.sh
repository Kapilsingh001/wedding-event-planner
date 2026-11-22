#!/bin/sh
# Starts the complete project on Linux or Mac:  sh start.sh
# Runs the database API (port 3001) and the website (port 5173) together.
# Press Ctrl+C to stop both.

cd "$(dirname "$0")" || exit 1

if [ ! -d node_modules ]; then
  echo "Installing packages, this happens only the first time..."
  npm install
fi

npx json-server db.json --port 3001 &
API_PID=$!

# stop the API too when the website is stopped
trap 'kill $API_PID 2>/dev/null' EXIT INT TERM

npm run dev
