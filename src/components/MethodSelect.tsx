import { useState, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { useSettings } from '../hooks/useSettings';
import { getMethodImage, getFilteredMethods, getMethodSubTypes, METHOD_CATEGORIES, type BaitMethod } from '../lib/baitMethods';

interface Props {
  value: string | undefined;
  subType?: string;
  species?: string;
  waterType?: string;
  onChange: (v: string | undefined) => void;
  onSubTypeChange?: (v: string | undefined) => void;
  allowCustom?: boolean;
}

export default function MethodSelect({ value, subType, species, waterType, onChange, onSubTypeChange, allowCustom = true }: Props) {
  const [settings] = useSettings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const favouriteBaits = settings.favouriteBaits ?? [];

  const grouped = useMemo(() => {
    const methods = getFilteredMethods(species, waterType);
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
    // Sort favourite baits first within each category
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
  }, [species, waterType, query, favouriteBaits]);

  const [showSubTypes, setShowSubTypes] = useState(false);

  const displayValue = value
    ? (subType ? `${value} — ${subType}` : value)
    : 'Select method';

  const subTypes = value ? getMethodSubTypes(value) : [];

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

      <BottomSheet open={open} onClose={() => { setOpen(false); setQuery(''); setCustomMode(false); setShowSubTypes(false); }}>
        <div className="flex flex-col gap-3">
          <h2 className="pb-1 text-lg font-extrabold text-ink">
            {showSubTypes ? `${value} — select type` : 'Method / bait'}
          </h2>

          {showSubTypes && (
            <button
              className="flex items-center gap-2 text-sm font-bold text-ink-3"
              onClick={() => setShowSubTypes(false)}
            >
              <ChevronDown size={16} /> Back to methods
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
              {allowCustom && (
                <button
                  type="button"
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium"
                  style={{ color: 'var(--c-ink-3)', background: 'var(--c-surface-3)' }}
                  onClick={() => {
                    const custom = prompt(`Custom ${value} type:`);
                    if (custom?.trim()) {
                      onSubTypeChange?.(custom.trim());
                      setOpen(false);
                      setShowSubTypes(false);
                    }
                  }}
                >
                  + Custom…
                </button>
              )}
            </div>
          )}

          {!showSubTypes && (
            <>
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
                              onSubTypeChange?.(undefined);
                              if (m.collective && m.subTypes && m.subTypes.length > 0) {
                                setShowSubTypes(true);
                              } else {
                                setOpen(false);
                                setQuery('');
                              }
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
            </>
          )}

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
