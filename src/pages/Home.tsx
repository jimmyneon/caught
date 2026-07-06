import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings as SettingsIcon, Check, Plus, Cloud, X } from 'lucide-react';
import { db } from '../db';
import type { CatchRecord } from '../types';
import { enrichCatch } from '../lib/enrich';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import BottomSheet from '../components/BottomSheet';

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
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const rippleId = useRef(0);
  const bgRef = useRef<HTMLImageElement>(null);
  useParallax(bgRef);

  // Show sync prompt every 3rd app open if not signed in (wait for auth to load)
  useEffect(() => {
    if (authLoading || user || !isSupabaseConfigured) return;
    const dismissed = localStorage.getItem('caught_sync_prompt_dismissed');
    if (dismissed) return;
    const opens = parseInt(localStorage.getItem('caught_app_opens') ?? '0', 10) + 1;
    localStorage.setItem('caught_app_opens', String(opens));
    if (opens % 3 === 0) {
      setShowSyncPrompt(true);
    }
  }, [user, authLoading, isSupabaseConfigured]);

  const incomplete = useLiveQuery(
    () => db.catches.filter((c) => !c.complete).count(),
    [],
  ) ?? 0;

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayCount = useLiveQuery(
    () => db.catches.where('createdAt').above(todayStart).count(),
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
      {/* Full-screen background photo with subtle parallax */}
      <img
        ref={bgRef}
        src={bgUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: 'scale(1.18) perspective(800px)',
          willChange: 'transform',
        }}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            settings.theme === 'dusk'
              ? 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.7) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col overflow-hidden px-6 pt-[calc(1.5rem+env(safe-area-inset-top))]">
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

        {/* Sync prompt — dismissible */}
        {showSyncPrompt && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md animate-fade-in">
            <Cloud size={18} className="shrink-0 text-white/80" />
            <button
              className="flex-1 text-left text-sm font-semibold text-white"
              onClick={() => { setShowSyncPrompt(false); navigate('/auth'); }}
            >
              Secure your data — sign in for cloud sync
            </button>
            <button
              className="shrink-0 rounded-full p-1 text-white/50 active:bg-white/10"
              onClick={() => { setShowSyncPrompt(false); localStorage.setItem('caught_sync_prompt_dismissed', '1'); }}
            >
              <X size={16} />
            </button>
          </div>
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
          <Link
            to="/log?filter=incomplete"
            className="mb-28 flex items-center gap-3 rounded-2xl bg-white/8 p-3.5 backdrop-blur-md transition-transform active:scale-[0.98]"
          >
            <span className="flex-1 text-sm font-semibold text-white">
              {incomplete} incomplete catch{incomplete > 1 ? 'es' : ''} to finish
            </span>
            <span className="text-sm font-bold text-white/60">Finish →</span>
          </Link>
        )}
      </div>

      {/* Catch saved slide-up */}
      <BottomSheet open={!!savedId} onClose={() => setSavedId(null)}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full animate-check-pop"
            style={{ background: 'var(--c-accent-bg)' }}
          >
            <Check size={28} strokeWidth={3} style={{ color: 'var(--c-accent)' }} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-ink">Catch logged</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-3">
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
