#!/bin/bash
set -e
UA="CaughtApp/1.0 (contact@caught.app)"

dl() {
  local fn="$1" latin="$2"
  local out="public/images/fish/${fn}.jpg"
  [ -f "$out" ] && [ $(wc -c < "$out") -gt 2000 ] && echo "EXISTS: $fn" && return 0

  local title enc thumb
  title=$(curl -s --max-time 8 -H "User-Agent: $UA" \
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${latin}'))")&srnamespace=6&srlimit=5" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); [print(r['title']) for r in d.get('query',{}).get('search',[])]" 2>/dev/null | head -1)

  [ -z "$title" ] && echo "SKIP: $fn" && return 1

  enc=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$title'))")
  thumb=$(curl -s --max-time 8 -H "User-Agent: $UA" \
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${enc}&prop=imageinfo&iiprop=url|mime&iiurlwidth=400" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); [print(p.get('imageinfo',[{}])[0].get('thumburl','')) for p in d.get('query',{}).get('pages',{}).values()]" 2>/dev/null)

  [ -z "$thumb" ] && echo "FAIL: $fn (no thumb)" && return 1
  curl -sL --max-time 10 -H "User-Agent: $UA" -o "$out" "$thumb"
  [ $(wc -c < "$out") -gt 2000 ] && echo "OK: $fn ($(wc -c < "$out")b)" || echo "FAIL: $fn (small)"
}

dl "tope" "Galeorhinus galeus"
dl "whiting" "Merlangius merlangus"
dl "tiger-trout" "tiger trout"

echo "TOTAL: $(ls public/images/fish/ | wc -l)"
