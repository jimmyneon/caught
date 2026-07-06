import { FISH_SPECIES } from './fishSpecies';

const speciesImageMap: Record<string, string> = {};

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

for (const s of FISH_SPECIES) {
  const slug = slugify(s.name);
  speciesImageMap[s.name.toLowerCase()] = slug;
  if (s.aliases) {
    for (const a of s.aliases) {
      speciesImageMap[a.toLowerCase()] = slug;
    }
  }
}

export function getSpeciesImage(name: string): string | null {
  if (!name) return null;
  const slug = speciesImageMap[name.toLowerCase()];
  if (slug) return `/images/fish/${slug}.jpg`;
  return null;
}

const waterImageMap: Record<string, string> = {
  sea: '/images/water/sea.jpg',
  river: '/images/water/river.jpg',
  lake: '/images/water/lake.jpg',
  canal: '/images/water/canal.jpg',
  reservoir: '/images/water/reservoir.jpg',
  pond: '/images/water/pond.jpg',
  stream: '/images/water/stream.jpg',
  estuary: '/images/water/estuary.jpg',
  stillwater: '/images/water/stillwater.jpg',
  loch: '/images/water/loch.jpg',
};

export function getWaterImage(waterType: string): string | null {
  return waterImageMap[waterType?.toLowerCase()] ?? null;
}

export { getMethodImage } from './baitMethods';

