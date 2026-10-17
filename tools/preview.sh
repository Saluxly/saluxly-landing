#!/bin/sh
# Local preview of saluxly.com with the waitlist form working against this Mac:
# builds the preview flavour, serves it, and restores the publishable build on exit.
#   tools/preview.sh [port]
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
node build.mjs --preview
trap 'echo; node build.mjs > /dev/null; echo "publishable build restored"' EXIT
python3 tools/preview.py "${1:-8080}"
