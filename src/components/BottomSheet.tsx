import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  children: ReactNode;
  title?: string;
  onClose?: () => void;
  fullHeight?: boolean;
}

let openCount = 0;

function setBodyScroll(disabled: boolean) {
  if (disabled) {
    document.body.style.overflow = 'hidden';
    openCount++;
  } else {
    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) {
      document.body.style.overflow = '';
    }
  }
}

export default function BottomSheet({ open, children, title, onClose, fullHeight }: Props) {
  const [dragY, setDragY] = useState(0);
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragYRef = useRef(0);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setDragY(0);
      dragYRef.current = 0;
      setBodyScroll(true);
    } else {
      setBodyScroll(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Drag-to-close on the entire sheet (not just the handle)
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      // Only start drag tracking if touch starts on the sheet
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startYRef.current == null) return;
      const delta = e.touches[0].clientY - startYRef.current;

      // Only drag down (positive delta)
      if (delta > 0) {
        // Check if content is scrolled to top
        const scrollTop = el.scrollTop;
        if (scrollTop <= 0) {
          // Content at top — start dragging the sheet
          isDraggingRef.current = true;
          e.preventDefault();
          dragYRef.current = delta;
          setDragY(delta);
        }
      }
    };

    const onTouchEnd = () => {
      if (isDraggingRef.current && dragYRef.current > 100) {
        onCloseRef.current?.();
      }
      dragYRef.current = 0;
      setDragY(0);
      startYRef.current = null;
      isDraggingRef.current = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [visible]);

  if (!visible && !open) return null;

  const translateY = open ? dragY : window.innerHeight;

  return (
    <div className="fixed inset-0 z-1100 flex items-end justify-center" style={{ pointerEvents: open ? 'auto' : 'none', overscrollBehavior: 'contain' }}>
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          opacity: open ? 1 : 0,
          overscrollBehavior: 'contain',
          touchAction: 'none',
        }}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`glass relative w-full max-w-md overflow-y-auto rounded-t-3xl pb-[env(safe-area-inset-bottom)] ${fullHeight ? 'h-[calc(100vh-0.5rem)]' : 'max-h-[85vh] min-h-[50vh]'}`}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: dragY === 0 ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-center pt-3 pb-2"
          style={{ cursor: 'grab' }}
        >
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--c-line)' }} />
        </div>
        {title && (
          <h2 className="px-6 pb-2 text-xl font-extrabold text-ink">{title}</h2>
        )}
        <div className="px-6 pb-20" style={{ touchAction: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
