import { useState, useMemo } from 'react';
import { ChevronDown, Check, Search, Star } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { useSettings } from '../hooks/useSettings';
import {
  BAIT_METHODS,
  METHOD_CATEGORIES,
  getMethodImage,
  getMethodSubTypes,
  type BaitMethod,
} from '../lib/baitMethods';

interface Props {
  value: string | undefined;
  subType?: string;
  method?: string;
  species?: string;
  waterType?: string;
  onChange: (v: string | undefined) => void;
  onSubTypeChange?: (v: string | undefined) => void;
}

// Map method (technique) to bait categories it pairs with
const METHOD_BAIT_CATEGORIES: Record<string, BaitMethod['category'][]> = {
  // Float techniques → baits + float-specific
  'Float': ['bait'],
  'Pole Float': ['bait'],
  'Waggler': ['bait'],
  'Stick Float': ['bait'],
  'Slider Float': ['bait'],
  'Controller': ['bait'],
  // Ledger techniques → baits
  'Ledger': ['bait'],
  'Feeder': ['bait'],
  'Method Feeder': ['bait'],
  'Bomb': ['bait'],
  'Link Ledger': ['bait'],
  'Helicopter Rig': ['bait'],
  'PVA Bag': ['bait'],
  // Lure "method" → lure baits
  'Spinning': ['lure'],
  'Trolling': ['lure'],
  // Fly "method" → fly baits
  'Freelining': ['bait'],
  'Surface': ['bait'],
};

export default function BaitSelect({ value, subType, method, species, waterType, onChange, onSubTypeChange }: Props) {
  const [settings] = useSettings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showSubTypes, setShowSubTypes] = useState(false);
  const favouriteBaits = settings.favouriteBaits ?? [];

  const grouped = useMemo(() => {
    let baits = BAIT_METHODS;

    // Filter by species-specific categories
    if (species) {
      const speciesKey = species.toLowerCase().trim();
      // Import the species map lazily
      const speciesCats = getSpeciesCategories(speciesKey);
      if (speciesCats) {
        baits = baits.filter((b) => speciesCats.includes(b.category));
      }
    }

    // Filter by water type
    if (waterType) {
      const wtCats = getWaterTypeCategories(waterType.toLowerCase());
      if (wtCats) {
        baits = baits.filter((b) => wtCats.includes(b.category));
      }
    }

    // Filter by method — if a method is selected, narrow baits to compatible categories
    if (method) {
      const methodCats = METHOD_BAIT_CATEGORIES[method];
      if (methodCats) {
        baits = baits.filter((b) => methodCats.includes(b.category));
      }
    }

    // Search filter
    const q = query.trim().toLowerCase();
    const filtered = q
      ? baits.filter((b) =>
          b.name.toLowerCase().includes(q) ||
          b.aliases?.some((a) => a.toLowerCase().includes(q))
        )
      : baits;

    // Group by category
    const map = new Map<string, BaitMethod[]>();
    for (const b of filtered) {
      if (!map.has(b.category)) map.set(b.category, []);
      map.get(b.category)!.push(b);
    }

    // Sort: favourites first within each category
    for (const [, items] of map) {
      items.sort((a, b) => {
        const aFav = favouriteBaits.includes(a.name) ? 0 : 1;
        const bFav = favouriteBaits.includes(b.name) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return a.name.localeCompare(b.name);
      });
    }

    return METHOD_CATEGORIES
      .filter((c) => map.has(c.key))
      .map((c) => ({ ...c, items: map.get(c.key)! }));
  }, [species, waterType, method, query, favouriteBaits]);

  const displayValue = value
    ? (subType ? `${value} — ${subType}` : value)
    : 'Select bait';

  const subTypes = value ? getMethodSubTypes(value) : [];

  const contextLabel = useMemo(() => {
    const parts: string[] = [];
    if (species) parts.push(species);
    if (waterType) parts.push(waterType);
    if (method) parts.push(method);
    return parts.length > 0 ? parts.join(' · ') : null;
  }, [species, waterType, method]);

  return (
    <div>
      <label className="label">Bait</label>
      <button
        type="button"
        className="field flex items-center justify-between"
        onClick={() => setOpen(true)}
        style={{ color: value ? 'var(--c-ink)' : 'var(--c-ink-3)' }}
      >
        <span className="flex items-center gap-2">
          {value && favouriteBaits.includes(value) && (
            <Star size={14} className="fill-current" style={{ color: 'var(--c-accent)' }} />
          )}
          {displayValue}
        </span>
        <ChevronDown size={18} style={{ color: 'var(--c-ink-3)' }} />
      </button>

      <BottomSheet open={open} onClose={() => { setOpen(false); setQuery(''); setShowSubTypes(false); }}>
        <div className="flex flex-col gap-3">
          <h2 className="pb-1 text-lg font-extrabold text-ink">
            {showSubTypes ? `${value} — select type` : 'Select bait'}
          </h2>

          {contextLabel && !showSubTypes && (
            <div className="rounded-lg px-3 py-2 text-xs font-medium text-ink-3" style={{ background: 'var(--c-surface-3)' }}>
              {contextLabel}
            </div>
          )}

          {showSubTypes && (
            <button
              className="flex items-center gap-2 text-sm font-bold text-ink-3"
              onClick={() => setShowSubTypes(false)}
            >
              <ChevronDown size={16} /> Back to baits
            </button>
          )}

          {showSubTypes && subTypes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {subTypes.map((st) => (
                <button
                  key={st}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors active:bg-surface-3"
                  style={{
                    background: subType === st ? 'var(--c-accent-bg)' : 'var(--c-surface-3)',
                    color: subType === st ? 'var(--c-accent)' : 'var(--c-ink)',
                  }}
                  onClick={() => {
                    onSubTypeChange?.(st);
                    setOpen(false);
                    setShowSubTypes(false);
                    setQuery('');
                  }}
                >
                  <span>{st}</span>
                  {subType === st && <Check size={18} />}
                </button>
              ))}
            </div>
          )}

          {!showSubTypes && (
            <>
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'var(--c-surface-3)' }}>
                <Search size={16} style={{ color: 'var(--c-ink-3)' }} />
                <input
                  className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                  placeholder="Search baits…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Favourites section */}
              {favouriteBaits.length > 0 && !query && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-3">
                    <Star size={12} className="fill-current" style={{ color: 'var(--c-accent)' }} /> Favourites
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {favouriteBaits
                      .filter((fav) => {
                        const bait = BAIT_METHODS.find((b) => b.name === fav);
                        if (!bait) return false;
                        // Check if bait is in the filtered set
                        return grouped.some((g) => g.items.some((b) => b.name === fav));
                      })
                      .map((fav) => {
                        const bait = BAIT_METHODS.find((b) => b.name === fav)!;
                        const img = getMethodImage(bait.name);
                        return (
                          <button
                            key={fav}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors active:bg-surface-3"
                            style={{
                              background: value === bait.name ? 'var(--c-accent-bg)' : 'var(--c-surface-3)',
                              color: value === bait.name ? 'var(--c-accent)' : 'var(--c-ink)',
                            }}
                            onClick={() => {
                              onChange(bait.name);
                              onSubTypeChange?.(undefined);
                              if (bait.collective && bait.subTypes && bait.subTypes.length > 0) {
                                setShowSubTypes(true);
                              } else {
                                setOpen(false);
                                setQuery('');
                              }
                            }}
                          >
                            <span className="flex items-center gap-2.5">
                              {img && <img src={img} alt={bait.name} className="h-8 w-8 rounded-lg object-cover" />}
                              <span>{bait.name}</span>
                            </span>
                            {value === bait.name && <Check size={18} />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Grouped options */}
              <div className="flex flex-col gap-4">
                {grouped.map((group) => (
                  <div key={group.key}>
                    <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-3">{group.label}</div>
                    <div className="flex flex-col gap-1.5">
                      {group.items.map((b) => {
                        const img = getMethodImage(b.name);
                        const isFav = favouriteBaits.includes(b.name);
                        return (
                          <button
                            key={b.name}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors active:bg-surface-3"
                            style={{
                              background: value === b.name ? 'var(--c-accent-bg)' : 'var(--c-surface-3)',
                              color: value === b.name ? 'var(--c-accent)' : 'var(--c-ink)',
                            }}
                            onClick={() => {
                              onChange(b.name);
                              onSubTypeChange?.(undefined);
                              if (b.collective && b.subTypes && b.subTypes.length > 0) {
                                setShowSubTypes(true);
                              } else {
                                setOpen(false);
                                setQuery('');
                              }
                            }}
                          >
                            <span className="flex items-center gap-2.5">
                              {img && <img src={img} alt={b.name} className="h-8 w-8 rounded-lg object-cover" />}
                              <span>{b.name}</span>
                              {isFav && <Star size={12} className="fill-current" style={{ color: 'var(--c-accent)' }} />}
                            </span>
                            {value === b.name && <Check size={18} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

// Helper: get species-specific bait categories
function getSpeciesCategories(speciesKey: string): BaitMethod['category'][] | null {
  const map: Record<string, BaitMethod['category'][]> = {
    'rainbow trout': ['fly', 'bait'],
    'brown trout': ['fly', 'bait'],
    'sea trout': ['fly', 'lure', 'bait'],
    'brook trout': ['fly', 'bait'],
    'salmon': ['fly', 'lure'],
    'grayling': ['fly', 'bait'],
    'carp': ['bait', 'ledger', 'float'],
    'mirror carp': ['bait', 'ledger', 'float'],
    'leather carp': ['bait', 'ledger', 'float'],
    'crucian carp': ['bait', 'ledger', 'float'],
    'tench': ['bait', 'ledger', 'float'],
    'bream': ['bait', 'ledger', 'float'],
    'roach': ['bait', 'float', 'ledger'],
    'rudd': ['bait', 'float'],
    'perch': ['bait', 'lure', 'float'],
    'pike': ['lure', 'bait'],
    'zander': ['lure', 'bait'],
    'chub': ['bait', 'lure', 'float'],
    'dace': ['bait', 'float', 'fly'],
    'barbel': ['bait', 'ledger'],
    'wels catfish': ['bait', 'ledger'],
    'bass': ['lure', 'bait'],
    'cod': ['bait', 'ledger'],
    'pollack': ['lure', 'fly'],
    'mackerel': ['lure', 'bait'],
    'wrasse': ['bait', 'lure'],
    'ballan wrasse': ['bait', 'lure'],
    'flounder': ['bait', 'ledger'],
    'plaice': ['bait', 'ledger'],
    'mullet': ['bait', 'float', 'fly'],
  };
  return map[speciesKey] ?? null;
}

// Helper: get water type bait categories
function getWaterTypeCategories(wt: string): BaitMethod['category'][] | null {
  const map: Record<string, BaitMethod['category'][]> = {
    'sea': ['bait', 'ledger', 'lure'],
    'river': ['bait', 'ledger', 'float', 'lure', 'fly'],
    'lake': ['bait', 'ledger', 'float', 'lure', 'fly'],
    'canal': ['bait', 'ledger', 'float', 'lure'],
    'reservoir': ['fly', 'lure', 'bait', 'ledger'],
    'pond': ['bait', 'float', 'ledger', 'lure'],
    'stream': ['fly', 'bait', 'float'],
    'estuary': ['bait', 'ledger', 'lure', 'fly'],
    'stillwater': ['fly', 'lure', 'bait', 'ledger', 'float'],
    'loch': ['fly', 'lure', 'bait', 'ledger'],
  };
  return map[wt] ?? null;
}
