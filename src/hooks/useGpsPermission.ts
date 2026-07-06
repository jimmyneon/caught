import { useState, useEffect, useCallback } from 'react';
import { getPosition } from '../lib/geo';

type GpsState = 'unknown' | 'granted' | 'denied' | 'prompt';

const STORAGE_KEY = 'caught-gps-permission';
const PROMPT_COUNT_KEY = 'caught-gps-prompt-count';
const LAST_PROMPT_KEY = 'caught-gps-last-prompt';

export function useGpsPermission() {
  const [state, setState] = useState<GpsState>('unknown');
  const [promptCount, setPromptCount] = useState(0);

  // Check stored state on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as GpsState | null;
    if (stored) setState(stored);
    const count = parseInt(localStorage.getItem(PROMPT_COUNT_KEY) ?? '0', 10);
    setPromptCount(count);

    // Check Permissions API if available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          setState('granted');
          localStorage.setItem(STORAGE_KEY, 'granted');
        } else if (result.state === 'denied') {
          setState('denied');
          localStorage.setItem(STORAGE_KEY, 'denied');
        } else {
          setState('prompt');
        }
      }).catch(() => {
        // Permissions API not supported — try to get position to check
      });
    }
  }, []);

  // Request GPS permission — called on app load
  const requestPermission = useCallback(async (): Promise<void> => {
    if (state === 'granted') return;

    // Check if we've prompted recently (within 1 hour)
    const lastPrompt = parseInt(localStorage.getItem(LAST_PROMPT_KEY) ?? '0', 10);
    const now = Date.now();
    if (lastPrompt && now - lastPrompt < 3600000) return; // 1 hour cooldown

    const count = parseInt(localStorage.getItem(PROMPT_COUNT_KEY) ?? '0', 10) + 1;
    localStorage.setItem(PROMPT_COUNT_KEY, String(count));
    localStorage.setItem(LAST_PROMPT_KEY, String(now));
    setPromptCount(count);

    try {
      await getPosition(8000);
      setState('granted');
      localStorage.setItem(STORAGE_KEY, 'granted');
    } catch (e: any) {
      if (e?.code === 1) {
        // PERMISSION_DENIED
        setState('denied');
        localStorage.setItem(STORAGE_KEY, 'denied');
      } else {
        // TIMEOUT or POSITION_UNAVAILABLE — still prompt again later
        setState('prompt');
      }
    }
  }, [state]);

  // Force request — used when user taps "Enable GPS" button
  const forceRequest = useCallback(async (): Promise<boolean> => {
    try {
      await getPosition(10000);
      setState('granted');
      localStorage.setItem(STORAGE_KEY, 'granted');
      return true;
    } catch {
      setState('denied');
      localStorage.setItem(STORAGE_KEY, 'denied');
      return false;
    }
  }, []);

  // Whether to show the warning banner
  const showWarning = state === 'denied' || (state === 'prompt' && promptCount >= 2);
  const showCritical = state === 'denied' && promptCount >= 3;

  return { state, promptCount, requestPermission, forceRequest, showWarning, showCritical };
}
