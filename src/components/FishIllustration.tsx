interface FishIconProps {
  species?: string;
  size?: number;
  className?: string;
}

const COLORS: Record<string, { body: string; fin: string; belly: string; spot: string }> = {
  trout: { body: '#f97316', fin: '#ea580c', belly: '#fed7aa', spot: '#c2410c' },
  'rainbow trout': { body: '#fb923c', fin: '#ea580c', belly: '#fed7aa', spot: '#9a3412' },
  'brown trout': { body: '#a16207', fin: '#854d0e', belly: '#fde68a', spot: '#713f12' },
  salmon: { body: '#fb7185', fin: '#e11d48', belly: '#fecdd3', spot: '#be123c' },
  pike: { body: '#84cc16', fin: '#65a30d', belly: '#d9f99d', spot: '#4d7c0f' },
  carp: { body: '#b8860b', fin: '#854d0e', belly: '#fde68a', spot: '#713f12' },
  perch: { body: '#eab308', fin: '#ca8a04', belly: '#fef08a', spot: '#854d0e' },
  bass: { body: '#64748b', fin: '#475569', belly: '#cbd5e1', spot: '#334155' },
  'sea bass': { body: '#78716c', fin: '#57534e', belly: '#d6d3d1', spot: '#44403c' },
  roach: { body: '#94a3b8', fin: '#64748b', belly: '#e2e8f0', spot: '#475569' },
  bream: { body: '#a8a29e', fin: '#78716c', belly: '#d6d3d1', spot: '#57534e' },
  tench: { body: '#4d7c0f', fin: '#3f6212', belly: '#bef264', spot: '#365314' },
  mackerel: { body: '#0f766e', fin: '#0d5d56', belly: '#99f6e4', spot: '#134e4a' },
  cod: { body: '#a3a3a3', fin: '#737373', belly: '#e5e5e5', spot: '#525252' },
  pollock: { body: '#52525b', fin: '#3f3f46', belly: '#a1a1aa', spot: '#27272a' },
  wrasse: { body: '#15803d', fin: '#166534', belly: '#bbf7d0', spot: '#14532d' },
  default: { body: '#4a90c2', fin: '#3a7ba8', belly: '#c8dde8', spot: '#2d6a4f' },
};

function getColor(species?: string) {
  if (!species) return COLORS.default;
  const s = species.toLowerCase();
  if (COLORS[s]) return COLORS[s];
  for (const key of Object.keys(COLORS)) {
    if (key !== 'default' && s.includes(key)) return COLORS[key];
  }
  return COLORS.default;
}

let gradId = 0;

export function FishIllustration({ species, size = 48, className }: FishIconProps) {
  const c = getColor(species);
  const id = `fish-grad-${++gradId}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.body} />
          <stop offset="60%" stopColor={c.body} />
          <stop offset="100%" stopColor={c.belly} />
        </linearGradient>
      </defs>
      <path d="M8 32c6-10 18-16 28-16 8 0 14 6 18 16-4 10-10 16-18 16-10 0-22-6-28-16z" fill={`url(#${id})`} />
      <path d="M54 32l10-8v16z" fill={c.fin} />
      <path d="M30 18c-2-4-6-6-10-6 2 4 4 8 4 12" fill={c.fin} />
      <path d="M30 46c-2 4-6 6-10 6 2-4 4-8 4-12" fill={c.fin} />
      <path d="M36 18c4-2 8-2 12 0-4 2-8 4-12 4z" fill={c.fin} opacity="0.5" />
      <path d="M22 26c4-1 8-1 12 0" stroke={c.spot} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M24 38c3-1 6-1 9 0" stroke={c.spot} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.3" />
      <circle cx="18" cy="29" r="2.8" fill="white" />
      <circle cx="18" cy="29" r="1.5" fill="#1e293b" />
      <circle cx="18.5" cy="28.5" r="0.5" fill="white" />
      <path d="M26 32c0-1 1-2 2-2" stroke={c.spot} strokeWidth="0.8" fill="none" opacity="0.5" />
    </svg>
  );
}

export const SPECIES_LIST = [
  'Rainbow trout',
  'Brown trout',
  'Salmon',
  'Pike',
  'Carp',
  'Perch',
  'Bass',
  'Roach',
  'Bream',
  'Tench',
  'Mackerel',
  'Cod',
  'Pollock',
  'Wrasse',
  'Sea bass',
];
