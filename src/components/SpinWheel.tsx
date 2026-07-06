import { useEffect, useRef } from 'react';

interface Props {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  unit: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE = 5;

export default function SpinWheel({ values, value, onChange, unit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
  const isExternalScroll = useRef(false);

  const selectedIndex = values.indexOf(value);
  const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Scroll to the selected value on mount AND when value changes externally
  useEffect(() => {
    if (!ref.current) return;
    const currentScroll = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    if (currentScroll !== targetIndex) {
      isExternalScroll.current = true;
      ref.current.scrollTo({ top: targetIndex * ITEM_HEIGHT, behavior: 'smooth' });
    }
  }, [value]);

  const handleScroll = () => {
    if (isExternalScroll.current) return;
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
    }, 100);
  };

  const handleScrollEnd = () => {
    isExternalScroll.current = false;
  };

  const padding = (VISIBLE - 1) / 2;

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-2 text-xs font-bold text-ink-3">{unit}</div>
      <div className="relative w-full" style={{ height: VISIBLE * ITEM_HEIGHT }}>
        {/* Center highlight bar — BEHIND content */}
        <div
          className="pointer-events-none absolute left-1 right-1 rounded-xl"
          style={{
            top: padding * ITEM_HEIGHT,
            height: ITEM_HEIGHT,
            background: 'var(--c-surface-3)',
            borderTop: '2px solid var(--c-accent)',
            borderBottom: '2px solid var(--c-accent)',
            zIndex: 0,
          }}
        />
        {/* Top/bottom fade — above content for fade effect */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20" style={{ height: padding * ITEM_HEIGHT, background: 'linear-gradient(180deg, var(--c-surface-2) 60%, transparent 100%)' }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20" style={{ height: padding * ITEM_HEIGHT, background: 'linear-gradient(0deg, var(--c-surface-2) 60%, transparent 100%)' }} />
        <div
          ref={ref}
          onScroll={handleScroll}
          onScrollEnd={handleScrollEnd}
          className="relative h-full w-full overflow-y-auto"
          style={{
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            zIndex: 1,
          }}
        >
          {/* Top padding */}
          <div style={{ height: padding * ITEM_HEIGHT, scrollSnapAlign: 'none' }} />
          {values.map((v) => {
            const isSelected = v === value;
            return (
              <div
                key={v}
                className="flex items-center justify-center tabular-nums"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
                  fontSize: isSelected ? '1.5rem' : '1.05rem',
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? 'var(--c-ink)' : 'var(--c-ink-3)',
                  opacity: isSelected ? 1 : 0.35,
                  transition: 'font-size 0.15s, font-weight 0.15s, opacity 0.15s',
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
