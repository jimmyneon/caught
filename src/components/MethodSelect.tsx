import { useState, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { getMethodImage, METHOD_CATEGORIES, type BaitMethod } from '../lib/baitMethods';

// Technique options — just the methods, not individual baits
const TECHNIQUES: { name: string; category: BaitMethod['category']; image?: string; aliases?: string[] }[] = [
  // Float
  { name: 'Float', category: 'float', image: 'float', aliases: ['waggler', 'float fishing'] },
  { name: 'Pole Float', category: 'float', image: 'pole-float', aliases: ['pole fishing'] },
  { name: 'Waggler', category: 'float', image: 'waggler' },
  { name: 'Stick Float', category: 'float', image: 'stick-float' },
  { name: 'Slider Float', category: 'float', image: 'slider-float' },
  { name: 'Controller', category: 'float', image: 'controller-float', aliases: ['surface controller'] },
  // Ledger
  { name: 'Ledger', category: 'ledger', image: 'ledger', aliases: ['ledgering'] },
  { name: 'Feeder', category: 'ledger', image: 'feeder', aliases: ['method feeder', 'cage feeder'] },
  { name: 'Method Feeder', category: 'ledger', image: 'method-feeder' },
  { name: 'Bomb', category: 'ledger', image: 'bomb', aliases: ['lead bomb'] },
  { name: 'Link Ledger', category: 'ledger', image: 'link-ledger' },
  { name: 'Helicopter Rig', category: 'ledger', image: 'helicopter-rig' },
  { name: 'PVA Bag', category: 'ledger', image: 'pva-bag', aliases: ['pva stick'] },
  // Lure
  { name: 'Spinning', category: 'lure', image: 'spinning', aliases: ['spin fishing'] },
  { name: 'Trolling', category: 'other', image: 'trolling' },
  // Fly
  { name: 'Fly Fishing', category: 'fly', image: 'dry-fly', aliases: ['fly'] },
  // Other
  { name: 'Freelining', category: 'other', image: 'freelining', aliases: ['free line'] },
  { name: 'Surface', category: 'other', image: 'surface-bait', aliases: ['surface fishing'] },
];

interface Props {
  value: string | undefined;
  species?: string;
  waterType?: string;
  onChange: (v: string | undefined) => void;
}

// Water type → technique categories
const WATER_TECHNIQUES: Record<string, BaitMethod['category'][]> = {
  'sea': ['lure', 'ledger', 'float'],
  'river': ['float', 'ledger', 'lure', 'fly'],
  'lake': ['ledger', 'float', 'lure', 'fly'],
  'canal': ['float', 'ledger', 'lure'],
  'reservoir': ['fly', 'lure', 'ledger', 'float'],
  'pond': ['float', 'ledger', 'lure'],
  'stream': ['fly', 'float'],
  'estuary': ['ledger', 'lure', 'float'],
  'stillwater': ['fly', 'lure', 'ledger', 'float'],
  'loch': ['fly', 'lure', 'ledger'],
};

// Species → technique categories
const SPECIES_TECHNIQUES: Record<string, BaitMethod['category'][]> = {
  'rainbow trout': ['fly', 'ledger'],
  'brown trout': ['fly', 'ledger'],
  'sea trout': ['fly', 'lure'],
  'brook trout': ['fly', 'ledger'],
  'salmon': ['fly', 'lure'],
  'grayling': ['fly', 'float'],
  'carp': ['ledger', 'float'],
  'mirror carp': ['ledger', 'float'],
  'leather carp': ['ledger', 'float'],
  'crucian carp': ['ledger', 'float'],
  'tench': ['ledger', 'float'],
  'bream': ['ledger', 'float'],
  'roach': ['float', 'ledger'],
  'rudd': ['float'],
  'perch': ['lure', 'float', 'ledger'],
  'pike': ['lure', 'ledger'],
  'zander': ['lure', 'ledger'],
  'chub': ['float', 'lure', 'ledger'],
  'dace': ['float', 'fly'],
  'barbel': ['ledger'],
  'wels catfish': ['ledger'],
  'bass': ['lure', 'ledger'],
  'cod': ['ledger'],
  'pollack': ['lure'],
  'mackerel': ['lure', 'float'],
  'wrasse': ['ledger', 'lure'],
  'ballan wrasse': ['ledger', 'lure'],
  'flounder': ['ledger'],
  'plaice': ['ledger'],
  'mullet': ['float', 'fly'],
};

export default function MethodSelect({ value, species, waterType, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    let techniques = TECHNIQUES;

    // Filter by species
    if (species) {
      const cats = SPECIES_TECHNIQUES[species.toLowerCase().trim()];
      if (cats) {
        techniques = techniques.filter((t) => cats.includes(t.category));
      }
    }

    // Filter by water type
    if (waterType) {
      const cats = WATER_TECHNIQUES[waterType.toLowerCase()];
      if (cats) {
        techniques = techniques.filter((t) => cats.includes(t.category));
      }
    }

    // Search
    const q = query.trim().toLowerCase();
    const filtered = q
      ? techniques.filter((t) =>
          t.name.toLowerCase().includes(q) ||
          t.aliases?.some((a) => a.toLowerCase().includes(q))
        )
      : techniques;

    // Group by category
    const map = new Map<string, typeof TECHNIQUES>();
    for (const t of filtered) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }

    return METHOD_CATEGORIES
      .filter((c) => map.has(c.key))
      .map((c) => ({ ...c, items: map.get(c.key)! }));
  }, [species, waterType, query]);

  const contextLabel = useMemo(() => {
    const parts: string[] = [];
    if (species) parts.push(species);
    if (waterType) parts.push(waterType);
    return parts.length > 0 ? parts.join(' · ') : null;
  }, [species, waterType]);

  return (
    <div>
      <label className="label">Method</label>
      <button
        type="button"
        className="field flex items-center justify-between"
        onClick={() => setOpen(true)}
        style={{ color: value ? 'var(--c-ink)' : 'var(--c-ink-3)' }}
      >
        <span>{value ?? 'Select method'}</span>
        <ChevronDown size={18} style={{ color: 'var(--c-ink-3)' }} />
      </button>

      <BottomSheet open={open} onClose={() => { setOpen(false); setQuery(''); }}>
        <div className="flex flex-col gap-3">
          <h2 className="pb-1 text-lg font-extrabold text-ink">Select method</h2>

          {contextLabel && (
            <div className="rounded-lg px-3 py-2 text-xs font-medium text-ink-3" style={{ background: 'var(--c-surface-3)' }}>
              {contextLabel}
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'var(--c-surface-3)' }}>
            <Search size={16} style={{ color: 'var(--c-ink-3)' }} />
            <input
              className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              placeholder="Search methods…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Grouped techniques */}
          <div className="flex flex-col gap-4">
            {grouped.map((group) => (
              <div key={group.key}>
                <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-3">{group.label}</div>
                <div className="flex flex-col gap-1.5">
                  {group.items.map((t) => {
                    const img = getMethodImage(t.name);
                    return (
                      <button
                        key={t.name}
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors active:bg-surface-3"
                        style={{
                          background: value === t.name ? 'var(--c-accent-bg)' : 'var(--c-surface-3)',
                          color: value === t.name ? 'var(--c-accent)' : 'var(--c-ink)',
                        }}
                        onClick={() => {
                          onChange(t.name);
                          setOpen(false);
                          setQuery('');
                        }}
                      >
                        <span className="flex items-center gap-2.5">
                          {img && <img src={img} alt={t.name} className="h-8 w-8 rounded-lg object-cover" />}
                          <span>{t.name}</span>
                        </span>
                        {value === t.name && <Check size={18} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
