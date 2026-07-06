import { useEffect, useRef } from 'react';

interface Props {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  unit: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE = 5;

export default function SpinWheel({ values, value, onChange, unit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);

  const selectedIndex = values.indexOf(value);
  const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Set initial scroll position on mount
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = initialIndex * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      const targetScroll = clamped * ITEM_HEIGHT;
      if (ref.current.scrollTop !== targetScroll) {
        ref.current.scrollTop = targetScroll;
      }
      if (values[clamped] !== value) {
        onChange(values[clamped]);
      }
    }, 80);
  };

  const padding = (VISIBLE - 1) / 2;

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-1.5 text-[10px] font-bold text-ink-3">{unit}</div>
      <div className="relative w-full" style={{ height: VISIBLE * ITEM_HEIGHT }}>
        {/* Center highlight bar */}
        <div
          className="pointer-events-none absolute left-2 right-2 z-10 rounded-lg"
          style={{
            top: padding * ITEM_HEIGHT,
            height: ITEM_HEIGHT,
            background: 'var(--c-surface-3)',
          }}
        />
        {/* Top/bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10" style={{ height: padding * ITEM_HEIGHT, background: 'linear-gradient(180deg, var(--c-surface-2) 0%, transparent 100%)' }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10" style={{ height: padding * ITEM_HEIGHT, background: 'linear-gradient(0deg, var(--c-surface-2) 0%, transparent 100%)' }} />
        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto"
          style={{
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Top padding */}
          <div style={{ height: padding * ITEM_HEIGHT, scrollSnapAlign: 'none' }} />
          {values.map((v) => {
            const isSelected = v === value;
            return (
              <div
                key={v}
                className="flex items-center justify-center"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
                  fontSize: isSelected ? '1.25rem' : '1rem',
                  fontWeight: isSelected ? 800 : 500,
                  color: isSelected ? 'var(--c-ink)' : 'var(--c-ink-3)',
                  opacity: isSelected ? 1 : 0.5,
                  transition: 'font-size 0.1s, font-weight 0.1s',
                }}
              >
                {v}
              </div>
            );
          })}
          {/* Bottom padding */}
          <div style={{ height: padding * ITEM_HEIGHT, scrollSnapAlign: 'none' }} />
        </div>
      </div>
    </div>
  );
}
