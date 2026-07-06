import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { db } from '../db';
import type { CatchRecord, WaterType } from '../types';
import { useSettings } from '../hooks/useSettings';
import { fmtDate } from '../lib/format';
import SpeciesInput from '../components/SpeciesInput';
import WeightInput from '../components/WeightInput';
import SelectDropdown from '../components/SelectDropdown';
import ConditionsGrid from '../components/ConditionsGrid';
import LocationPicker from '../components/LocationPicker';

const WATER_TYPES: WaterType[] = ['sea', 'river', 'lake', 'canal', 'reservoir'];

const METHODS = [
  'Lure',
  'Fly',
  'Float',
  'Ledger',
  'Bait',
];

export default function CatchEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settings] = useSettings();
  const [rec, setRec] = useState<CatchRecord | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    db.catches.get(id!).then((r) => {
      if (r) {
        // Auto-fill water type from settings if not already set
        if (!r.waterType && settings.defaultWaterType) {
          r = { ...r, waterType: settings.defaultWaterType };
        }
        setRec(r);
        if (r.method || r.waterType || r.kept != null || r.notes) {
          setShowMore(true);
        }
      } else {
        setRec(null);
      }
    });
  }, [id, settings.defaultWaterType]);

  // Auto-save: debounced write to db whenever rec changes
  useEffect(() => {
    if (!rec) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      db.catches.put({ ...rec, complete: true });
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [rec]);

  if (!rec) return <div className="p-6 text-sm text-ink-3">Loading…</div>;

  const patch = (p: Partial<CatchRecord>) => setRec({ ...rec, ...p });

  const remove = async () => {
    if (confirm('Delete this catch?')) {
      await db.catches.delete(rec.id);
      navigate('/log');
    }
  };

  return (
    <div className="px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-20">
      {/* Grab handle + date — matches BottomSheet style */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <button
          className="flex items-center justify-center pt-2 pb-1"
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--c-line)' }} />
        </button>
        <div className="text-sm font-bold text-ink-3">{fmtDate(rec.createdAt)}</div>
      </div>

      <div className="flex flex-col gap-4 pb-24">
        <SpeciesInput value={rec.species ?? ''} onChange={(species) => patch({ species })} />

        <WeightInput
          valueKg={rec.weightKg}
          units={settings.units}
          onChange={(weightKg) => patch({ weightKg })}
        />

        {/* Kept / Released — always visible */}
        <div>
          <label className="label">Kept or released</label>
          <div className="flex gap-2">
            {([true, false] as const).map((kept) => (
              <button
                key={String(kept)}
                type="button"
                className="flex-1 rounded-xl py-3 text-sm font-bold transition-all active:scale-95"
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

        <button className="btn-primary" onClick={() => navigate(-1)}>
          Done
        </button>

        {/* Location with map picker */}
        <div>
          <label className="label">Location</label>
          <LocationPicker
            lat={rec.lat}
            lon={rec.lon}
            onChange={(lat, lon) => patch({ lat, lon })}
          />
        </div>

        {/* Collapsible: More details */}
        <button
          className="card flex items-center justify-between p-3.5 active:scale-[0.98] transition-transform"
          onClick={() => setShowMore(!showMore)}
        >
          <span className="font-bold text-ink-2 text-sm">More details</span>
          {showMore ? <ChevronUp size={18} className="text-ink-3" /> : <ChevronDown size={18} className="text-ink-3" />}
        </button>

        {showMore && (
          <div className="flex animate-fade-in flex-col gap-4">
            {/* Method dropdown */}
            <SelectDropdown
              label="Method / bait"
              placeholder="Select method"
              options={METHODS.map((m) => ({ value: m, label: m }))}
              value={rec.method}
              onChange={(method) => patch({ method })}
              allowCustom
              customPlaceholder="Type your own method…"
            />

            {/* Water type dropdown */}
            <SelectDropdown
              label="Water type"
              placeholder="Select water type"
              options={WATER_TYPES.map((w) => ({ value: w, label: w }))}
              value={rec.waterType}
              onChange={(w) => patch({ waterType: w as WaterType | undefined })}
              capitalize
            />

            {/* Notes */}
            <div>
              <label className="label">Notes</label>
              <textarea
                className="field min-h-20"
                placeholder="Anything worth remembering? Spot, rig, depth, conditions…"
                value={rec.notes ?? ''}
                onChange={(e) => patch({ notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Collapsible: Conditions */}
        <button
          className="card flex items-center justify-between p-3.5 active:scale-[0.98] transition-transform"
          onClick={() => setShowConditions(!showConditions)}
        >
          <span className="font-bold text-ink-2 text-sm">Conditions</span>
          {showConditions ? <ChevronUp size={18} className="text-ink-3" /> : <ChevronDown size={18} className="text-ink-3" />}
        </button>
        {showConditions && (
          <div className="animate-fade-in">
            <ConditionsGrid conditions={rec.conditions} />
          </div>
        )}

        {/* Delete — subtle, at the bottom */}
        <button
          className="mt-2 flex items-center justify-center gap-2 py-3 text-sm font-medium text-ink-3 transition-colors active:text-ink-2"
          onClick={remove}
        >
          <Trash2 size={16} /> Delete catch
        </button>
      </div>
    </div>
  );
}
