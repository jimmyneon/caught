import { useEffect, useState } from 'react';
import type { Conditions } from '../types';
import { getPosition } from '../lib/geo';
import { fetchConditionsAt } from '../lib/weather';
import { moonPhase, moonLabel } from '../lib/moon';

export interface LiveConditions extends Conditions {
  loading: boolean;
  error: boolean;
}

export function useLiveConditions(): LiveConditions {
  const [state, setState] = useState<LiveConditions>({
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const phase = moonPhase(now);

    (async () => {
      try {
        const pos = await getPosition(8000);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const weather = await fetchConditionsAt(lat, lon, now);
        if (cancelled) return;
        setState({
          ...weather,
          moonPhase: phase,
          moonLabel: moonLabel(phase),
          loading: false,
          error: false,
        });
      } catch {
        if (cancelled) return;
        setState({
          moonPhase: phase,
          moonLabel: moonLabel(phase),
          loading: false,
          error: true,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
