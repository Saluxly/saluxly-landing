#!/bin/sh
# Local preview of saluxly.com: builds and serves the site on this Mac.
#   tools/preview.sh [port]
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
node build.mjs
python3 tools/preview.py "${1:-8080}"
