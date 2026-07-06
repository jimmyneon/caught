#!/bin/bash
set -e
mkdir -p public/images/water
UA="CaughtApp/1.0 (contact@caught.app)"

download_water() {
  local fn="$1"
  local query="$2"
  local outpath="public/images/water/${fn}.jpg"

  if [ -f "$outpath" ] && [ $(wc -c < "$outpath") -gt 2000 ]; then
    echo "EXISTS: $fn"
    return 0
  fi

  local title
  title=$(curl -s --max-time 8 -H "User-Agent: $UA" \
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${query}'))")&srnamespace=6&srlimit=3" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); [print(r['title']) for r in d.get('query',{}).get('search',[])]" 2>/dev/null | head -1)

  if [ -z "$title" ]; then
    echo "SKIP: $fn (no results)"
    return 1
  fi

  local encoded
  encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$title'))")

  local thumb
  thumb=$(curl -s --max-time 8 -H "User-Agent: $UA" \
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encoded}&prop=imageinfo&iiprop=url|mime&iiurlwidth=400" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); [print(p.get('imageinfo',[{}])[0].get('thumburl','')) for p in d.get('query',{}).get('pages',{}).values()]" 2>/dev/null)

  if [ -z "$thumb" ]; then
    echo "FAIL: $fn (no thumburl)"
    return 1
  fi

  curl -sL --max-time 10 -H "User-Agent: $UA" -o "$outpath" "$thumb"
  local size
  size=$(wc -c < "$outpath" 2>/dev/null || echo 0)
  if [ "$size" -gt 2000 ]; then
    echo "OK: $fn (${size} bytes)"
  else
    echo "FAIL: $fn (too small)"
    rm -f "$outpath"
  fi
}

echo "Downloading water type images..."
download_water "river" "river landscape england"
download_water "lake" "lake district landscape"
download_water "sea" "sea coast england"
download_water "canal" "canal uk waterway"
download_water "reservoir" "reservoir england landscape"

echo ""
ls -la public/images/water/ 2>&1
