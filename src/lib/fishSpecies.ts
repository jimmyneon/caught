export interface FishSpecies {
  name: string;
  category: 'coarse' | 'game' | 'sea' | 'other';
  aliases?: string[];
}

export const FISH_SPECIES: FishSpecies[] = [
  // Coarse fish
  { name: 'Carp', category: 'coarse', aliases: ['common carp'] },
  { name: 'Mirror Carp', category: 'coarse', aliases: ['mirror'] },
  { name: 'Leather Carp', category: 'coarse', aliases: ['leather'] },
  { name: 'Crucian Carp', category: 'coarse', aliases: ['crucian'] },
  { name: 'Grass Carp', category: 'coarse' },
  { name: 'Tench', category: 'coarse' },
  { name: 'Bream', category: 'coarse', aliases: ['common bream', 'bronze bream'] },
  { name: 'Skimmer Bream', category: 'coarse', aliases: ['skimmer'] },
  { name: 'Roach', category: 'coarse' },
  { name: 'Rudd', category: 'coarse' },
  { name: 'Perch', category: 'coarse' },
  { name: 'Pike', category: 'coarse', aliases: ['northern pike', 'jack pike'] },
  { name: 'Zander', category: 'coarse', aliases: ['pike-perch'] },
  { name: 'Chub', category: 'coarse' },
  { name: 'Dace', category: 'coarse' },
  { name: 'Barbel', category: 'coarse' },
  { name: 'Gudgeon', category: 'coarse' },
  { name: 'Minnow', category: 'coarse' },
  { name: 'Stickleback', category: 'coarse' },
  { name: 'Ruffe', category: 'coarse' },
  { name: 'Bleak', category: 'coarse' },
  { name: 'Ide', category: 'coarse' },
  { name: 'Wels Catfish', category: 'coarse', aliases: ['catfish', 'wels'] },
  { name: 'Sturgeon', category: 'coarse' },
  { name: 'Goldfish', category: 'coarse' },
  { name: 'Orfe', category: 'coarse' },

  // Game fish
  { name: 'Rainbow Trout', category: 'game', aliases: ['rainbow', 'steelhead'] },
  { name: 'Brown Trout', category: 'game', aliases: ['brown', 'brownie'] },
  { name: 'Sea Trout', category: 'game', aliases: ['sewin', 'peal'] },
  { name: 'Brook Trout', category: 'game', aliases: ['brookie'] },
  { name: 'Tiger Trout', category: 'game' },
  { name: 'Golden Trout', category: 'game' },
  { name: 'Salmon', category: 'game', aliases: ['atlantic salmon'] },
  { name: 'Grayling', category: 'game' },
  { name: 'Char', category: 'game', aliases: ['arctic char'] },

  // Sea fish
  { name: 'Bass', category: 'sea', aliases: ['sea bass', 'european bass'] },
  { name: 'Cod', category: 'sea' },
  { name: 'Pollack', category: 'sea', aliases: ['pollock'] },
  { name: 'Mackerel', category: 'sea' },
  { name: 'Wrasse', category: 'sea' },
  { name: 'Ballan Wrasse', category: 'sea', aliases: ['ballan'] },
  { name: 'Cuckoo Wrasse', category: 'sea', aliases: ['cuckoo'] },
  { name: 'Flounder', category: 'sea' },
  { name: 'Plaice', category: 'sea' },
  { name: 'Dab', category: 'sea' },
  { name: 'Sole', category: 'sea', aliases: ['dover sole'] },
  { name: 'Turbot', category: 'sea' },
  { name: 'Brill', category: 'sea' },
  { name: 'Ray', category: 'sea', aliases: ['thornback ray'] },
  { name: 'Dogfish', category: 'sea', aliases: ['small-spotted catshark'] },
  { name: 'Tope', category: 'sea' },
  { name: 'Whiting', category: 'sea' },
  { name: 'Haddock', category: 'sea' },
  { name: 'Garfish', category: 'sea', aliases: ['gar', 'needlefish'] },
  { name: 'Scad', category: 'sea', aliases: ['horse mackerel'] },
  { name: 'Gurnard', category: 'sea', aliases: ['red gurnard'] },
  { name: 'Conger Eel', category: 'sea', aliases: ['conger'] },
  { name: 'Smoothhound', category: 'sea', aliases: ['smooth hound'] },
  { name: 'Huss', category: 'sea', aliases: ['bull huss'] },
  { name: 'Black Bream', category: 'sea', aliases: ['bream sea'] },
  { name: 'Red Bream', category: 'sea' },
  { name: 'Pouting', category: 'sea', aliases: ['pout'] },
  { name: 'Ling', category: 'sea' },
  { name: 'Hake', category: 'sea' },
  { name: 'Squid', category: 'sea', aliases: ['loligo', 'calamari'] },
  { name: 'Cuttlefish', category: 'sea' },
  { name: 'Mullet', category: 'sea', aliases: ['thick-lipped mullet', 'thin-lipped mullet'] },
  { name: 'Sand Eel', category: 'sea', aliases: ['sandeel', 'launce'] },

  // Other / less common
  { name: 'Eel', category: 'other', aliases: ['silver eel', 'yellow eel'] },
  { name: 'Lamprey', category: 'other' },
  { name: 'Shad', category: 'other', aliases: ['allis shad', 'twaite shad'] },
  { name: 'Smelt', category: 'other' },
];

export function searchSpecies(query: string): FishSpecies[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FISH_SPECIES.filter((s) => {
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
    return false;
  }).slice(0, 8);
}

// Water type → likely species mapping (ordered by likelihood)
export const WATER_TYPE_SPECIES: Record<string, string[]> = {
  stillwater: ['Rainbow Trout', 'Brown Trout', 'Carp', 'Mirror Carp', 'Tench', 'Bream', 'Perch', 'Pike', 'Crucian Carp', 'Roach'],
  loch: ['Rainbow Trout', 'Brown Trout', 'Arctic Char', 'Pike', 'Perch', 'Salmon', 'Sea Trout'],
  lake: ['Rainbow Trout', 'Carp', 'Mirror Carp', 'Tench', 'Bream', 'Perch', 'Pike', 'Roach', 'Crucian Carp'],
  reservoir: ['Rainbow Trout', 'Brown Trout', 'Pike', 'Perch', 'Roach', 'Bream'],
  river: ['Brown Trout', 'Barbel', 'Chub', 'Roach', 'Dace', 'Grayling', 'Pike', 'Perch', 'Salmon', 'Sea Trout'],
  stream: ['Brown Trout', 'Rainbow Trout', 'Minnow', 'Bullhead', 'Dace', 'Grayling'],
  canal: ['Carp', 'Roach', 'Perch', 'Pike', 'Tench', 'Bream', 'Zander'],
  pond: ['Carp', 'Crucian Carp', 'Tench', 'Roach', 'Perch', 'Rudd'],
  sea: ['Bass', 'Mackerel', 'Pollack', 'Wrasse', 'Ballan Wrasse', 'Flounder', 'Cod', 'Whiting', 'Ray', 'Dogfish'],
  estuary: ['Bass', 'Flounder', 'Mullet', 'Eel', 'Pollack', 'Whiting'],
};

export function getSuggestedSpecies(waterType?: string): string[] {
  if (!waterType) return [];
  return WATER_TYPE_SPECIES[waterType] ?? [];
}
