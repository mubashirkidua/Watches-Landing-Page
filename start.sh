#!/bin/bash
# The Ocean Watches — full-stack server (static site + API + admin panel)
# Serves everything on port 4173 (any host, works with *.monkeycode-ai.live preview)

PORT="${PORT:-4173}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22+ is required to run the server." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies…"
  npm install || exit 1
fi

echo "The Ocean Watches — serving at http://localhost:${PORT}"
echo "Admin panel   → http://localhost:${PORT}/admin"
echo "API health    → http://localhost:${PORT}/api/health"
exec node server/server.js
