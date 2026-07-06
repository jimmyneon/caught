import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles, X } from 'lucide-react';
import { db } from '../db';
import type { CatchRecord, WaterType } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useLiveQuery } from 'dexie-react-hooks';
import { getSpeciesImage } from '../lib/images';
import SpeciesInput from './SpeciesInput';
import WeightInput from './WeightInput';
import MethodSelect from './MethodSelect';
import BaitSelect from './BaitSelect';
import SelectDropdown from './SelectDropdown';
import { getWaterImage } from '../lib/images';

const WATER_TYPES: WaterType[] = ['sea', 'river', 'lake', 'canal', 'reservoir', 'pond', 'stream', 'estuary', 'stillwater', 'loch'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QuickFillSheet({ open, onClose }: Props) {
  const [settings] = useSettings();
  const [idx, setIdx] = useState(0);
  const [rec, setRec] = useState<CatchRecord | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const incompleteCatches = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.filter((c) => !c.complete && !c.deleted).sort((a, b) => b.createdAt - a.createdAt);
    },
    [],
  ) ?? [];

  // Completed catches for smart suggestions
  const completedCatches = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.filter((c) => c.complete && !c.deleted);
    },
    [],
  ) ?? [];

  // Build suggestions per water type
  const suggestions = useMemo(() => {
    const byWaterType = new Map<string, { species: string; method: string; baitSubType: string }[]>();
    for (const c of completedCatches) {
      const wt = c.waterType ?? 'unknown';
      if (!byWaterType.has(wt)) byWaterType.set(wt, []);
      byWaterType.get(wt)!.push({ species: c.species ?? '', method: c.method ?? '', baitSubType: c.baitSubType ?? '' });
    }

    const result = new Map<string, { species?: string; method?: string; baitSubType?: string }>();
    for (const [wt, catches] of byWaterType) {
      const sc = new Map<string, number>();
      const mc = new Map<string, number>();
      const bc = new Map<string, number>();
      for (const c of catches) {
        if (c.species) sc.set(c.species, (sc.get(c.species) ?? 0) + 1);
        if (c.method) mc.set(c.method, (mc.get(c.method) ?? 0) + 1);
        if (c.baitSubType) bc.set(c.baitSubType, (bc.get(c.baitSubType) ?? 0) + 1);
      }
      result.set(wt, {
        species: [...sc.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
        method: [...mc.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
        baitSubType: [...bc.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
      });
    }
    return result;
  }, [completedCatches]);

  // Clamp index and load current catch
  const clampedIdx = Math.min(idx, Math.max(0, incompleteCatches.length - 1));
  const currentId = incompleteCatches[clampedIdx]?.id;

  useEffect(() => {
    if (!open) { setIdx(0); setRec(null); return; }
    setIdx(0);
  }, [open]);

  useEffect(() => {
    if (!currentId) { setRec(null); return; }
    db.catches.get(currentId).then((r) => {
      if (r) {
        if (!r.waterType && settings.defaultWaterType) {
          r = { ...r, waterType: settings.defaultWaterType };
        }
        setRec(r);
      }
    });
  }, [currentId, settings.defaultWaterType]);

  const patch = useCallback((p: Partial<CatchRecord>) => {
    setRec((prev) => prev ? { ...prev, ...p } : prev);
  }, []);

  const saveCurrent = useCallback(async () => {
    if (!rec) return;
    const isComplete = !!(rec.species && rec.weightKg != null);
    await db.catches.put({ ...rec, complete: isComplete, syncedAt: 0 });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 800);
  }, [rec]);

  const saveAndNext = useCallback(async () => {
    await saveCurrent();
    if (clampedIdx < incompleteCatches.length - 1) {
      setIdx(clampedIdx + 1);
    } else {
      onClose();
    }
  }, [saveCurrent, clampedIdx, incompleteCatches.length, onClose]);

  const applySuggestion = useCallback(() => {
    if (!rec) return;
    const s = rec.waterType ? suggestions.get(rec.waterType) : undefined;
    if (!s) return;
    const p: Partial<CatchRecord> = {};
    if (!rec.species && s.species) p.species = s.species;
    if (!rec.method && s.method) p.method = s.method;
    if (!rec.baitSubType && s.baitSubType) p.baitSubType = s.baitSubType;
    if (Object.keys(p).length > 0) patch(p);
  }, [rec, suggestions, patch]);

  if (!open || incompleteCatches.length === 0) return null;

  const total = incompleteCatches.length;
  const suggestion = rec?.waterType ? suggestions.get(rec.waterType) : undefined;
  const hasSuggestion = suggestion && rec && (
    (suggestion.species && !rec.species) ||
    (suggestion.method && !rec.method) ||
    (suggestion.baitSubType && !rec.baitSubType)
  );

  return (
    <div className="fixed inset-0 z-2000 flex flex-col" style={{ background: 'var(--c-surface)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[calc(0.5rem+env(safe-area-inset-top))]">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: 'var(--c-surface-3)' }}
        >
          <X size={20} style={{ color: 'var(--c-ink-2)' }} />
        </button>
        <div className="text-sm font-bold text-ink">
          {clampedIdx + 1} of {total}
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="mx-4 mt-2 h-1 rounded-full" style={{ background: 'var(--c-surface-3)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${((clampedIdx + 1) / total) * 100}%`,
            background: 'var(--c-accent)',
          }}
        />
      </div>

      {/* Content */}
      {rec && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-3">
            {/* Fish image + date */}
            <div className="flex items-center gap-3">
              {(() => {
                const img = getSpeciesImage(rec.species ?? '');
                return img ? (
                  <img src={img} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'var(--c-accent-bg)' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--c-accent)' }}>?</span>
                  </div>
                );
              })()}
              <div>
                <div className="text-sm font-bold text-ink">{rec.species || 'Unknown fish'}</div>
                <div className="text-xs text-ink-3">
                  {new Date(rec.createdAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Smart suggestion banner */}
            {hasSuggestion && (
              <button
                className="flex items-center gap-2 rounded-xl p-3 text-left transition-colors active:scale-[0.98]"
                style={{ background: 'var(--c-accent-bg)', border: '1px solid var(--c-accent)' }}
                onClick={applySuggestion}
              >
                <Sparkles size={16} style={{ color: 'var(--c-accent)' }} />
                <div className="flex-1">
                  <div className="text-xs font-bold" style={{ color: 'var(--c-accent)' }}>Quick-fill from past catches</div>
                  <div className="text-xs text-ink-3 mt-0.5">
                    {[suggestion?.species, suggestion?.method, suggestion?.baitSubType].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--c-accent)' }}>Apply →</span>
              </button>
            )}

            {/* Species */}
            <SpeciesInput
              value={rec.species ?? ''}
              onChange={(species) => patch({ species })}
              waterType={rec.waterType}
            />

            {/* Water type */}
            <SelectDropdown
              label="Water type"
              placeholder="Select water type"
              options={WATER_TYPES.map((w) => ({ value: w, label: w, image: getWaterImage(w) ?? undefined }))}
              value={rec.waterType}
              onChange={(w) => patch({ waterType: w as WaterType | undefined })}
              capitalize
            />

            {/* Method */}
            <MethodSelect
              value={rec.method}
              species={rec.species}
              waterType={rec.waterType}
              onChange={(method) => patch({ method })}
            />

            {/* Bait */}
            <BaitSelect
              value={rec.baitSubType}
              method={rec.method}
              species={rec.species}
              waterType={rec.waterType}
              onChange={(baitSubType) => patch({ baitSubType })}
            />

            {/* Weight */}
            <WeightInput
              valueKg={rec.weightKg}
              units={settings.units}
              onChange={(weightKg) => patch({ weightKg })}
            />

            {/* Kept / Released */}
            <div>
              <label className="label">Kept or released</label>
              <div className="flex gap-2">
                {([true, false] as const).map((kept) => (
                  <button
                    key={String(kept)}
                    type="button"
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95"
                    style={
                      rec.kept === kept
                        ? { background: 'var(--c-accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }
                        : { background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }
                    }
                    onClick={() => patch({ kept: rec.kept === kept ? undefined : kept })}
                  >
                    {kept ? 'Kept' : 'Released'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer: prev / save / next */}
      {rec && (
        <div
          className="flex items-center gap-2 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
          style={{ borderTop: '1px solid var(--c-line)', background: 'var(--c-surface)' }}
        >
          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors active:scale-95"
            style={{
              background: 'var(--c-surface-3)',
              color: 'var(--c-ink-2)',
              opacity: clampedIdx > 0 ? 1 : 0.3,
            }}
            disabled={clampedIdx === 0}
            onClick={() => setIdx(Math.max(0, clampedIdx - 1))}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-95"
            style={{
              background: savedFlash ? 'var(--c-accent)' : 'var(--c-surface-3)',
              color: savedFlash ? '#fff' : 'var(--c-ink)',
            }}
            onClick={saveCurrent}
          >
            {savedFlash ? (
              <><Check size={18} /> Saved</>
            ) : (
              'Save'
            )}
          </button>

          <button
            className="flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold transition-all active:scale-95"
            style={{
              background: 'var(--c-accent)',
              color: '#fff',
              boxShadow: 'var(--shadow-accent)',
            }}
            onClick={saveAndNext}
          >
            {clampedIdx < total - 1 ? (
              <>Next <ChevronRight size={18} /></>
            ) : (
              <><Check size={18} /> Done</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
