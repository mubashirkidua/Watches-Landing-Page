#!/bin/bash
# The Ocean Watches — static site server
# Serves the site on port 4173 (any host, works with *.monkeycode-ai.live preview)

PORT="${PORT:-4173}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT" || exit 1

echo "The Ocean Watches — serving at http://localhost:${PORT}"
python3 -m http.server "${PORT}" --bind 0.0.0.0
