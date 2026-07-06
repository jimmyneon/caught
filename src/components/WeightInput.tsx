import { useState } from 'react';
import { Minus, Plus, X, ChevronDown } from 'lucide-react';
import { kgToLbOz, lbOzToKg, formatWeight } from '../lib/units';
import BottomSheet from './BottomSheet';

interface Props {
  valueKg: number | undefined;
  units: 'metric' | 'imperial';
  onChange: (kg: number | undefined) => void;
}

function BigBtn({ icon: Icon, onClick, disabled }: { icon: typeof Plus; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-2xl transition-all active:scale-90 disabled:opacity-30"
      style={{ background: 'var(--c-accent-bg)', color: 'var(--c-accent)', width: '3.75rem', height: '3.75rem' }}
    >
      <Icon size={28} strokeWidth={2.5} />
    </button>
  );
}

function BigValue({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl" style={{ background: 'var(--c-surface-3)', height: '3.75rem' }}>
      <span className="text-xl font-extrabold leading-none text-ink tabular-nums">{value}</span>
      <span className="mt-0.5 text-[10px] font-bold text-ink-3">{unit}</span>
    </div>
  );
}

export default function WeightInput({ valueKg, units, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const initial = valueKg != null ? kgToLbOz(valueKg) : { lb: 0, oz: 0 };
  const [lb, setLb] = useState<number>(initial.lb);
  const [oz, setOz] = useState<number>(initial.oz);
  const hasValue = valueKg != null;

  // Sync local state when sheet opens
  const openSheet = () => {
    const init = valueKg != null ? kgToLbOz(valueKg) : { lb: 0, oz: 0 };
    setLb(init.lb);
    setOz(init.oz);
    setOpen(true);
  };

  const emit = (newLb: number, newOz: number) => {
    if (newLb === 0 && newOz === 0) onChange(undefined);
    else onChange(lbOzToKg(newLb, newOz));
  };

  const adjustLb = (delta: number) => {
    const next = Math.max(0, lb + delta);
    setLb(next);
    emit(next, oz);
  };

  const adjustOz = (delta: number) => {
    let nextOz = oz + delta;
    let nextLb = lb;
    if (nextOz >= 16) { nextLb += 1; nextOz -= 16; }
    else if (nextOz < 0) {
      if (nextLb > 0) { nextLb -= 1; nextOz += 16; }
      else { nextOz = 0; }
    }
    setLb(nextLb);
    setOz(nextOz);
    emit(nextLb, nextOz);
  };

  const clear = () => {
    setLb(0);
    setOz(0);
    onChange(undefined);
  };

  // Metric helpers
  const kg = valueKg ?? 0;
  const grams = Math.round((kg - Math.floor(kg)) * 1000);
  const wholeKg = Math.floor(kg);

  const adjustKg = (delta: number) => {
    const next = Math.max(0, Math.round((kg + delta) * 100) / 100);
    onChange(next === 0 ? undefined : next);
  };

  const adjustGrams = (delta: number) => {
    let nextG = grams + delta;
    let nextKg = wholeKg;
    if (nextG >= 1000) { nextKg += 1; nextG -= 1000; }
    else if (nextG < 0) {
      if (nextKg > 0) { nextKg -= 1; nextG += 1000; }
      else { nextG = 0; }
    }
    const next = nextKg + nextG / 1000;
    onChange(next === 0 ? undefined : Math.round(next * 1000) / 1000);
  };

  const displayValue = hasValue ? formatWeight(valueKg!, units) : 'Not set';

  return (
    <div>
      <label className="label">Weight</label>
      <button
        type="button"
        className="field flex items-center justify-between"
        onClick={openSheet}
      >
        <span style={{ color: hasValue ? 'var(--c-ink)' : 'var(--c-ink-3)' }}>{displayValue}</span>
        <ChevronDown size={18} style={{ color: 'var(--c-ink-3)' }} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Weight">
        <div className="flex flex-col gap-5">
          {/* Clear button */}
          {hasValue && (
            <button
              type="button"
              className="flex items-center gap-1 self-end text-xs font-bold text-ink-3"
              onClick={clear}
            >
              <X size={14} /> Clear
            </button>
          )}

          {units === 'metric' ? (
            <div className="rounded-2xl p-4" style={{ background: 'var(--c-surface-2)' }}>
              <div className="flex items-stretch gap-3">
                <div className="flex flex-1 flex-col items-center gap-2.5">
                  <BigBtn icon={Plus} onClick={() => adjustKg(1)} />
                  <BigValue value={String(wholeKg)} unit="kg" />
                  <BigBtn icon={Minus} onClick={() => adjustKg(-1)} disabled={wholeKg === 0} />
                </div>
                <div className="flex flex-1 flex-col items-center gap-2.5">
                  <BigBtn icon={Plus} onClick={() => adjustGrams(50)} />
                  <BigValue value={String(grams)} unit="g" />
                  <BigBtn icon={Minus} onClick={() => adjustGrams(-50)} disabled={wholeKg === 0 && grams === 0} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4" style={{ background: 'var(--c-surface-2)' }}>
              <div className="flex items-stretch gap-3">
                <div className="flex flex-1 flex-col items-center gap-2.5">
                  <BigBtn icon={Plus} onClick={() => adjustLb(1)} />
                  <BigValue value={String(lb)} unit="lb" />
                  <BigBtn icon={Minus} onClick={() => adjustLb(-1)} disabled={lb === 0} />
                </div>
                <div className="flex flex-1 flex-col items-center gap-2.5">
                  <BigBtn icon={Plus} onClick={() => adjustOz(1)} />
                  <BigValue value={String(oz)} unit="oz" />
                  <BigBtn icon={Minus} onClick={() => adjustOz(-1)} disabled={lb === 0 && oz === 0} />
                </div>
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={() => setOpen(false)}>Done</button>
        </div>
      </BottomSheet>
    </div>
  );
}
