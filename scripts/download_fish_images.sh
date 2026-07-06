#!/bin/bash
set -e

mkdir -p public/images/fish
UA="CaughtApp/1.0 (contact@caught.app)"

download_species() {
  local fn="$1"
  local latin="$2"
  local outpath="public/images/fish/${fn}.jpg"

  if [ -f "$outpath" ] && [ $(wc -c < "$outpath") -gt 2000 ]; then
    echo "EXISTS: $fn"
    return 0
  fi

  local search_result
  search_result=$(curl -s --max-time 8 -H "User-Agent: $UA" \
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${latin}'))")&srnamespace=6&srlimit=5" 2>&1)

  local titles
  titles=$(echo "$search_result" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for r in d.get('query',{}).get('search',[]):
    print(r['title'])
" 2>/dev/null)

  if [ -z "$titles" ]; then
    echo "SKIP: $fn (no search results)"
    return 1
  fi

  while IFS= read -r title; do
    local encoded
    encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$title'))")

    local info
    info=$(curl -s --max-time 8 -H "User-Agent: $UA" \
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encoded}&prop=imageinfo&iiprop=url|mime&iiurlwidth=400" 2>&1)

    local thumb mime
    thumb=$(echo "$info" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for p in d.get('query',{}).get('pages',{}).values():
    ii = p.get('imageinfo',[])
    if ii:
        print(ii[0].get('thumburl',''))
        break
" 2>/dev/null)
    mime=$(echo "$info" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for p in d.get('query',{}).get('pages',{}).values():
    ii = p.get('imageinfo',[])
    if ii:
        print(ii[0].get('mime',''))
        break
" 2>/dev/null)

    if [ -z "$thumb" ]; then continue; fi
    if [[ "$mime" != "image/jpeg" && "$mime" != "image/png" ]]; then continue; fi

    curl -sL --max-time 15 -H "User-Agent: $UA" -o "$outpath" "$thumb" 2>&1
    local size
    size=$(wc -c < "$outpath" 2>/dev/null || echo 0)
    if [ "$size" -gt 2000 ]; then
      echo "OK: $fn (${size} bytes)"
      return 0
    fi
  done <<< "$titles"

  echo "FAIL: $fn"
  rm -f "$outpath"
  return 1
}

echo "Downloading fish images from Wikimedia Commons..."
download_species "carp" "Cyprinus carpio"
download_species "mirror-carp" "mirror carp"
download_species "crucian-carp" "Carassius carassius"
download_species "tench" "Tinca tinca"
download_species "bream" "Abramis brama"
download_species "roach" "Rutilus rutilus"
download_species "rudd" "Scardinius erythrophthalmus"
download_species "perch" "Perca fluviatilis"
download_species "pike" "Esox lucius"
download_species "zander" "Sander lucioperca"
download_species "chub" "Squalius cephalus"
download_species "dace" "Leuciscus leuciscus"
download_species "barbel" "Barbus barbus"
download_species "gudgeon" "Gobio gobio"
download_species "wels-catfish" "Silurus glanis"
download_species "sturgeon" "Acipenser sturio"
download_species "rainbow-trout" "Oncorhynchus mykiss"
download_species "brown-trout" "Salmo trutta"
download_species "sea-trout" "Salmo trutta trutta"
download_species "salmon" "Salmo salar"
download_species "grayling" "Thymallus thymallus"
download_species "bass" "Dicentrarchus labrax"
download_species "cod" "Gadus morhua"
download_species "pollack" "Pollachius pollachius"
download_species "mackerel" "Scomber scombrus"
download_species "wrasse" "Labrus bergylta"
download_species "flounder" "Platichthys flesus"
download_species "plaice" "Pleuronectes platessa"
download_species "dogfish" "Scyliorhinus canicula"
download_species "mullet" "Chelon labrosus"
download_species "eel" "Anguilla anguilla"

echo ""
echo "Done. Files:"
ls -la public/images/fish/ 2>&1
