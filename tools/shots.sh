#!/bin/sh
# Full-page screenshots of the preview at the widths the spec asks to check, with headless Chrome.
# Chrome refuses windows narrower than about 500 px, so the phone widths render inside an iframe
# of the exact width. Motion is reduced so the hero's page is on screen in the capture.
#   tools/shots.sh OUTDIR [url] [path]
set -e
OUT=${1:?outdir}; URL=${2:-http://localhost:8080}; PAGE=${3:-/}
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$OUT"
for W in 360 390 768 1024 1440 1920; do
  H=12000
  if [ "$W" -lt 500 ]; then
    FRAME="$OUT/frame$W.html"
    printf '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}iframe{display:block;border:0;width:%spx;height:%spx}</style><iframe src="%s%s"></iframe>' "$W" "$H" "$URL" "$PAGE" > "$FRAME"
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=600,$H --screenshot="$OUT/w$W.png" "file://$FRAME" 2>/dev/null
  else
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=$W,$H --screenshot="$OUT/w$W.png" "$URL$PAGE" 2>/dev/null
  fi
done
ls "$OUT"
