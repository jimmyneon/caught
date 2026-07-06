import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Star, X } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { searchBaits, type BaitEntry } from '../lib/baitData';

interface Props {
  value: string | undefined;
  method?: string;
  species?: string;
  waterType?: string;
  onChange: (v: string | undefined) => void;
}

// Map method (technique) to bait categories
const METHOD_CATEGORIES: Record<string, BaitEntry['category'][]> = {
  'Float': ['bait'],
  'Pole Float': ['bait'],
  'Waggler': ['bait'],
  'Stick Float': ['bait'],
  'Slider Float': ['bait'],
  'Controller': ['bait'],
  'Ledger': ['bait'],
  'Feeder': ['bait'],
  'Method Feeder': ['bait'],
  'Bomb': ['bait'],
  'Link Ledger': ['bait'],
  'Helicopter Rig': ['bait'],
  'PVA Bag': ['bait'],
  'Spinning': ['lure'],
  'Trolling': ['lure'],
  'Fly Fishing': ['fly'],
  'Freelining': ['bait'],
  'Surface': ['bait'],
};

// Species → bait categories
const SPECIES_CATEGORIES: Record<string, BaitEntry['category'][]> = {
  'rainbow trout': ['fly', 'bait'],
  'brown trout': ['fly', 'bait'],
  'sea trout': ['fly', 'lure', 'bait'],
  'brook trout': ['fly', 'bait'],
  'salmon': ['fly', 'lure'],
  'grayling': ['fly', 'bait'],
  'carp': ['bait'],
  'mirror carp': ['bait'],
  'leather carp': ['bait'],
  'crucian carp': ['bait'],
  'tench': ['bait'],
  'bream': ['bait'],
  'roach': ['bait'],
  'rudd': ['bait'],
  'perch': ['bait', 'lure'],
  'pike': ['lure', 'bait'],
  'zander': ['lure', 'bait'],
  'chub': ['bait', 'lure'],
  'dace': ['bait', 'fly'],
  'barbel': ['bait'],
  'wels catfish': ['bait'],
  'bass': ['lure', 'bait'],
  'cod': ['bait'],
  'pollack': ['lure', 'fly'],
  'mackerel': ['lure', 'bait'],
  'wrasse': ['bait', 'lure'],
  'ballan wrasse': ['bait', 'lure'],
  'flounder': ['bait'],
  'plaice': ['bait'],
  'mullet': ['bait', 'fly'],
};

// Water type → bait categories
const WATER_CATEGORIES: Record<string, BaitEntry['category'][]> = {
  'sea': ['bait', 'lure'],
  'river': ['bait', 'lure', 'fly'],
  'lake': ['bait', 'lure', 'fly'],
  'canal': ['bait', 'lure'],
  'reservoir': ['fly', 'lure', 'bait'],
  'pond': ['bait', 'lure'],
  'stream': ['fly', 'bait'],
  'estuary': ['bait', 'lure', 'fly'],
  'stillwater': ['fly', 'lure', 'bait'],
  'loch': ['fly', 'lure', 'bait'],
};

export default function BaitSelect({ value, method, species, waterType, onChange }: Props) {
  const [settings] = useSettings();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value ?? '');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const favouriteBaits = settings.favouriteBaits ?? [];

  // Get suggestions based on input + filters
  const suggestions = useMemo(() => {
    let categories: BaitEntry['category'][] | undefined;

    if (method && METHOD_CATEGORIES[method]) {
      categories = METHOD_CATEGORIES[method];
    } else if (species) {
      const sc = SPECIES_CATEGORIES[species.toLowerCase().trim()];
      if (sc) categories = sc;
    } else if (waterType) {
      const wc = WATER_CATEGORIES[waterType.toLowerCase()];
      if (wc) categories = wc;
    }

    const cat = categories?.length === 1 ? categories[0] : undefined;
    const results = searchBaits(input, cat, 30);

    if (categories && categories.length > 1) {
      return results.filter((r) => categories!.includes(r.category));
    }

    return results;
  }, [input, method, species, waterType]);

  // Sort: favourites first
  const sortedSuggestions = useMemo(() => {
    return [...suggestions].sort((a, b) => {
      const aFav = favouriteBaits.includes(a.name) ? 0 : 1;
      const bFav = favouriteBaits.includes(b.name) ? 0 : 1;
      return aFav - bFav;
    });
  }, [suggestions, favouriteBaits]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      setHighlightIdx(0);
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) {
      setInput(value ?? '');
    }
  }, [value, editing]);

  const selectBait = (name: string) => {
    onChange(name);
    setInput(name);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, sortedSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sortedSuggestions[highlightIdx]) {
        selectBait(sortedSuggestions[highlightIdx].name);
      } else if (input.trim()) {
        selectBait(input.trim());
      }
    } else if (e.key === 'Escape') {
      setEditing(false);
      setInput(value ?? '');
    }
  };

  const isFavourite = value && favouriteBaits.includes(value);

  if (!editing) {
    return (
      <div>
        <label className="label">Bait</label>
        <button
          type="button"
          className="field flex items-center justify-between"
          onClick={() => setEditing(true)}
          style={{ color: value ? 'var(--c-ink)' : 'var(--c-ink-3)' }}
        >
          <span className="flex items-center gap-2">
            {isFavourite && <Star size={14} className="fill-current" style={{ color: 'var(--c-accent)' }} />}
            {value ?? 'Type to search…'}
          </span>
          <Search size={16} style={{ color: 'var(--c-ink-3)' }} />
        </button>
      </div>
    );
  }

  const hasCustomOption = input.trim() && !sortedSuggestions.some((s) => s.name.toLowerCase() === input.trim().toLowerCase());

  return (
    <div>
      <label className="label">Bait</label>
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: 'var(--c-surface-3)' }}>
          <Search size={16} style={{ color: 'var(--c-ink-3)' }} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent py-3 text-sm outline-none"
            placeholder="Type bait name…"
            value={input}
            onChange={(e) => { setInput(e.target.value); setHighlightIdx(0); }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setTimeout(() => setEditing(false), 150);
            }}
          />
          {input && (
            <button
              type="button"
              onClick={() => { setInput(''); inputRef.current?.focus(); }}
              className="text-ink-3"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {editing && (sortedSuggestions.length > 0 || hasCustomOption) && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border shadow-lg"
            style={{
              background: 'var(--c-surface-2)',
              borderColor: 'var(--c-line)',
            }}
          >
            {sortedSuggestions.map((bait, idx) => {
              const isFav = favouriteBaits.includes(bait.name);
              const isHighlighted = idx === highlightIdx;
              const isSelected = bait.name === value;
              return (
                <button
                  key={bait.name}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors"
                  style={{
                    background: isHighlighted ? 'var(--c-surface-3)' : 'transparent',
                    color: isSelected ? 'var(--c-accent)' : 'var(--c-ink)',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectBait(bait.name);
                  }}
                  onMouseEnter={() => setHighlightIdx(idx)}
                >
                  <span className="flex items-center gap-2">
                    {isFav && <Star size={12} className="fill-current" style={{ color: 'var(--c-accent)' }} />}
                    <span className="font-medium">{bait.name}</span>
                    <span className="text-xs text-ink-3 capitalize">{bait.category}</span>
                  </span>
                  {isSelected && <span className="text-xs font-bold" style={{ color: 'var(--c-accent)' }}>✓</span>}
                </button>
              );
            })}
            {hasCustomOption && (
              <button
                type="button"
                className="flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors"
                style={{
                  background: highlightIdx === sortedSuggestions.length ? 'var(--c-surface-3)' : 'transparent',
                  color: 'var(--c-ink-2)',
                  borderTop: '1px solid var(--c-line)',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectBait(input.trim());
                }}
                onMouseEnter={() => setHighlightIdx(sortedSuggestions.length)}
              >
                <span className="font-medium">Use "{input.trim()}"</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
