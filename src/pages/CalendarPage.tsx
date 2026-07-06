import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../db';
import { useSettings } from '../hooks/useSettings';
import CatchCard from '../components/CatchCard';
import BottomSheet from '../components/BottomSheet';

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarPage() {
  const [settings] = useSettings();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const catches = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.sort((a, b) => b.createdAt - a.createdAt);
    },
    [],
  ) ?? [];

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of catches) {
      const key = new Date(c.createdAt).toDateString();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [catches]);

  const cells = useMemo(() => {
    const first = new Date(month);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const result: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    return result;
  }, [month]);

  const selectedCatches = selected
    ? catches.filter((c) => new Date(c.createdAt).toDateString() === selected)
    : [];

  const shift = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <div className="px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-20">
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Calendar</h1>
      </header>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <button className="rounded-full p-2 text-ink-3 transition-colors active:bg-surface-3" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft size={22} />
          </button>
          <span className="font-bold text-ink-2">
            {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button className="rounded-full p-2 text-ink-3 transition-colors active:bg-surface-3" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className="py-1 text-xs font-bold text-ink-3">
              {d}
            </div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const key = date.toDateString();
            const count = byDay.get(key) ?? 0;
            const isSelected = selected === key;
            const isToday = key === new Date().toDateString();
            return (
              <button
                key={i}
                className="relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all active:scale-90"
                style={
                  isSelected
                    ? { background: 'var(--c-accent)', color: '#fff' }
                    : count > 0
                      ? { background: 'var(--c-accent-bg)', color: 'var(--c-accent)' }
                      : isToday
                        ? { color: 'var(--c-accent)', boxShadow: 'inset 0 0 0 1px var(--c-accent-light)' }
                        : { color: 'var(--c-ink-2)' }
                }
                onClick={() => setSelected(isSelected ? null : key)}
              >
                {date.getDate()}
                {count > 0 && (
                  <span
                    className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full"
                    style={{
                      background: isSelected ? '#fff' : 'var(--c-accent)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-ink">
            {selected ? new Date(selected).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
          </h2>
          {selectedCatches.length === 0 ? (
            <p className="text-center text-sm text-ink-3">No catches this day</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedCatches.map((c) => (
                <CatchCard key={c.id} record={c} settings={settings} />
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
