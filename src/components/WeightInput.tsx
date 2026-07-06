import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { kgToLbOz, lbOzToKg } from '../lib/units';

interface Props {
  valueKg: number | undefined;
  units: 'metric' | 'imperial';
  onChange: (kg: number | undefined) => void;
}

function SquareBtn({ icon: Icon, onClick, disabled }: { icon: typeof Plus; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-2xl transition-all active:scale-90 disabled:opacity-30"
      style={{ background: 'var(--c-accent-bg)', color: 'var(--c-accent)', width: '3rem', height: '3rem' }}
    >
      <Icon size={24} strokeWidth={2.5} />
    </button>
  );
}

function ValueBox({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl" style={{ background: 'var(--c-surface-3)', height: '3rem' }}>
      <span className="text-base font-extrabold leading-none text-ink tabular-nums">{value}</span>
      <span className="mt-0.5 text-[10px] font-bold text-ink-3">{unit}</span>
    </div>
  );
}

export default function WeightInput({ valueKg, units, onChange }: Props) {
  const initial = valueKg != null ? kgToLbOz(valueKg) : { lb: 0, oz: 0 };
  const [lb, setLb] = useState<number>(initial.lb);
  const [oz, setOz] = useState<number>(initial.oz);
  const hasValue = valueKg != null;

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

  if (units === 'metric') {
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

    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label" style={{ marginBottom: 0 }}>Weight</label>
          {hasValue && (
            <button type="button" className="flex items-center gap-1 text-xs font-bold text-ink-3" onClick={clear}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div className="rounded-2xl p-3" style={{ background: 'var(--c-surface-2)' }}>
          <div className="flex items-stretch gap-2">
            <div className="flex flex-1 flex-col items-center gap-2">
              <SquareBtn icon={Plus} onClick={() => adjustKg(1)} />
              <ValueBox value={String(wholeKg)} unit="kg" />
              <SquareBtn icon={Minus} onClick={() => adjustKg(-1)} disabled={wholeKg === 0} />
            </div>
            <div className="flex flex-1 flex-col items-center gap-2">
              <SquareBtn icon={Plus} onClick={() => adjustGrams(50)} />
              <ValueBox value={String(grams)} unit="g" />
              <SquareBtn icon={Minus} onClick={() => adjustGrams(-50)} disabled={wholeKg === 0 && grams === 0} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label" style={{ marginBottom: 0 }}>Weight</label>
        {hasValue && (
          <button type="button" className="flex items-center gap-1 text-xs font-bold text-ink-3" onClick={clear}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="rounded-2xl p-3" style={{ background: 'var(--c-surface-2)' }}>
        <div className="flex items-stretch gap-2">
          <div className="flex flex-1 flex-col items-center gap-2">
            <SquareBtn icon={Plus} onClick={() => adjustLb(1)} />
            <ValueBox value={String(lb)} unit="lb" />
            <SquareBtn icon={Minus} onClick={() => adjustLb(-1)} disabled={lb === 0} />
          </div>
          <div className="flex flex-1 flex-col items-center gap-2">
            <SquareBtn icon={Plus} onClick={() => adjustOz(1)} />
            <ValueBox value={String(oz)} unit="oz" />
            <SquareBtn icon={Minus} onClick={() => adjustOz(-1)} disabled={lb === 0 && oz === 0} />
          </div>
        </div>
      </div>
    </div>
  );
}
