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

echo "Downloading remaining fish images..."
download_species "ballan-wrasse" "Labrus bergylta"
download_species "black-bream" "Spondyliosoma cantharus"
download_species "bleak" "Alburnus alburnus"
download_species "brill" "Scophthalmus rhombus"
download_species "brook-trout" "Salvelinus fontinalis"
download_species "char" "Salvelinus alpinus"
download_species "conger-eel" "Conger conger"
download_species "cuckoo-wrasse" "Labrus mixtus"
download_species "cuttlefish" "Sepia officinalis"
download_species "dab" "Limanda limanda"
download_species "garfish" "Belone belone"
download_species "golden-trout" "Oncorhynchus aguabonita"
download_species "goldfish" "Carassius auratus"
download_species "grass-carp" "Ctenopharyngodon idella"
download_species "gurnard" "Chelidonichthys lucerna"
download_species "haddock" "Melanogrammus aeglefinus"
download_species "hake" "Merluccius merluccius"
download_species "huss" "Scyliorhinus stellaris"
download_species "ide" "Leuciscus idus"
download_species "lamprey" "Lampetra planeri"
download_species "leather-carp" "Cyprinus carpio specularis"
download_species "ling" "Molva molva"
download_species "minnow" "Phoxinus phoxinus"
download_species "orfe" "Leuciscus idus"
download_species "pouting" "Trisopterus luscus"
download_species "ray" "Raja clavata"
download_species "red-bream" "Pagellus bogaraveo"
download_species "ruffe" "Gymnocephalus cernua"
download_species "sand-eel" "Ammodytes"
download_species "scad" "Trachurus trachurus"
download_species "shad" "Alosa fallax"
download_species "skimmer-bream" "Blicca bjoerkna"
download_species "smelt" "Osmerus eperlanus"
download_species "smoothhound" "Mustelus asterias"
download_species "sole" "Solea solea"
download_species "squid" "Loligo vulgaris"
download_species "stickleback" "Gasterosteus aculeatus"
download_species "tiger-trout" "Salmo trutta x Salvelinus fontinalis"
download_species "tope" "Galeorhinus galeus"
download_species "turbot" "Scophthalmus maximus"
download_species "whiting" "Merlangius merlangus"

echo ""
echo "Total images:"
ls public/images/fish/ | wc -l
