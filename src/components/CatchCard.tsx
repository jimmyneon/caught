import { useState, useRef, useEffect } from 'react';
import { Fish, Pencil, Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CatchRecord, Settings } from '../types';
import { formatWeight } from '../lib/units';
import { fmtDate } from '../lib/format';
import { db } from '../db';
import BottomSheet from './BottomSheet';
import ConditionsSummary, { type CondItem } from './ConditionsSummary';
import { getSpeciesImage } from '../lib/images';

export default function CatchCard({ record, settings }: { record: CatchRecord; settings: Settings }) {
  const [showDetail, setShowDetail] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(false);
  const [speciesDraft, setSpeciesDraft] = useState(record.species ?? '');
  const [expandedCond, setExpandedCond] = useState<CondItem | null>(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showFishImage, setShowFishImage] = useState(false);
  const speciesRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editingSpecies && speciesRef.current) {
      speciesRef.current.focus();
      speciesRef.current.select();
    }
  }, [editingSpecies]);

  const saveSpecies = () => {
    const trimmed = speciesDraft.trim();
    if (trimmed !== (record.species ?? '')) {
      db.catches.update(record.id, { species: trimmed });
    }
    setEditingSpecies(false);
  };

  const startLongPress = () => {
    longPressTimer.current = window.setTimeout(() => setShowQuickMenu(true), 500);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  return (
    <>
      <div
        className="card flex cursor-pointer items-center gap-3 p-3.5 transition-transform active:scale-[0.98]"
        onClick={() => setShowDetail(true)}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        onContextMenu={(e) => { e.preventDefault(); setShowQuickMenu(true); }}
      >
        <div
          className="h-12 w-12 shrink-0 overflow-hidden rounded-xl"
          style={{ background: 'var(--c-accent-bg)' }}
        >
          {(() => {
            const img = getSpeciesImage(record.species ?? '');
            return img ? <img src={img} alt={record.species ?? ''} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Fish size={22} strokeWidth={1.8} style={{ color: 'var(--c-accent)' }} /></div>;
          })()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-base font-bold text-ink">
              {record.species || 'Unknown fish'}
            </span>
            <span className="shrink-0 text-xs text-ink-3">
              {fmtDate(record.createdAt)}
            </span>
          </div>
          {(record.weightKg != null || record.method) && (
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
              {record.weightKg != null && (
                <span className="font-bold" style={{ color: 'var(--c-accent)' }}>
                  {formatWeight(record.weightKg, settings.units)}
                </span>
              )}
              {record.method && <span className="truncate">{record.method}</span>}
            </div>
          )}
        </div>
      </div>

      <BottomSheet open={showDetail} onClose={() => { setShowDetail(false); setExpandedCond(null); }}>
        <div className="flex flex-col gap-5">
          {/* Big fish image as header background */}
          {(() => {
            const img = getSpeciesImage(record.species ?? '');
            return img ? (
              <button
                className="relative w-full overflow-hidden rounded-2xl active:scale-[0.98] transition-transform"
                style={{ height: '14rem' }}
                onClick={() => setShowFishImage(true)}
              >
                <img src={img} alt={record.species ?? ''} className="h-full w-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
                <div className="absolute bottom-3 left-4 text-xl font-extrabold text-white drop-shadow-md">
                  {record.species || 'Unknown fish'}
                </div>
              </button>
            ) : (
              <div className="text-lg font-extrabold text-ink">{record.species || 'Unknown fish'}</div>
            );
          })()}

          {/* Species — clickable to edit inline */}
          {editingSpecies ? (
            <div className="flex items-center gap-2">
              <input
                ref={speciesRef}
                className="flex-1 rounded-lg border-2 bg-transparent px-3 text-base font-bold outline-none"
                style={{ borderColor: 'var(--c-accent)', color: 'var(--c-ink)', height: '2.5rem' }}
                value={speciesDraft}
                onChange={(e) => setSpeciesDraft(e.target.value)}
                onBlur={saveSpecies}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveSpecies();
                  if (e.key === 'Escape') { setSpeciesDraft(record.species ?? ''); setEditingSpecies(false); }
                }}
                placeholder="Species name"
              />
              <button
                className="flex w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'var(--c-accent)', color: '#fff', height: '2.5rem' }}
                onClick={saveSpecies}
              >
                <Check size={18} />
              </button>
            </div>
          ) : (
            !getSpeciesImage(record.species ?? '') && (
              <button
                className="text-left text-lg font-extrabold text-ink"
                onClick={() => { setSpeciesDraft(record.species ?? ''); setEditingSpecies(true); }}
              >
                {record.species || 'Unknown fish'}
              </button>
            )
          )}

          {/* Weight + water type */}
          <div className="flex items-center gap-3 text-sm">
            {record.weightKg != null && (
              <span className="font-bold" style={{ color: 'var(--c-accent)' }}>
                {formatWeight(record.weightKg, settings.units)}
              </span>
            )}
            {record.waterType && (
              <span className="capitalize text-ink-3">{record.waterType}</span>
            )}
          </div>

          {/* Method */}
          {record.method && (
            <div className="text-sm text-ink-2">{record.method}</div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="rounded-xl p-3 text-sm text-ink-2" style={{ background: 'var(--c-surface-3)' }}>
              {record.notes}
            </div>
          )}

          {/* Conditions — icons only, tap to expand inline */}
          <div>
            <div className="label">Conditions</div>
            <ConditionsSummary conditions={record.conditions} onItemClick={(item: CondItem) => setExpandedCond(expandedCond === item ? null : item)} />
            {expandedCond && (
              <div className="mt-3 flex items-center gap-3 rounded-xl p-3 animate-fade-in" style={{ background: 'var(--c-surface-3)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--c-accent-bg)' }}>
                  <expandedCond.icon size={20} color="var(--c-accent)" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink-3">{expandedCond.label}</div>
                  <div className="text-sm font-bold text-ink">{expandedCond.value}</div>
                  <div className="text-xs text-ink-3">{expandedCond.detail}</div>
                </div>
              </div>
            )}
          </div>

          {/* Edit button */}
          <button
            className="btn-secondary flex items-center justify-center gap-2"
            onClick={() => {
              setShowDetail(false);
              navigate(`/catch/${record.id}`);
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        </div>
      </BottomSheet>

      {/* Long-press quick menu */}
      <BottomSheet open={showQuickMenu} onClose={() => setShowQuickMenu(false)}>
        <div className="flex flex-col gap-2">
          <h2 className="mb-2 text-lg font-extrabold text-ink">
            {record.species || 'Unknown fish'}
          </h2>
          <button
            className="flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold text-ink transition-colors active:bg-surface-3"
            style={{ background: 'var(--c-surface-3)' }}
            onClick={() => { setShowQuickMenu(false); setShowDetail(false); navigate(`/catch/${record.id}`); }}
          >
            <Pencil size={18} style={{ color: 'var(--c-accent)' }} /> Edit catch
          </button>
          <button
            className="flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold transition-colors active:bg-surface-3"
            style={{ background: 'var(--c-red-soft)', color: 'var(--c-red-accent)' }}
            onClick={() => { setShowQuickMenu(false); db.catches.delete(record.id); }}
          >
            <Trash2 size={18} /> Delete catch
          </button>
        </div>
      </BottomSheet>

      {/* Fish image enlarge overlay */}
      {showFishImage && (() => {
        const img = getSpeciesImage(record.species ?? '');
        return img ? (
          <div
            className="fixed inset-0 z-2000 flex items-center justify-center bg-black/90 animate-fade-in"
            onClick={() => setShowFishImage(false)}
          >
            <button
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
              onClick={() => setShowFishImage(false)}
            >
              <X size={24} />
            </button>
            <img src={img} alt={record.species ?? ''} className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
          </div>
        ) : null;
      })()}
    </>
  );
}
