import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileDown, FileText, List, LayoutGrid, Fish, Pencil, Trash2 } from 'lucide-react';
import { db } from '../db';
import { useSettings } from '../hooks/useSettings';
import type { CatchRecord, Settings } from '../types';
import CatchCard from '../components/CatchCard';
import BottomSheet from '../components/BottomSheet';
import { EmptyState } from '../components/EmptyState';
import { softDeleteCatch } from '../lib/sync';
import { exportCSV, exportPDF } from '../lib/export';
import { formatWeight } from '../lib/units';
import { fmtDate } from '../lib/format';
import { getSpeciesImage } from '../lib/images';

export default function LogPage() {
  const [settings] = useSettings();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem('caught_log_view') as 'list' | 'grid') ?? 'list';
  });

  const toggleView = () => {
    const next = view === 'list' ? 'grid' : 'list';
    setView(next);
    localStorage.setItem('caught_log_view', next);
  };
  const filter = params.get('filter') ?? 'all';

  const catches = useLiveQuery(
    async () => {
      try {
        const all = await db.catches.toArray();
        return all
          .filter((c) => !c.deleted)
          .sort((a, b) => b.createdAt - a.createdAt);
      } catch (err) {
        console.error('[LogPage] db query error:', err);
        return [];
      }
    },
    [],
  ) ?? [];
  const shown = filter === 'incomplete' ? catches.filter((c) => !c.complete) : catches;

  return (
    <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-20">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight text-ink">Catch log</h1>
        <div className="flex gap-1">
          <button
            className="rounded-full p-2 text-ink-3 transition-colors active:bg-surface-3"
            onClick={() => toggleView()}
            aria-label="Toggle view"
          >
            {view === 'list' ? <LayoutGrid size={20} /> : <List size={20} />}
          </button>
          <button
            className="rounded-full p-2 text-ink-3 transition-colors active:bg-surface-3"
            onClick={() => exportCSV(catches)}
            aria-label="Export CSV"
          >
            <FileDown size={20} />
          </button>
          <button
            className="rounded-full p-2 text-ink-3 transition-colors active:bg-surface-3"
            onClick={() => exportPDF(catches, settings)}
            aria-label="Export PDF"
          >
            <FileText size={20} />
          </button>
        </div>
      </header>

      <div className="mb-4 flex gap-2">
        {(['all', 'incomplete'] as const).map((f) => (
          <button
            key={f}
            className="rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95"
            style={
              filter === f
                ? { background: 'var(--c-accent)', color: '#fff' }
                : { background: 'var(--c-surface-3)', color: 'var(--c-ink-3)' }
            }
            onClick={() => setParams(f === 'all' ? {} : { filter: f })}
          >
            {f === 'all' ? 'All catches' : 'Incomplete'}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon="log"
          title={filter === 'incomplete' ? 'Nothing to finish' : 'No catches yet'}
          message={filter === 'incomplete' ? 'All your catches are complete.' : 'Tap the Caught button on the home screen to log your first catch.'}
        />
      ) : view === 'list' ? (
        <div className="flex flex-col gap-3 pb-4">
          {shown.map((c) => (
            <CatchCard key={c.id} record={c} settings={settings} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-4">
          {shown.map((c) => (
            <CatchGridCard key={c.id} record={c} settings={settings} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatchGridCard({ record, settings }: { record: CatchRecord; settings: Settings }) {
  const [showDetail, setShowDetail] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  const startLongPress = () => {
    longPressTimer.current = window.setTimeout(() => setShowQuickMenu(true), 500);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  return (
    <>
      <div
        className="card relative cursor-pointer overflow-hidden transition-transform active:scale-[0.98]"
        style={{ minHeight: '8rem' }}
        onClick={() => setShowDetail(true)}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        onContextMenu={(e) => { e.preventDefault(); setShowQuickMenu(true); }}
      >
        {(() => {
          const img = getSpeciesImage(record.species ?? '');
          return img ? (
            <img src={img} alt={record.species ?? ''} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--c-accent-bg)' }}>
              <Fish size={32} strokeWidth={1.8} style={{ color: 'var(--c-accent)' }} />
            </div>
          );
        })()}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="relative flex h-full min-h-[8rem] flex-col justify-end p-3">
          <div className="truncate text-sm font-bold text-white drop-shadow-md">
            {record.species || 'Unknown fish'}
          </div>
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>{fmtDate(record.createdAt)}</span>
            {record.weightKg != null && (
              <span className="font-bold">{formatWeight(record.weightKg, settings.units)}</span>
            )}
          </div>
        </div>
      </div>

      <BottomSheet open={showDetail} onClose={() => setShowDetail(false)}>
        <div className="flex flex-col gap-5">
          {/* Big fish image as header background */}
          {(() => {
            const img = getSpeciesImage(record.species ?? '');
            return img ? (
              <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: '14rem' }}>
                <img src={img} alt={record.species ?? ''} className="h-full w-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
                <div className="absolute bottom-3 left-4 text-xl font-extrabold text-white drop-shadow-md">
                  {record.species || 'Unknown fish'}
                </div>
              </div>
            ) : (
              <button
                className="text-left text-xl font-extrabold text-ink"
                onClick={() => { setShowDetail(false); navigate(`/catch/${record.id}`); }}
              >
                {record.species || 'Unknown fish'}
              </button>
            );
          })()}
          <div className="flex items-center gap-3 text-sm">
            {record.weightKg != null && (
              <span className="font-bold" style={{ color: 'var(--c-accent)' }}>
                {formatWeight(record.weightKg, settings.units)}
              </span>
            )}
            {record.waterType && <span className="capitalize text-ink-3">{record.waterType}</span>}
          </div>
          {record.method && <div className="text-sm text-ink-2">{record.method}</div>}
          {record.notes && (
            <div className="rounded-xl p-3 text-sm text-ink-2" style={{ background: 'var(--c-surface-3)' }}>
              {record.notes}
            </div>
          )}
          <button
            className="btn-secondary flex items-center justify-center gap-2"
            onClick={() => { setShowDetail(false); navigate(`/catch/${record.id}`); }}
          >
            <Pencil size={16} /> Edit
          </button>
        </div>
      </BottomSheet>

      <BottomSheet open={showQuickMenu} onClose={() => setShowQuickMenu(false)}>
        <div className="flex flex-col gap-2">
          <h2 className="mb-2 text-lg font-extrabold text-ink">
            {record.species || 'Unknown fish'}
          </h2>
          <button
            className="flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold text-ink transition-colors active:bg-surface-3"
            style={{ background: 'var(--c-surface-3)' }}
            onClick={() => { setShowQuickMenu(false); navigate(`/catch/${record.id}`); }}
          >
            <Pencil size={18} style={{ color: 'var(--c-accent)' }} /> Edit catch
          </button>
          <button
            className="flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold transition-colors active:bg-surface-3"
            style={{ background: 'var(--c-red-soft)', color: 'var(--c-red-accent)' }}
            onClick={() => { setShowQuickMenu(false); softDeleteCatch(record.id); }}
          >
            <Trash2 size={18} /> Delete catch
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
