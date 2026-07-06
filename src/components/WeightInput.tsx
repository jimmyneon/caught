import { useState, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { kgToLbOz, lbOzToKg, formatWeight } from '../lib/units';
import BottomSheet from './BottomSheet';
import SpinWheel from './SpinWheel';

interface Props {
  valueKg: number | undefined;
  units: 'metric' | 'imperial';
  onChange: (kg: number | undefined) => void;
}

export default function WeightInput({ valueKg, units, onChange }: Props) {
  const [open, setOpen] = useState(false);

  // Imperial state
  const initial = valueKg != null ? kgToLbOz(valueKg) : { lb: 0, oz: 0 };
  const [lb, setLb] = useState<number>(initial.lb);
  const [oz, setOz] = useState<number>(initial.oz);

  // Metric state
  const kg = valueKg ?? 0;
  const grams = Math.round((kg - Math.floor(kg)) * 1000);
  const wholeKg = Math.floor(kg);
  const [kgState, setKgState] = useState(wholeKg);
  const [gState, setGState] = useState(grams);

  const hasValue = valueKg != null;

  const openSheet = () => {
    if (units === 'imperial') {
      const init = valueKg != null ? kgToLbOz(valueKg) : { lb: 0, oz: 0 };
      setLb(init.lb);
      setOz(init.oz);
    } else {
      const k = valueKg ?? 0;
      setKgState(Math.floor(k));
      setGState(Math.round((k - Math.floor(k)) * 1000));
    }
    setOpen(true);
  };

  const emitImperial = (newLb: number, newOz: number) => {
    if (newLb === 0 && newOz === 0) onChange(undefined);
    else onChange(lbOzToKg(newLb, newOz));
  };

  const emitMetric = (newKg: number, newG: number) => {
    if (newKg === 0 && newG === 0) onChange(undefined);
    else onChange(newKg + newG / 1000);
  };

  const clear = () => {
    setLb(0);
    setOz(0);
    setKgState(0);
    setGState(0);
    onChange(undefined);
  };

  // Sync local state when valueKg changes externally (e.g. after clear)
  useEffect(() => {
    if (valueKg == null) {
      setKgState(0);
      setGState(0);
      setLb(0);
      setOz(0);
    }
  }, [valueKg]);

  const displayValue = hasValue ? formatWeight(valueKg!, units) : 'Not set';

  // Value ranges for wheels
  const lbValues = Array.from({ length: 200 }, (_, i) => i);
  const ozValues = Array.from({ length: 16 }, (_, i) => i);
  const kgValues = Array.from({ length: 100 }, (_, i) => i);
  const gValues = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950];

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

      <BottomSheet open={open} onClose={() => setOpen(false)} fullHeight>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="pb-2 text-center">
            <h2 className="text-xl font-extrabold text-ink">Weight</h2>
            <p className="mt-0.5 text-xs font-medium text-ink-3">
              {hasValue ? `Current: ${formatWeight(valueKg!, units)}` : 'Scroll to set weight'}
            </p>
          </div>

          {/* Spin wheels — take all available space, vertically centered */}
          <div className="flex flex-1 items-center justify-center rounded-2xl p-3" style={{ background: 'var(--c-surface-2)' }}>
            <div className="flex items-stretch gap-6 w-full">
              {units === 'metric' ? (
                <>
                  <SpinWheel
                    values={kgValues}
                    value={kgState}
                    unit="kg"
                    onChange={(v) => { setKgState(v); emitMetric(v, gState); }}
                  />
                  <SpinWheel
                    values={gValues}
                    value={gState}
                    unit="g"
                    onChange={(v) => { setGState(v); emitMetric(kgState, v); }}
                  />
                </>
              ) : (
                <>
                  <SpinWheel
                    values={lbValues}
                    value={lb}
                    unit="lb"
                    onChange={(v) => { setLb(v); emitImperial(v, oz); }}
                  />
                  <SpinWheel
                    values={ozValues}
                    value={oz}
                    unit="oz"
                    onChange={(v) => { setOz(v); emitImperial(lb, v); }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Bottom buttons — Clear and Done */}
          <div className="flex gap-3 pt-3 pb-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors active:opacity-60"
              style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }}
              onClick={clear}
            >
              <X size={18} /> Clear
            </button>
            <button
              className="btn-primary flex flex-1 items-center justify-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Check size={18} /> Done
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
