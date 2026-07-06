import { useCallback, useEffect, useState } from 'react';
import type { Settings } from '../types';
import { supabase } from '../lib/supabase';
import { pushSettings } from '../lib/sync';

const KEY = 'caught-settings';
const TS_KEY = 'caught-settings-updated-at';
const EVENT = 'caught-settings-changed';

const DEFAULTS: Settings = {
  units: 'metric',
  tempUnit: 'celsius',
  saveLocation: true,
  favouriteSpecies: [],
  favouriteBaits: [],
  defaultWaterType: undefined,
  theme: 'dawn',
};

export function loadSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function getSettingsUpdatedAt(): number {
  return parseInt(localStorage.getItem(TS_KEY) ?? '0', 10);
}

export function setSettingsUpdatedAt(ts: number): void {
  localStorage.setItem(TS_KEY, String(ts));
}

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    const sync = () => setSettings(loadSettings());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...loadSettings(), ...patch };
    const now = Date.now();
    localStorage.setItem(KEY, JSON.stringify(next));
    setSettingsUpdatedAt(now);
    window.dispatchEvent(new Event(EVENT));
    // Push to Supabase if logged in
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          pushSettings(data.session.user.id, next, now).catch(console.error);
        }
      });
    }
  }, []);

  return [settings, update];
}
