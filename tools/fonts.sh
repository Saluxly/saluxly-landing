#!/bin/sh
# Subsets the two typefaces to the Latin range and writes them as woff2 into assets/fonts.
# The sources are the Google Fonts files the app already bundles (OFL). Needs .venv (pip install fonttools brotli).
set -e
cd "$(dirname "$0")/.."
SRC=${FONT_SRC:-../saluxly-v2/mobile/node_modules/@expo-google-fonts}
UNICODES="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
sub() {
  .venv/bin/pyftsubset "$1" --unicodes="$UNICODES" --flavor=woff2 --layout-features='kern,liga,calt,onum,pnum,lnum,tnum' \
    --no-hinting --desubroutinize --output-file="assets/fonts/$2.woff2"
  printf '%s: %s bytes\n' "$2" "$(stat -f %z "assets/fonts/$2.woff2")"
}
sub "$SRC/newsreader/500Medium/Newsreader_500Medium.ttf" newsreader-500
sub "$SRC/newsreader/400Regular_Italic/Newsreader_400Regular_Italic.ttf" newsreader-400i
sub "$SRC/hanken-grotesk/400Regular/HankenGrotesk_400Regular.ttf" hanken-400
sub "$SRC/hanken-grotesk/500Medium/HankenGrotesk_500Medium.ttf" hanken-500
sub "$SRC/hanken-grotesk/600SemiBold/HankenGrotesk_600SemiBold.ttf" hanken-600
sub "$SRC/hanken-grotesk/700Bold/HankenGrotesk_700Bold.ttf" hanken-700
