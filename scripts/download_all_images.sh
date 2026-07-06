#!/bin/bash
mkdir -p public/images/water public/images/bait
UA="CaughtApp/1.0 (contact@caught.app)"

dl() {
  local fn="$1" query="$2" dir="$3"
  local out="public/images/${dir}/${fn}.jpg"
  [ -f "$out" ] && [ $(wc -c < "$out") -gt 2000 ] && echo "EXISTS: $fn" && return 0

  local title enc thumb mime
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
    enc=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$title")

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
    return 1
  fi
}

echo "=== Water types ==="
dl "pond" "fishing pond england" "water"
dl "stream" "stream brook countryside" "water"
dl "estuary" "estuary coast england" "water"
dl "stillwater" "stillwater lake fishing" "water"
dl "loch" "loch scotland landscape" "water"

echo ""
echo "=== Bait/method types ==="
dl "spinner" "fishing spinner lure" "bait"
dl "plug" "fishing plug lure" "bait"
dl "crankbait" "crankbait fishing lure" "bait"
dl "jerkbait" "jerkbait fishing lure" "bait"
dl "soft-plastic" "soft plastic fishing lure" "bait"
dl "jig" "fishing jig lure" "bait"
dl "swimbait" "swimbait fishing lure" "bait"
dl "spoon" "fishing spoon lure" "bait"
dl "rapala" "rapala fishing lure" "bait"
dl "mepps" "mepps spinner lure" "bait"
dl "abu-garcia" "abu garcia fishing lure" "bait"
dl "dexter-wedge" "dexter wedge lure" "bait"
dl "bass-jig" "bass jig fishing" "bait"
dl "surface-lure" "topwater fishing lure" "bait"
dl "vibration-lure" "vibration lure fishing" "bait"
dl "dry-fly" "dry fly fishing fly" "bait"
dl "nymph" "nymph fly fishing" "bait"
dl "wet-fly" "wet fly fishing" "bait"
dl "streamer" "streamer fly fishing" "bait"
dl "emerger" "emerger fly fishing" "bait"
dl "popper-fly" "popper fly fishing" "bait"
dl "lure-fly" "lure fly trout" "bait"
dl "buzzard-fly" "buzzard fly fishing" "bait"
dl "cormorant-fly" "cormorant fly fishing" "bait"
dl "diawl-bach" "diawl bach fly" "bait"
dl "cats-whisker" "cats whisker fly fishing" "bait"
dl "olive-fly" "olive fly fishing" "bait"
dl "caddis" "caddis fly fishing" "bait"
dl "mayfly" "mayfly fly fishing" "bait"
dl "midge" "midge fly fishing" "bait"
dl "egg-fly" "egg fly fishing" "bait"
dl "salmon-fly" "salmon fly fishing" "bait"
dl "float" "fishing float waggler" "bait"
dl "pole-float" "pole fishing float" "bait"
dl "waggler" "waggler fishing float" "bait"
dl "stick-float" "stick float fishing" "bait"
dl "slider-float" "slider float fishing" "bait"
dl "controller-float" "controller float fishing" "bait"
dl "ledger" "ledger fishing weight" "bait"
dl "feeder" "feeder fishing cage" "bait"
dl "method-feeder" "method feeder fishing" "bait"
dl "bomb" "fishing bomb weight" "bait"
dl "link-ledger" "link ledger fishing" "bait"
dl "helicopter-rig" "helicopter rig fishing" "bait"
dl "pva-bag" "pva bag fishing" "bait"
dl "maggot" "fishing maggot bait" "bait"
dl "worm" "fishing worm bait dendrobaena" "bait"
dl "boilie" "boilie carp bait" "bait"
dl "pellet" "fishing pellet bait" "bait"
dl "sweetcorn" "sweetcorn fishing bait" "bait"
dl "bread" "bread fishing bait" "bait"
dl "luncheon-meat" "luncheon meat fishing bait" "bait"
dl "casters" "caster fishing bait" "bait"
dl "hemp" "hempseed fishing bait" "bait"
dl "tares" "tares fishing bait" "bait"
dl "deadbait" "deadbait fishing pike" "bait"
dl "livebait" "livebait fishing" "bait"
dl "prawn" "prawn fishing bait" "bait"
dl "squid-bait" "squid bait fishing" "bait"
dl "ragworm" "ragworm fishing bait" "bait"
dl "lugworm" "lugworm fishing bait" "bait"
dl "crab-bait" "peeler crab fishing bait" "bait"
dl "mussel" "mussel fishing bait" "bait"
dl "sand-eel-bait" "sand eel fishing bait" "bait"
dl "mackerel-strip" "mackerel strip fishing bait" "bait"
dl "paste" "paste fishing bait" "bait"
dl "cheese" "cheese fishing bait" "bait"
dl "particles" "particle bait fishing" "bait"
dl "fake-bait" "fake corn fishing bait" "bait"
dl "freelining" "freelining fishing" "bait"
dl "trolling" "trolling fishing boat" "bait"
dl "spinning" "spinning fishing rod" "bait"
dl "surface-bait" "surface fishing bait" "bait"

echo ""
echo "Water images: $(ls public/images/water/ | wc -l)"
echo "Bait images: $(ls public/images/bait/ | wc -l)"
