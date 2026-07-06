import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Sun, Moon, Cloud, LogOut, User } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import type { WaterType, Theme } from '../types';

const WATER_TYPES: WaterType[] = ['sea', 'river', 'lake', 'canal', 'reservoir', 'pond', 'stream', 'estuary', 'stillwater', 'loch'];

export default function SettingsPage() {
  const [settings, update] = useSettings();
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [newSpecies, setNewSpecies] = useState('');

  const addSpecies = () => {
    const s = newSpecies.trim();
    if (s && !settings.favouriteSpecies.includes(s)) {
      update({ favouriteSpecies: [...settings.favouriteSpecies, s] });
    }
    setNewSpecies('');
  };

  return (
    <div className="px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-20">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-ink">Settings</h1>

      <div className="flex flex-col gap-4 pb-6">
        <section className="card p-4">
          <label className="label">Appearance</label>
          <div className="flex gap-2">
            {(['dawn', 'dusk'] as const).map((t) => (
              <button
                key={t}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-95"
                style={
                  settings.theme === t
                    ? { background: 'var(--c-accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }
                    : { background: 'var(--c-surface-3)', color: 'var(--c-ink-3)' }
                }
                onClick={() => update({ theme: t as Theme })}
              >
                {t === 'dawn' ? <Sun size={18} /> : <Moon size={18} />}
                {t === 'dawn' ? 'Dawn' : 'Dusk'}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <label className="label">Weight units</label>
          <div className="flex gap-2">
            {(['metric', 'imperial'] as const).map((u) => (
              <button
                key={u}
                className="flex-1 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-95"
                style={
                  settings.units === u
                    ? { background: 'var(--c-accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }
                    : { background: 'var(--c-surface-3)', color: 'var(--c-ink-3)' }
                }
                onClick={() => update({ units: u })}
              >
                {u === 'metric' ? 'kg' : 'lb / oz'}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <label className="label">Temperature</label>
          <div className="flex gap-2">
            {(['celsius', 'fahrenheit'] as const).map((t) => (
              <button
                key={t}
                className="flex-1 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-95"
                style={
                  settings.tempUnit === t
                    ? { background: 'var(--c-accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }
                    : { background: 'var(--c-surface-3)', color: 'var(--c-ink-3)' }
                }
                onClick={() => update({ tempUnit: t })}
              >
                {t === 'celsius' ? '°C' : '°F'}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <div className="font-bold text-ink">Save GPS location</div>
              <p className="mt-0.5 text-xs text-ink-3">
                Needed for map, weather and tide data. Everything stays on this device.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={settings.saveLocation}
              className="relative h-8 w-14 shrink-0 rounded-full transition-colors"
              style={{ background: settings.saveLocation ? 'var(--c-accent)' : 'var(--c-surface-3)' }}
              onClick={() => update({ saveLocation: !settings.saveLocation })}
            >
              <span
                className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all"
                style={{ left: settings.saveLocation ? 'calc(100% - 1.75rem)' : '0.25rem' }}
              />
            </button>
          </div>
        </section>

        <section className="card p-4">
          <label className="label">Favourite species</label>
          <div className="mb-3 flex flex-wrap gap-2">
            {settings.favouriteSpecies.length === 0 && (
              <p className="text-xs text-ink-3">Shown first in species suggestions</p>
            )}
            {settings.favouriteSpecies.map((s) => (
              <span key={s} className="chip">
                {s}
                <button
                  onClick={() =>
                    update({ favouriteSpecies: settings.favouriteSpecies.filter((x) => x !== s) })
                  }
                  aria-label={`Remove ${s}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="Add species"
              value={newSpecies}
              onChange={(e) => setNewSpecies(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSpecies()}
            />
            <button className="btn-primary px-4" onClick={addSpecies} aria-label="Add species">
              <Plus size={20} />
            </button>
          </div>
        </section>

        <section className="card p-4">
          <label className="label">Default water type</label>
          <div className="flex flex-wrap gap-2">
            {WATER_TYPES.map((w) => (
              <button
                key={w}
                className="rounded-xl px-4 py-2.5 text-sm font-bold capitalize transition-all active:scale-95"
                style={
                  settings.defaultWaterType === w
                    ? { background: 'var(--c-accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }
                    : { background: 'var(--c-surface-3)', color: 'var(--c-ink-3)' }
                }
                onClick={() =>
                  update({ defaultWaterType: settings.defaultWaterType === w ? undefined : w })
                }
              >
                {w}
              </button>
            ))}
          </div>
        </section>

        {/* Cloud sync / Account */}
        <section className="card p-4">
          <label className="label">Cloud sync</label>
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User size={16} style={{ color: 'var(--c-accent)' }} />
                <span className="font-bold text-ink">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-3">
                <Cloud size={14} />
                <span>Catches are backed up to the cloud automatically</span>
              </div>
              <button
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors active:bg-surface-3"
                style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }}
                onClick={async () => { await signOut(); navigate('/'); }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : isSupabaseConfigured ? (
            <button
              className="btn-primary w-full"
              onClick={() => navigate('/auth')}
            >
              Sign in or create account
            </button>
          ) : (
            <p className="text-xs text-ink-3">Cloud sync coming soon. Your data is stored locally on this device.</p>
          )}
        </section>

        <p className="text-center text-xs text-ink-3">
          Caught v0.1 · {user ? 'Synced to cloud' : 'all data stored locally on your device'}
        </p>
      </div>
    </div>
  );
}
