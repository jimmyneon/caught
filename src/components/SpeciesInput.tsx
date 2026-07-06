import { useMemo, useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronDown, Check } from 'lucide-react';
import { db } from '../db';
import { useSettings } from '../hooks/useSettings';
import { searchSpecies, FISH_SPECIES } from '../lib/fishSpecies';
import { getSpeciesImage } from '../lib/images';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SpeciesInput({ value, onChange }: Props) {
  const [settings] = useSettings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const catches = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.filter((c) => !c.deleted);
    },
    [],
  ) ?? [];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Build a frequency map from user's catches
    const counts = new Map<string, number>();
    for (const s of settings.favouriteSpecies) counts.set(s, 1000);
    for (const c of catches) {
      if (!c.species) continue;
      counts.set(c.species, (counts.get(c.species) ?? 0) + 1);
    }

    // Get database matches
    const dbMatches = q ? searchSpecies(q) : FISH_SPECIES.slice(0, 8);
    const dbNames = new Set(dbMatches.map((s) => s.name));

    // Get user history matches (not already in db results)
    const userMatches = q
      ? [...counts.entries()].filter(([s]) => s.toLowerCase().includes(q) && !dbNames.has(s))
      : [...counts.entries()].filter(([s]) => !dbNames.has(s));

    // Combine: db results first (sorted by relevance), then user history
    const combined: { name: string; fromDb: boolean; count: number }[] = [
      ...dbMatches.map((s) => ({ name: s.name, fromDb: true, count: counts.get(s.name) ?? 0 })),
      ...userMatches.map(([s, c]) => ({ name: s, fromDb: false, count: c })),
    ];

    // Sort: favourites/high-count first within db results, then alphabetical
    return combined
      .sort((a, b) => {
        if (a.fromDb && b.fromDb) {
          if (b.count !== a.count) return b.count - a.count;
          return a.name.localeCompare(b.name);
        }
        if (a.fromDb && !b.fromDb) return -1;
        if (!a.fromDb && b.fromDb) return 1;
        return b.count - a.count;
      })
      .slice(0, 8)
      .map((s) => s.name);
  }, [catches, settings.favouriteSpecies, query]);

  return (
    <div ref={ref} className="relative">
      <label className="label">Species</label>
      <div className="relative">
        <input
          className="field pr-9"
          placeholder="What did you catch?"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoCapitalize="words"
        />
        <ChevronDown
          size={18}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--c-ink-3)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl"
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-line)',
            boxShadow: 'var(--shadow-float)',
          }}
        >
          {suggestions.map((s) => {
            const img = getSpeciesImage(s);
            return (
              <button
                key={s}
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors active:bg-surface-3"
                style={{
                  background: value === s ? 'var(--c-accent-bg)' : 'transparent',
                  color: value === s ? 'var(--c-accent)' : 'var(--c-ink)',
                }}
                onClick={() => {
                  onChange(s);
                  setQuery(s);
                  setOpen(false);
                }}
              >
                <span className="flex items-center gap-2.5">
                  {img && <img src={img} alt={s} className="h-8 w-8 rounded-lg object-cover" />}
                  <span>{s}</span>
                </span>
                {value === s && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
