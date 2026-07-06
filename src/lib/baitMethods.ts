export interface BaitMethod {
  name: string;
  category: 'lure' | 'fly' | 'float' | 'ledger' | 'bait' | 'other';
  image?: string;
  aliases?: string[];
}

export const BAIT_METHODS: BaitMethod[] = [
  // Lures
  { name: 'Spinner', category: 'lure', image: 'spinner', aliases: ['mepps', 'spinnerbait'] },
  { name: 'Plug', category: 'lure', image: 'plug', aliases: ['minnow plug', 'stickbait'] },
  { name: 'Crankbait', category: 'lure', image: 'crankbait', aliases: ['crank', 'diving lure'] },
  { name: 'Jerkbait', category: 'lure', image: 'jerkbait', aliases: ['jerk bait'] },
  { name: 'Soft Plastic', category: 'lure', image: 'soft-plastic', aliases: ['soft plastic lure', 'grub', 'twintail'] },
  { name: 'Jig', category: 'lure', image: 'jig', aliases: ['jighead', 'bucktail jig'] },
  { name: 'Swimbait', category: 'lure', image: 'swimbait', aliases: ['shad imitation'] },
  { name: 'Spoon', category: 'lure', image: 'spoon', aliases: ['casting spoon', 'trolling spoon'] },
  { name: 'Rapala', category: 'lure', image: 'rapala', aliases: ['rapala minnow', 'rapala jointed'] },
  { name: 'Mepps Spinner', category: 'lure', image: 'mepps', aliases: ['mepps aglia', 'mepps comet'] },
  { name: 'Abu Garcia', category: 'lure', image: 'abu-garcia', aliases: ['abu toby', 'abu droppen'] },
  { name: 'Dexter Wedge', category: 'lure', image: 'dexter-wedge' },
  { name: 'Bass Jig', category: 'lure', image: 'bass-jig' },
  { name: 'Surface Lure', category: 'lure', image: 'surface-lure', aliases: ['topwater', 'popper lure'] },
  { name: 'Vibration Lure', category: 'lure', image: 'vibration-lure', aliases: ['vib', 'rattling lure'] },

  // Flies
  { name: 'Dry Fly', category: 'fly', image: 'dry-fly', aliases: ['dry'] },
  { name: 'Nymph', category: 'fly', image: 'nymph', aliases: ['gold ribbed hare\'s ear', 'grhe', 'pheasant tail'] },
  { name: 'Wet Fly', category: 'fly', image: 'wet-fly', aliases: ['wet'] },
  { name: 'Streamer', category: 'fly', image: 'streamer', aliases: ['woolly bugger', 'muddler minnow'] },
  { name: 'Emerger', category: 'fly', image: 'emerger' },
  { name: 'Popper Fly', category: 'fly', image: 'popper-fly', aliases: ['booby', 'hopper'] },
  { name: 'Lure Fly', category: 'fly', image: 'lure-fly', aliases: ['blob', 'damsel', 'cat booby'] },
  { name: 'Buzzard Fly', category: 'fly', image: 'buzzard-fly' },
  { name: 'Cormorant', category: 'fly', image: 'cormorant-fly' },
  { name: 'Diawl Bach', category: 'fly', image: 'diawl-bach' },
  { name: 'Cats Whisker', category: 'fly', image: 'cats-whisker', aliases: ['cat whisker'] },
  { name: 'Olive', category: 'fly', image: 'olive-fly', aliases: ['olive nymph', 'klinkhammer'] },
  { name: 'Caddis', category: 'fly', image: 'caddis', aliases: ['sedge', 'elk hair caddis'] },
  { name: 'Mayfly', category: 'fly', image: 'mayfly', aliases: ['ephemera', 'green drake'] },
  { name: 'Midge', category: 'fly', image: 'midge', aliases: ['chironomid', 'buzzer'] },
  { name: 'Egg Fly', category: 'fly', image: 'egg-fly' },
  { name: 'Salmon Fly', category: 'fly', image: 'salmon-fly', aliases: ['tube fly', 'ally\'s shrimp'] },

  // Float
  { name: 'Float', category: 'float', image: 'float', aliases: ['waggler', 'float fishing'] },
  { name: 'Pole Float', category: 'float', image: 'pole-float', aliases: ['pole fishing'] },
  { name: 'Waggler', category: 'float', image: 'waggler' },
  { name: 'Stick Float', category: 'float', image: 'stick-float' },
  { name: 'Slider Float', category: 'float', image: 'slider-float' },
  { name: 'Controller', category: 'float', image: 'controller-float', aliases: ['surface controller'] },

  // Ledger / Feeder
  { name: 'Ledger', category: 'ledger', image: 'ledger', aliases: ['ledgering'] },
  { name: 'Feeder', category: 'ledger', image: 'feeder', aliases: ['method feeder', 'cage feeder', 'maggy feeder'] },
  { name: 'Method Feeder', category: 'ledger', image: 'method-feeder' },
  { name: 'Bomb', category: 'ledger', image: 'bomb', aliases: ['lead bomb', 'ledger bomb'] },
  { name: 'Link Ledger', category: 'ledger', image: 'link-ledger' },
  { name: 'Helicopter Rig', category: 'ledger', image: 'helicopter-rig' },
  { name: 'PVA Bag', category: 'ledger', image: 'pva-bag', aliases: ['pva stick'] },

  // Baits
  { name: 'Maggot', category: 'bait', image: 'maggot', aliases: ['maggots', 'squatt', 'pinkie'] },
  { name: 'Worm', category: 'bait', image: 'worm', aliases: ['lobworm', 'dendrobaena', 'redworm'] },
  { name: 'Boilie', category: 'bait', image: 'boilie', aliases: ['boilies', 'bottom bait'] },
  { name: 'Pellet', category: 'bait', image: 'pellet', aliases: ['halibut pellet', 'expander pellet'] },
  { name: 'Sweetcorn', category: 'bait', image: 'sweetcorn', aliases: ['corn'] },
  { name: 'Bread', category: 'bait', image: 'bread', aliases: ['bread flake', 'bread punch', 'crust'] },
  { name: 'Luncheon Meat', category: 'bait', image: 'luncheon-meat', aliases: ['spam', 'meat'] },
  { name: 'Casters', category: 'bait', image: 'casters', aliases: ['caster'] },
  { name: 'Hemp', category: 'bait', image: 'hemp', aliases: ['hempseed'] },
  { name: 'Tares', category: 'bait', image: 'tares' },
  { name: 'Deadbait', category: 'bait', image: 'deadbait', aliases: ['dead bait', 'dead fish bait'] },
  { name: 'Livebait', category: 'bait', image: 'livebait', aliases: ['live bait', 'live fish'] },
  { name: 'Prawn', category: 'bait', image: 'prawn', aliases: ['shrimp bait'] },
  { name: 'Squid Bait', category: 'bait', image: 'squid-bait', aliases: ['squid strip'] },
  { name: 'Ragworm', category: 'bait', image: 'ragworm', aliases: ['rag worm', 'king rag'] },
  { name: 'Lugworm', category: 'bait', image: 'lugworm', aliases: ['lug worm', 'black lug'] },
  { name: 'Crab Bait', category: 'bait', image: 'crab-bait', aliases: ['peeler crab', 'soft crab'] },
  { name: 'Mussel', category: 'bait', image: 'mussel', aliases: ['mussels'] },
  { name: 'Sand Eel Bait', category: 'bait', image: 'sand-eel-bait' },
  { name: 'Mackerel Strip', category: 'bait', image: 'mackerel-strip', aliases: ['mackerel bait', 'fish strip'] },
  { name: 'Paste', category: 'bait', image: 'paste', aliases: ['trout paste', 'cheese paste'] },
  { name: 'Cheese', category: 'bait', image: 'cheese' },
  { name: 'Particles', category: 'bait', image: 'particles', aliases: ['maize', 'chickpeas', 'tiger nuts'] },
  { name: 'Fake Bait', category: 'bait', image: 'fake-bait', aliases: ['plastic corn', 'fake corn', 'artificial'] },

  // Other
  { name: 'Freelining', category: 'other', image: 'freelining', aliases: ['free line'] },
  { name: 'Trolling', category: 'other', image: 'trolling' },
  { name: 'Spinning', category: 'other', image: 'spinning', aliases: ['spin fishing'] },
  { name: 'Surface', category: 'other', image: 'surface-bait', aliases: ['surface fishing'] },
];

const methodImageMap: Record<string, string> = {};
for (const m of BAIT_METHODS) {
  if (m.image) {
    methodImageMap[m.name.toLowerCase()] = m.image;
    if (m.aliases) {
      for (const a of m.aliases) {
        methodImageMap[a.toLowerCase()] = m.image;
      }
    }
  }
}

export function getMethodImage(name: string): string | null {
  if (!name) return null;
  const img = methodImageMap[name.toLowerCase()];
  if (img) return `/images/bait/${img}.jpg`;
  return null;
}

export function searchMethods(query: string): BaitMethod[] {
  const q = query.trim().toLowerCase();
  if (!q) return BAIT_METHODS.slice(0, 12);
  return BAIT_METHODS.filter((m) => {
    if (m.name.toLowerCase().includes(q)) return true;
    if (m.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
    return false;
  }).slice(0, 12);
}

export const METHOD_CATEGORIES: { key: BaitMethod['category']; label: string }[] = [
  { key: 'lure', label: 'Lures' },
  { key: 'fly', label: 'Flies' },
  { key: 'float', label: 'Float' },
  { key: 'ledger', label: 'Ledger & Feeder' },
  { key: 'bait', label: 'Baits' },
  { key: 'other', label: 'Other Methods' },
];

const SPECIES_METHOD_MAP: Record<string, BaitMethod['category'][]> = {
  // Game fish — primarily flies
  'rainbow trout': ['fly', 'bait'],
  'brown trout': ['fly', 'bait'],
  'sea trout': ['fly', 'lure', 'bait'],
  'brook trout': ['fly', 'bait'],
  'tiger trout': ['fly', 'bait'],
  'golden trout': ['fly', 'bait'],
  'salmon': ['fly', 'lure', 'other'],
  'grayling': ['fly', 'bait'],
  'char': ['fly', 'bait'],
  // Coarse fish
  'carp': ['bait', 'ledger', 'float'],
  'mirror carp': ['bait', 'ledger', 'float'],
  'leather carp': ['bait', 'ledger', 'float'],
  'crucian carp': ['bait', 'ledger', 'float'],
  'grass carp': ['bait', 'ledger'],
  'tench': ['bait', 'ledger', 'float'],
  'bream': ['bait', 'ledger', 'float'],
  'skimmer bream': ['bait', 'ledger', 'float'],
  'roach': ['bait', 'float', 'ledger'],
  'rudd': ['bait', 'float'],
  'perch': ['bait', 'lure', 'float'],
  'pike': ['lure', 'bait', 'other'],
  'zander': ['lure', 'bait'],
  'chub': ['bait', 'lure', 'float'],
  'dace': ['bait', 'float', 'fly'],
  'barbel': ['bait', 'ledger'],
  'gudgeon': ['bait', 'float'],
  'minnow': ['bait', 'float'],
  'wels catfish': ['bait', 'ledger'],
  'sturgeon': ['bait', 'ledger'],
  // Sea fish
  'bass': ['lure', 'bait', 'other'],
  'cod': ['bait', 'ledger', 'other'],
  'pollack': ['lure', 'fly', 'other'],
  'mackerel': ['lure', 'bait', 'other'],
  'wrasse': ['bait', 'lure'],
  'ballan wrasse': ['bait', 'lure'],
  'flounder': ['bait', 'ledger'],
  'plaice': ['bait', 'ledger'],
  'dab': ['bait', 'ledger'],
  'sole': ['bait', 'ledger'],
  'turbot': ['bait', 'lure'],
  'brill': ['bait', 'lure'],
  'ray': ['bait', 'ledger'],
  'dogfish': ['bait', 'ledger'],
  'tope': ['bait', 'lure'],
  'whiting': ['bait', 'ledger'],
  'haddock': ['bait', 'ledger'],
  'garfish': ['bait', 'float', 'fly'],
  'scad': ['lure', 'bait'],
  'gurnard': ['bait', 'ledger'],
  'conger eel': ['bait', 'ledger'],
  'smoothhound': ['bait', 'ledger'],
  'huss': ['bait', 'ledger'],
  'black bream': ['bait', 'lure'],
  'red bream': ['bait', 'lure'],
  'pouting': ['bait', 'ledger'],
  'ling': ['bait', 'ledger', 'lure'],
  'hake': ['bait', 'ledger'],
  'squid': ['lure', 'bait'],
  'cuttlefish': ['bait', 'lure'],
  'mullet': ['bait', 'float', 'fly'],
  'sand eel': ['lure', 'bait'],
  // Other
  'eel': ['bait', 'ledger'],
  'lamprey': ['bait'],
  'shad': ['fly', 'lure'],
  'smelt': ['bait', 'fly'],
};

export function getRecommendedCategories(species: string): BaitMethod['category'][] | null {
  if (!species) return null;
  const key = species.toLowerCase().trim();
  return SPECIES_METHOD_MAP[key] ?? null;
}

export function getFilteredMethods(species: string | undefined): BaitMethod[] {
  if (!species) return BAIT_METHODS;
  const cats = getRecommendedCategories(species);
  if (!cats) return BAIT_METHODS;
  const filtered = BAIT_METHODS.filter((m) => cats.includes(m.category));
  return filtered.length > 0 ? filtered : BAIT_METHODS;
}
