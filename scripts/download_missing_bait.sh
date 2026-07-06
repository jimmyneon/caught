#!/bin/bash
mkdir -p public/images/bait
UA="CaughtApp/1.0 (contact@caught.app)"

dl() {
  local fn="$1" query="$2"
  local out="public/images/bait/${fn}.jpg"
  [ -f "$out" ] && [ $(wc -c < "$out") -gt 2000 ] && echo "EXISTS: $fn" && return 0

  local all_titles
  all_titles=$(curl -s --max-time 8 -H "User-Agent: $UA" \
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${query}'))")&srnamespace=6&srlimit=5" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); [print(r['title']) for r in d.get('query',{}).get('search',[])]" 2>/dev/null)

  if [ -z "$all_titles" ]; then
    echo "SKIP: $fn (no results)"
    return 1
  fi

  local found=0
  while IFS= read -r title; do
    [ -z "$title" ] && continue
    local enc
    enc=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$title")

    local info thumb mime
    info=$(curl -s --max-time 8 -H "User-Agent: $UA" \
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${enc}&prop=imageinfo&iiprop=url|mime&iiurlwidth=400")
    thumb=$(echo "$info" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(p.get('imageinfo',[{}])[0].get('thumburl','')) for p in d.get('query',{}).get('pages',{}).values()]" 2>/dev/null)
    mime=$(echo "$info" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(p.get('imageinfo',[{}])[0].get('mime','')) for p in d.get('query',{}).get('pages',{}).values()]" 2>/dev/null)

    [ -z "$thumb" ] && continue
    if [[ "$mime" != "image/jpeg" && "$mime" != "image/png" ]]; then continue; fi

    curl -sL --max-time 10 -H "User-Agent: $UA" -o "$out" "$thumb"
    if [ $(wc -c < "$out") -gt 2000 ]; then
      echo "OK: $fn ($(wc -c < "$out")b)"
      found=1
      break
    fi
  done <<< "$all_titles"

  if [ "$found" -eq 0 ]; then
    echo "FAIL: $fn"
    rm -f "$out"
  fi
}

echo "=== Retry missing bait images with better queries ==="
dl "worm" "earthworm bait"
dl "boilie" "carp boilie"
dl "sweetcorn" "corn kernels"
dl "bread" "bread slice"
dl "pellet" "fish pellets"
dl "cheese" "cheese block"
dl "mayfly" "mayfly insect"
dl "midge" "midge insect"
dl "ragworm" "polychaete worm"
dl "crab-bait" "crustacean crab"
dl "deadbait" "dead fish bait pike"
dl "popper-fly" "popper fishing"
dl "pole-float" "pole fishing"
dl "ledger" "fishing weight sinker"
dl "feeder" "fishing cage feeder"
dl "bomb" "fishing lead weight"
dl "pva-bag" "pva fishing"
dl "casters" "maggot caster fishing"
dl "hemp" "hemp seed"
dl "paste" "fishing paste bait"
dl "particles" "fishing particles bait"
dl "controller-float" "fishing controller float"
dl "link-ledger" "fishing link ledger"
dl "helicopter-rig" "fishing helicopter rig"
dl "sand-eel-bait" "sand eel fish"
dl "fake-bait" "artificial fishing bait"
dl "freelining" "free line fishing"
dl "surface-bait" "surface fishing bait"
dl "dexter-wedge" "fishing wedge lure"
dl "bass-jig" "bass fishing jig"
dl "buzzard-fly" "buzzard fishing fly"
dl "cormorant-fly" "cormorant fishing fly"
dl "cats-whisker" "cat whisker fly"
dl "mepps" "mepps fishing"
dl "tares" "tare seed"
dl "luncheon-meat" "spam luncheon meat"

echo ""
echo "Bait images: $(ls public/images/bait/ | wc -l)"
