import { useState, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { getMethodImage, getFilteredMethods, METHOD_CATEGORIES, type BaitMethod } from '../lib/baitMethods';

interface Props {
  value: string | undefined;
  species?: string;
  onChange: (v: string | undefined) => void;
  allowCustom?: boolean;
}

export default function MethodSelect({ value, species, onChange, allowCustom = true }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const grouped = useMemo(() => {
    const methods = getFilteredMethods(species);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? methods.filter((m) =>
          m.name.toLowerCase().includes(q) ||
          m.aliases?.some((a) => a.toLowerCase().includes(q))
        )
      : methods;

    const map = new Map<string, BaitMethod[]>();
    for (const m of filtered) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return METHOD_CATEGORIES
      .filter((c) => map.has(c.key))
      .map((c) => ({ ...c, items: map.get(c.key)! }));
  }, [species, query]);

  const displayValue = value ?? 'Select method';

  return (
    <div>
      <label className="label">Method / bait</label>
      <button
        type="button"
        className="field flex items-center justify-between"
        onClick={() => setOpen(true)}
        style={{ color: value ? 'var(--c-ink)' : 'var(--c-ink-3)' }}
      >
        <span>{displayValue}</span>
        <ChevronDown size={18} style={{ color: 'var(--c-ink-3)' }} />
      </button>

      <BottomSheet open={open} onClose={() => { setOpen(false); setQuery(''); setCustomMode(false); }}>
        <div className="flex flex-col gap-3">
          <h2 className="pb-1 text-lg font-extrabold text-ink">Method / bait</h2>

          {species && (
            <div className="rounded-lg px-3 py-2 text-xs font-medium text-ink-3" style={{ background: 'var(--c-surface-3)' }}>
              Showing methods for {species}
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

          {/* Grouped options */}
          <div className="flex flex-col gap-4">
            {grouped.map((group) => (
              <div key={group.key}>
                <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-3">{group.label}</div>
                <div className="flex flex-col gap-1.5">
                  {group.items.map((m) => {
                    const img = getMethodImage(m.name);
                    return (
                      <button
                        key={m.name}
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors active:bg-surface-3"
                        style={{
                          background: value === m.name ? 'var(--c-accent-bg)' : 'var(--c-surface-3)',
                          color: value === m.name ? 'var(--c-accent)' : 'var(--c-ink)',
                        }}
                        onClick={() => {
                          onChange(m.name);
                          setOpen(false);
                          setQuery('');
                        }}
                      >
                        <span className="flex items-center gap-2.5">
                          {img && <img src={img} alt={m.name} className="h-8 w-8 rounded-lg object-cover" />}
                          <span>{m.name}</span>
                        </span>
                        {value === m.name && <Check size={18} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {allowCustom && (
            <>
              {!customMode ? (
                <button
                  type="button"
                  className="rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors active:bg-surface-3"
                  style={{ color: 'var(--c-ink-3)', background: 'var(--c-surface-3)' }}
                  onClick={() => setCustomMode(true)}
                >
                  + Custom…
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    className="field"
                    placeholder="Type your own method…"
                    value={customValue}
                    autoFocus
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customValue.trim()) {
                        onChange(customValue.trim());
                        setOpen(false);
                        setCustomMode(false);
                        setCustomValue('');
                      }
                    }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (customValue.trim()) {
                        onChange(customValue.trim());
                        setOpen(false);
                        setCustomMode(false);
                        setCustomValue('');
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
