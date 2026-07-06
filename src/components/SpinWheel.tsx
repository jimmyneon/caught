import { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  unit: string;
}

const ITEM_H = 52;
const VISIBLE = 5;
const HALF = Math.floor(VISIBLE / 2);
const HEIGHT = VISIBLE * ITEM_H;

export default function SpinWheel({ values, value, onChange, unit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const idx = values.indexOf(value);
  const initialIdx = idx >= 0 ? idx : 0;

  // offsetY in px — position of the strip relative to the center slot
  const [offsetY, setOffsetY] = useState(-initialIdx * ITEM_H);
  const [isDragging, setIsDragging] = useState(false);
  const [centeredIdx, setCenteredIdx] = useState(initialIdx);

  // Drag tracking
  const startYRef = useRef<number | null>(null);
  const startOffsetRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Animate to a target offset
  const animateTo = useCallback((targetOffset: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const startOffset = offsetY;
    const distance = targetOffset - startOffset;
    const duration = 250;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startOffset + distance * eased;
      setOffsetY(current);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setOffsetY(targetOffset);
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [offsetY]);

  // Snap to nearest item and fire onChange
  const snapToNearest = useCallback((currentOffset: number) => {
    const rawIdx = Math.round(-currentOffset / ITEM_H);
    const clamped = Math.max(0, Math.min(values.length - 1, rawIdx));
    const targetOffset = -clamped * ITEM_H;
    animateTo(targetOffset);
    setCenteredIdx(clamped);
    if (values[clamped] !== value) {
      onChange(values[clamped]);
    }
  }, [values, value, onChange, animateTo]);

  // Apply velocity after drag ends
  const applyMomentum = useCallback((vel: number) => {
    if (Math.abs(vel) < 0.3) return false;
    const decel = 0.002;
    const dist = (vel * Math.abs(vel)) / (2 * decel);
    const currentOffset = offsetY;
    const targetOffset = currentOffset + dist;
    const rawIdx = Math.round(-targetOffset / ITEM_H);
    const clamped = Math.max(0, Math.min(values.length - 1, rawIdx));
    animateTo(-clamped * ITEM_H);
    setCenteredIdx(clamped);
    if (values[clamped] !== value) {
      onChange(values[clamped]);
    }
    return true;
  }, [offsetY, values, value, onChange, animateTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startYRef.current = e.touches[0].clientY;
    lastYRef.current = e.touches[0].clientY;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    startOffsetRef.current = offsetY;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current == null) return;
    const y = e.touches[0].clientY;
    const delta = y - startYRef.current;
    let newOffset = startOffsetRef.current + delta;

    // Clamp at boundaries with rubber band
    const minOffset = -(values.length - 1) * ITEM_H;
    const maxOffset = 0;
    if (newOffset > maxOffset) {
      newOffset = maxOffset + (newOffset - maxOffset) * 0.3;
    } else if (newOffset < minOffset) {
      newOffset = minOffset + (newOffset - minOffset) * 0.3;
    }

    setOffsetY(newOffset);

    // Track velocity
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (y - lastYRef.current) / dt;
    }
    lastYRef.current = y;
    lastTimeRef.current = now;

    // Update centered index for highlight
    const rawIdx = Math.round(-newOffset / ITEM_H);
    const clamped = Math.max(0, Math.min(values.length - 1, rawIdx));
    setCenteredIdx(clamped);
  };

  const onTouchEnd = () => {
    if (startYRef.current == null) return;
    setIsDragging(false);
    const applied = applyMomentum(velocityRef.current);
    if (!applied) {
      snapToNearest(offsetY);
    }
    startYRef.current = null;
    velocityRef.current = 0;
  };

  // Mouse support for desktop testing
  const onMouseDown = (e: React.MouseEvent) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startYRef.current = e.clientY;
    lastYRef.current = e.clientY;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    startOffsetRef.current = offsetY;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (startYRef.current == null) return;
      const delta = ev.clientY - startYRef.current;
      let newOffset = startOffsetRef.current + delta;
      const minOffset = -(values.length - 1) * ITEM_H;
      const maxOffset = 0;
      if (newOffset > maxOffset) newOffset = maxOffset + (newOffset - maxOffset) * 0.3;
      else if (newOffset < minOffset) newOffset = minOffset + (newOffset - minOffset) * 0.3;
      setOffsetY(newOffset);
      const now = performance.now();
      const dt = now - lastTimeRef.current;
      if (dt > 0) velocityRef.current = (ev.clientY - lastYRef.current) / dt;
      lastYRef.current = ev.clientY;
      lastTimeRef.current = now;
      const rawIdx = Math.round(-newOffset / ITEM_H);
      const clamped = Math.max(0, Math.min(values.length - 1, rawIdx));
      setCenteredIdx(clamped);
    };
    const onUp = () => {
      setIsDragging(false);
      const applied = applyMomentum(velocityRef.current);
      if (!applied) snapToNearest(offsetY);
      startYRef.current = null;
      velocityRef.current = 0;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Sync when value changes externally
  useEffect(() => {
    const newIdx = values.indexOf(value);
    const clamped = newIdx >= 0 ? newIdx : 0;
    const targetOffset = -clamped * ITEM_H;
    if (Math.abs(offsetY - targetOffset) > 1 && !isDragging) {
      animateTo(targetOffset);
      setCenteredIdx(clamped);
    }
  }, [value]);

  // Initialize on mount
  useEffect(() => {
    setOffsetY(-initialIdx * ITEM_H);
    setCenteredIdx(initialIdx);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center select-none">
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-3">{unit}</div>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ height: HEIGHT, touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        {/* Center selection highlight */}
        <div
          className="pointer-events-none absolute left-2 right-2 rounded-xl"
          style={{
            top: HALF * ITEM_H,
            height: ITEM_H,
            background: 'var(--c-accent-bg)',
            borderTop: '2px solid var(--c-accent)',
            borderBottom: '2px solid var(--c-accent)',
          }}
        />

        {/* Top/bottom fade — subtle, only 40% opacity so numbers remain visible */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{
            height: HALF * ITEM_H,
            background: 'linear-gradient(180deg, var(--c-surface-2) 0%, transparent 100%)',
            opacity: 0.7,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: HALF * ITEM_H,
            background: 'linear-gradient(0deg, var(--c-surface-2) 0%, transparent 100%)',
            opacity: 0.7,
          }}
        />

        {/* The draggable strip */}
        <div
          ref={dragRef}
          className="absolute inset-x-0"
          style={{
            transform: `translateY(${offsetY + HALF * ITEM_H}px)`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {values.map((v, i) => {
            const distance = Math.abs(i - centeredIdx);
            const isSelected = i === centeredIdx;
            return (
              <div
                key={v}
                className="flex items-center justify-center tabular-nums"
                style={{
                  height: ITEM_H,
                  fontSize: isSelected ? '1.6rem' : distance === 1 ? '1.2rem' : '1rem',
                  fontWeight: isSelected ? 800 : distance === 1 ? 600 : 400,
                  color: isSelected ? 'var(--c-ink)' : 'var(--c-ink-2)',
                  opacity: isSelected ? 1 : distance === 1 ? 0.7 : 0.4,
                  transition: 'font-size 0.15s, font-weight 0.15s, opacity 0.15s',
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
