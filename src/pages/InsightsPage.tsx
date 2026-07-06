import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarClock } from 'lucide-react';
import { db } from '../db';
import type { ForecastHour } from '../types';
import { buildProfiles, findWindows, type FishingWindow } from '../lib/insights';
import { fetchForecast, weatherGroup } from '../lib/weather';
import { windSector, timeOfDay, season } from '../lib/format';
import { moonLabel } from '../lib/moon';
import Breakdown from '../components/Breakdown';
import { EmptyState } from '../components/EmptyState';

function count<T>(items: T[], key: (t: T) => string | undefined): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export default function InsightsPage() {
  const catches = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.filter((c) => !c.deleted);
    },
    [],
  ) ?? [];
  const [forecast, setForecast] = useState<ForecastHour[] | null>(null);

  const profiles = useMemo(() => {
    const strict = buildProfiles(catches, 3);
    return strict.length > 0 ? strict : buildProfiles(catches, 2);
  }, [catches]);

  const homeSpot = useMemo(() => {
    const located = catches.filter((c) => c.lat != null && c.lon != null);
    if (located.length === 0) return null;
    const lats = located.map((c) => c.lat!).sort((a, b) => a - b);
    const lons = located.map((c) => c.lon!).sort((a, b) => a - b);
    return { lat: lats[Math.floor(lats.length / 2)], lon: lons[Math.floor(lons.length / 2)] };
  }, [catches]);

  useEffect(() => {
    if (homeSpot && navigator.onLine) {
      fetchForecast(homeSpot.lat, homeSpot.lon).then(setForecast).catch(() => {});
    }
  }, [homeSpot]);

  const windowsBySpecies = useMemo(() => {
    if (!forecast) return new Map<string, FishingWindow[]>();
    const map = new Map<string, FishingWindow[]>();
    for (const p of profiles.slice(0, 5)) {
      map.set(p.species, findWindows(p, forecast));
    }
    return map;
  }, [profiles, forecast]);

  return (
    <div className="px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-20">
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-ink">Patterns</h1>

      {catches.length < 3 ? (
        <EmptyState
          icon="insights"
          title="Not enough data yet"
          message="Log a few more catches and Caught will start spotting your best fishing conditions automatically."
        />
      ) : (
        <div className="flex flex-col gap-4 pb-6">
          {profiles.slice(0, 5).map((p) => {
            const windows = windowsBySpecies.get(p.species) ?? [];
            return (
              <section key={p.species} className="card p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold capitalize text-ink">{p.species}</h2>
                  <span className="text-xs font-bold text-ink-3">{p.count} catches</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.summary}</p>
                {windows.length > 0 && (
                  <div className="mt-3 rounded-2xl p-3" style={{ background: 'var(--c-accent-bg)' }}>
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--c-accent)' }}>
                      <CalendarClock size={14} /> Similar conditions expected
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {windows.map((w) => (
                        <span key={w.time} className="rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--c-surface)', color: 'var(--c-accent)' }}>
                          {w.label} · {w.score}/{w.maxScore}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {profiles.length === 0 && (
            <p className="px-4 text-center text-sm text-ink-3">
              Add species names to your catches to unlock pattern insights.
            </p>
          )}

          <h2 className="mt-2 px-1 text-lg font-extrabold text-ink">Breakdown</h2>
          <Breakdown title="By species" data={count(catches, (c) => c.species?.toLowerCase())} />
          <Breakdown
            title="By time of day"
            data={count(catches, (c) => timeOfDay(new Date(c.createdAt)))}
          />
          <Breakdown
            title="By weather"
            data={count(catches, (c) =>
              c.conditions?.weatherCode != null ? weatherGroup(c.conditions.weatherCode) : undefined,
            )}
          />
          <Breakdown
            title="By pressure trend"
            data={count(catches, (c) => c.conditions?.pressureTrend)}
          />
          <Breakdown
            title="By wind direction"
            data={count(catches, (c) =>
              c.conditions?.windDir != null ? windSector(c.conditions.windDir) : undefined,
            )}
          />
          <Breakdown
            title="By moon phase"
            data={count(catches, (c) =>
              c.conditions?.moonPhase != null ? moonLabel(c.conditions.moonPhase) : undefined,
            )}
          />
          <Breakdown
            title="By season"
            data={count(catches, (c) => season(new Date(c.createdAt)))}
          />
          <Breakdown title="By water type" data={count(catches, (c) => c.waterType)} />
          <Breakdown title="By tide" data={count(catches, (c) => c.conditions?.tideState)} />
        </div>
      )}
    </div>
  );
}
