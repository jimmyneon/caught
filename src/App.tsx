import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Download, X, MapPin, AlertTriangle } from 'lucide-react';
import Home from './pages/Home';
import LogPage from './pages/LogPage';
import MapPage from './pages/MapPage';
import CalendarPage from './pages/CalendarPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import CatchEdit from './pages/CatchEdit';
import PlanPage from './pages/PlanPage';
import AuthPage from './pages/AuthPage';
import NavBar from './components/NavBar';
import { retryPendingEnrichment } from './lib/enrich';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { useGpsPermission } from './hooks/useGpsPermission';
import { initialSync, quickSync } from './lib/sync';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function App() {
  const [settings] = useSettings();
  const { user } = useAuth();
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [gpsDismissed, setGpsDismissed] = useState(false);
  const syncedUserId = useRef<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { requestPermission, forceRequest, showWarning, showCritical } = useGpsPermission();

  // Request GPS permission on first app load
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Re-request when app becomes visible again (user might have changed settings)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        requestPermission();
        setGpsDismissed(false);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [requestPermission]);

  // Reset scroll position on route change — prevents LogPage scroll carrying over to Home
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    if (user && syncedUserId.current !== user.id) {
      syncedUserId.current = user.id;
      initialSync(user.id);
    }
  }, [user]);

  // Quick sync when coming back online or returning to the app
  useEffect(() => {
    const onOnline = () => {
      if (user) quickSync(user.id);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible' && user) quickSync(user.id);
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);

  // Set theme-color based on route + theme
  // Home page has a dark background image, so always use dark color there
  // Other pages use the surface color matching the theme
  useEffect(() => {
    const isHome = location.pathname === '/';
    const color = isHome
      ? '#1a1a1a'
      : settings.theme === 'dusk'
        ? '#0f0f0f'
        : '#f5f4f2';
    document.documentElement.setAttribute('data-theme', settings.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }, [settings.theme, location.pathname]);

  // Fix viewport height for PWA — 100dvh can be unreliable on refresh
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);
    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
    };
  }, []);

  useEffect(() => {
    retryPendingEnrichment(settings.saveLocation);
    const onOnline = () => retryPendingEnrichment(settings.saveLocation);
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [settings.saveLocation]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden">
      <main ref={mainRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/catch/:id" element={<CatchEdit />} />
        </Routes>
      </main>
      {/* GPS permission warning */}
      {showWarning && !gpsDismissed && location.pathname !== '/auth' && (
        <div
          className="pointer-events-auto absolute left-3 right-3 z-1001 flex items-center gap-3 rounded-2xl p-3.5 animate-slide-up"
          style={{
            background: 'var(--c-surface)',
            boxShadow: 'var(--shadow-float)',
            border: `1px solid ${showCritical ? 'var(--c-danger, #e53e3e)' : 'var(--c-line)'}`,
            bottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: showCritical ? 'rgba(229,62,62,0.1)' : 'var(--c-accent-bg)' }}
          >
            {showCritical ? (
              <AlertTriangle size={20} style={{ color: 'var(--c-danger, #e53e3e)' }} />
            ) : (
              <MapPin size={20} style={{ color: 'var(--c-accent)' }} />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-ink">
              {showCritical ? 'Location required' : 'Enable location'}
            </div>
            <div className="text-xs text-ink-3">
              {showCritical
                ? 'The app cannot save catch locations without GPS. Please enable location in your browser settings.'
                : 'Caught needs your location to log where you catch fish.'}
            </div>
          </div>
          <button
            className="btn-primary shrink-0 px-4 py-2 text-sm"
            onClick={() => forceRequest()}
          >
            Enable
          </button>
          <button
            className="shrink-0 rounded-full p-1.5 text-ink-3 active:bg-surface-3"
            onClick={() => setGpsDismissed(true)}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {/* Install prompt */}
      {installPrompt && (
        <div className="pointer-events-auto absolute left-4 right-4 z-1001 flex items-center gap-3 rounded-2xl p-3.5 animate-slide-up"
          style={{ background: 'var(--c-surface)', boxShadow: 'var(--shadow-float)', border: '1px solid var(--c-line)', top: 'calc(env(safe-area-inset-top) + 1rem)' }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--c-accent-bg)' }}>
            <Download size={20} style={{ color: 'var(--c-accent)' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-ink">Install Caught</div>
            <div className="text-xs text-ink-3">Add to home screen for quick access</div>
          </div>
          <button className="btn-primary px-4 py-2 text-sm" onClick={handleInstall}>Install</button>
          <button
            className="shrink-0 rounded-full p-1.5 text-ink-3 active:bg-surface-3"
            onClick={() => setInstallPrompt(null)}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}
      <div className="relative z-50 shrink-0">
        <NavBar />
      </div>
    </div>
  );
}
