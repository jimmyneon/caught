import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings as SettingsIcon, Check, Plus, Cloud } from 'lucide-react';
import { db } from '../db';
import type { CatchRecord } from '../types';
import { enrichCatch, retryPendingEnrichment } from '../lib/enrich';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import BottomSheet from '../components/BottomSheet';
import QuickFillSheet from '../components/QuickFillSheet';

const BG_IMAGES = {
  dawn: '/dawn.jpg',
  dusk: '/dusk.jpg',
} as const;

function useParallax(imgRef: React.RefObject<HTMLImageElement | null>) {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = e.accelerationIncludingGravity;
      if (!accel || accel.x == null || accel.y == null) return;
      const x = Math.max(-1, Math.min(1, accel.x / 9.8));
      const y = Math.max(-1, Math.min(1, accel.y / 9.8));
      target.current = { x: x * 25, y: y * 25 };
    };

    const animate = () => {
      if (!mounted) return;
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      if (imgRef.current) {
        const rx = (current.current.y / 25 * -8).toFixed(2);
        const ry = (current.current.x / 25 * 8).toFixed(2);
        imgRef.current.style.transform = `scale(1.18) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px, 0)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('devicemotion', handleMotion);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;
      window.removeEventListener('devicemotion', handleMotion);
      cancelAnimationFrame(rafId.current);
    };
  }, [imgRef]);
}

export default function Home() {
  const navigate = useNavigate();
  const [settings] = useSettings();
  const { user, loading: authLoading, isSupabaseConfigured } = useAuth();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const rippleId = useRef(0);
  const bgRef = useRef<HTMLImageElement>(null);
  useParallax(bgRef);

  // Fallback: if bg image doesn't fire onLoad within 1.5s, show content anyway
  useEffect(() => {
    if (bgRef.current?.complete) setBgLoaded(true);
    const timer = setTimeout(() => setBgLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Pull-to-refresh: only when scrolled to top and no BottomSheet open
  const isSignedIn = !!user;
  const showSignInBanner = !authLoading && !isSignedIn && isSupabaseConfigured;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (savedId || showIncomplete) return; // BottomSheet open
    const main = document.querySelector('main');
    if (main && main.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current == null || savedId || showIncomplete) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && delta < 120) {
      setPullDist(delta * 0.5);
    }
  };

  const handleTouchEnd = () => {
    if (pullDist > 50 && !savedId && !showIncomplete) {
      setRefreshing(true);
      // Trigger refresh — re-run enrichment for any pending catches
      retryPendingEnrichment(settings.saveLocation);
      setTimeout(() => {
        setRefreshing(false);
      }, 1200);
    }
    setPullDist(0);
    touchStartY.current = null;
  };

  const incompleteCatches = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.filter((c) => !c.complete && !c.deleted);
    },
    [],
  ) ?? [];

  const incomplete = incompleteCatches.length;

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayCount = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.filter((c) => !c.deleted && c.createdAt >= todayStart).length;
    },
    [todayStart],
  ) ?? 0;

  const handleCaught = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);

    const rec: CatchRecord = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      complete: false,
      waterType: settings.defaultWaterType,
      syncedAt: 0,
    };
    await db.catches.add(rec);
    setTimeout(() => {
      setSavedId(rec.id);
      enrichCatch(rec.id, settings.saveLocation);
    }, 300);
  };

  const bgUrl = BG_IMAGES[settings.theme] ?? BG_IMAGES.dawn;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Full-screen background photo — fixed to cover entire viewport including nav bar */}
      <img
        ref={bgRef}
        src={bgUrl}
        alt=""
        className="fixed inset-0 h-full w-full object-cover transition-opacity duration-300"
        style={{
          transform: 'scale(1.18) perspective(800px)',
          willChange: 'transform',
          pointerEvents: 'none',
          opacity: bgLoaded ? 1 : 0,
          zIndex: 0,
        }}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setBgLoaded(true)}
      />
      <div
        className="fixed inset-0"
        style={{
          background:
            settings.theme === 'dusk'
              ? 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.7) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.55) 100%)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 flex h-full flex-col overflow-hidden px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] transition-opacity duration-300 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ overscrollBehavior: 'none', transform: pullDist > 0 ? `translateY(${pullDist}px)` : undefined, transition: pullDist === 0 ? 'transform 0.2s ease-out' : 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {(pullDist > 0 || refreshing) && (
          <div className="absolute left-1/2 top-2 -translate-x-1/2" style={{ opacity: Math.min(pullDist / 50, 1) }}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-md ${refreshing ? 'animate-spin' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: refreshing ? 'none' : `rotate(${pullDist * 3}deg)` }}>
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </div>
          </div>
        )}

        <header className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold tracking-tight text-white">
            Caught
          </h1>
          <Link
            to="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors active:bg-white/10"
            aria-label="Settings"
          >
            <SettingsIcon size={20} strokeWidth={1.8} />
          </Link>
        </header>

        {/* Persistent sign-in banner — always visible when not signed in */}
        {showSignInBanner && (
          <button
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md transition-transform active:scale-[0.98] animate-fade-in"
            onClick={() => navigate('/auth')}
          >
            <Cloud size={18} className="shrink-0 text-white/80" />
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-white">Not signed in</div>
              <div className="text-xs text-white/60">Sign in to back up your catches to the cloud</div>
            </div>
            <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">Sign in</span>
          </button>
        )}

        {/* Center: Record button */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <button
            onClick={handleCaught}
            className="ripple-container relative flex h-40 w-40 items-center justify-center rounded-full transition-transform active:scale-95"
            style={{
              background: 'var(--c-accent)',
              boxShadow: 'var(--shadow-accent), 0 0 0 5px rgba(255,255,255,0.08)',
            }}
          >
            {ripples.map((r) => (
              <span
                key={r.id}
                className="ripple"
                style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }}
              />
            ))}
            <Plus size={48} strokeWidth={2.5} color="white" />
          </button>

          <p className="text-center text-sm font-medium text-white/55">
            Tap to log a catch
          </p>

          {todayCount > 0 && (
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md">
              {todayCount} catch{todayCount > 1 ? 'es' : ''} today
            </div>
          )}
        </div>

        {/* Bottom: incomplete prompt */}
        {incomplete > 0 && (
          <button
            onClick={() => setShowIncomplete(true)}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-white/8 p-3.5 backdrop-blur-md transition-transform active:scale-[0.98]"
          >
            <span className="flex-1 text-left text-sm font-semibold text-white">
              {incomplete} incomplete catch{incomplete > 1 ? 'es' : ''} to finish
            </span>
            <span className="text-sm font-bold text-white/60">Finish →</span>
          </button>
        )}
      </div>

      {/* Quick-fill sheet for incomplete catches */}
      <QuickFillSheet open={showIncomplete} onClose={() => setShowIncomplete(false)} />

      {/* Catch saved slide-up — compact, sits just above the button */}
      <BottomSheet open={!!savedId} onClose={() => setSavedId(null)}>
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full animate-check-pop"
            style={{ background: 'var(--c-accent-bg)' }}
          >
            <Check size={24} strokeWidth={3} style={{ color: 'var(--c-accent)' }} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-extrabold text-ink">Catch logged</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">
              Time, location &amp; conditions saved automatically.
            </p>
          </div>
          <button
            className="btn-primary w-full"
            onClick={() => {
              const id = savedId;
              setSavedId(null);
              navigate(`/catch/${id}`);
            }}
          >
            Add details now
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
