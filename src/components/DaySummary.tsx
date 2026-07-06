import { useMemo } from 'react';
import { Fish, Trophy, Clock, Cloud, Wind, Gauge, Droplets, Thermometer, Waves, Target, TrendingUp } from 'lucide-react';
import type { CatchRecord, Settings } from '../types';
import { formatWeight } from '../lib/units';
import { fmtTime, timeOfDay, windStrength } from '../lib/format';
import { weatherIcon } from '../lib/weatherIcons';
import CatchCard from './CatchCard';

interface Props {
  catches: CatchRecord[];
  settings: Settings;
  date: string;
}

export default function DaySummary({ catches, settings, date }: Props) {
  const summary = useMemo(() => {
    if (catches.length === 0) return null;

    // Best fish (heaviest)
    const best = catches.reduce((a, b) =>
      (b.weightKg ?? 0) > (a.weightKg ?? 0) ? b : a
    );

    // Species breakdown
    const speciesMap = new Map<string, number>();
    for (const c of catches) {
      const s = c.species ?? 'Unknown';
      speciesMap.set(s, (speciesMap.get(s) ?? 0) + 1);
    }
    const speciesList = [...speciesMap.entries()].sort((a, b) => b[1] - a[1]);

    // Method/bait breakdown
    const methodMap = new Map<string, number>();
    for (const c of catches) {
      if (!c.method) continue;
      const label = c.baitSubType ? `${c.method} — ${c.baitSubType}` : c.method;
      methodMap.set(label, (methodMap.get(label) ?? 0) + 1);
    }
    const methodList = [...methodMap.entries()].sort((a, b) => b[1] - a[1]);

    // Time analysis
    const times = catches.map((c) => new Date(c.createdAt));
    const hours = times.map((t) => t.getHours());
    const minHour = Math.min(...hours);
    const maxHour = Math.max(...hours);
    const timeOfDayCounts = new Map<string, number>();
    for (const t of times) {
      const tod = timeOfDay(t);
      timeOfDayCounts.set(tod, (timeOfDayCounts.get(tod) ?? 0) + 1);
    }
    const bestTimeOfDay = [...timeOfDayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';

    // Total weight
    const totalWeight = catches.reduce((sum, c) => sum + (c.weightKg ?? 0), 0);

    // Conditions summary (from first catch that has them)
    const catchWithConditions = catches.find((c) => c.conditions);
    const conditions = catchWithConditions?.conditions;

    // Kept vs released
    const kept = catches.filter((c) => c.kept === true).length;
    const released = catches.filter((c) => c.kept === false).length;

    return {
      best,
      speciesList,
      methodList,
      minHour,
      maxHour,
      bestTimeOfDay,
      totalWeight,
      conditions,
      kept,
      released,
    };
  }, [catches]);

  if (!summary) {
    return <p className="text-center text-sm text-ink-3">No catches this day</p>;
  }

  const { best, speciesList, methodList, minHour, maxHour, bestTimeOfDay, totalWeight, conditions, kept, released } = summary;

  const fmtHour = (h: number) => {
    if (h === 0) return '12am';
    if (h < 12) return `${h}am`;
    if (h === 12) return '12pm';
    return `${h - 12}pm`;
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-extrabold text-ink">
        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </h2>

      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card flex flex-col items-center p-3">
          <span className="text-2xl font-extrabold" style={{ color: 'var(--c-accent)' }}>{catches.length}</span>
          <span className="text-xs font-bold text-ink-3">Catches</span>
        </div>
        <div className="card flex flex-col items-center p-3">
          <span className="text-2xl font-extrabold" style={{ color: 'var(--c-accent)' }}>{speciesList.length}</span>
          <span className="text-xs font-bold text-ink-3">Species</span>
        </div>
        <div className="card flex flex-col items-center p-3">
          <span className="text-2xl font-extrabold" style={{ color: 'var(--c-accent)' }}>
            {totalWeight > 0 ? formatWeight(totalWeight, settings.units) : '—'}
          </span>
          <span className="text-xs font-bold text-ink-3">Total</span>
        </div>
      </div>

      {/* Best fish */}
      {best.weightKg != null && (
        <div className="card flex items-center gap-3 p-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--c-accent-bg)' }}>
            <Trophy size={22} style={{ color: 'var(--c-accent)' }} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-ink-3">Best fish</div>
            <div className="text-sm font-bold text-ink">{best.species ?? 'Unknown'}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold" style={{ color: 'var(--c-accent)' }}>
              {formatWeight(best.weightKg, settings.units)}
            </div>
            <div className="text-xs text-ink-3">{fmtTime(best.createdAt)}</div>
          </div>
        </div>
      )}

      {/* Species breakdown */}
      {speciesList.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Fish size={16} style={{ color: 'var(--c-ink-3)' }} />
            <span className="text-xs font-bold uppercase tracking-wide text-ink-3">Species</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {speciesList.map(([name, count]) => (
              <span
                key={name}
                className="rounded-xl px-3 py-2 text-sm font-bold"
                style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink)' }}
              >
                {name} {count > 1 && <span className="text-ink-3">×{count}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Time analysis */}
      <div className="card p-3.5">
        <div className="mb-2 flex items-center gap-2">
          <Clock size={16} style={{ color: 'var(--c-ink-3)' }} />
          <span className="text-xs font-bold uppercase tracking-wide text-ink-3">Times</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-ink">{fmtHour(minHour)} — {fmtHour(maxHour)}</span>
          <span className="text-ink-3 capitalize">{bestTimeOfDay} was best</span>
        </div>
      </div>

      {/* What helped me catch — methods/baits */}
      {methodList.length > 0 && (
        <div className="card p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <Target size={16} style={{ color: 'var(--c-ink-3)' }} />
            <span className="text-xs font-bold uppercase tracking-wide text-ink-3">What worked</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {methodList.map(([method, count]) => (
              <div key={method} className="flex items-center justify-between text-sm">
                <span className="font-bold text-ink">{method}</span>
                <span className="text-ink-3">×{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions summary */}
      {conditions && (
        <div className="card p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <Cloud size={16} style={{ color: 'var(--c-ink-3)' }} />
            <span className="text-xs font-bold uppercase tracking-wide text-ink-3">Weather</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {conditions.tempC != null && (
              <CondItem icon={Thermometer} label="Temp" value={`${Math.round(conditions.tempC)}°C`} />
            )}
            {conditions.weatherLabel && (
              <CondItem icon={weatherIcon(conditions.weatherCode ?? 0)} label="Sky" value={conditions.weatherLabel} />
            )}
            {conditions.windKph != null && (
              <CondItem icon={Wind} label="Wind" value={`${Math.round(conditions.windKph)} km/h ${windStrength(conditions.windKph)}`} />
            )}
            {conditions.pressureHpa != null && (
              <CondItem icon={Gauge} label="Pressure" value={`${Math.round(conditions.pressureHpa)} hPa`} />
            )}
            {conditions.humidity != null && (
              <CondItem icon={Droplets} label="Humidity" value={`${Math.round(conditions.humidity)}%`} />
            )}
            {conditions.tideState && (
              <CondItem icon={Waves} label="Tide" value={conditions.tideState} />
            )}
          </div>
        </div>
      )}

      {/* Insight: when to try again */}
      {conditions && methodList.length > 0 && (
        <div className="card p-3.5" style={{ background: 'var(--c-accent-bg)' }}>
          <div className="mb-1.5 flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--c-accent)' }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--c-accent)' }}>Try again</span>
          </div>
          <p className="text-sm font-medium text-ink">
            {methodList[0][0]} worked well in {bestTimeOfDay}s
            {conditions.weatherLabel ? ` with ${conditions.weatherLabel.toLowerCase()} conditions` : ''}
            {conditions.windKph != null ? ` and ${windStrength(conditions.windKph)} winds` : ''}.
            Look for similar conditions next time.
          </p>
        </div>
      )}

      {/* Kept / released */}
      {(kept > 0 || released > 0) && (
        <div className="flex gap-2">
          {kept > 0 && (
            <span className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }}>
              {kept} kept
            </span>
          )}
          {released > 0 && (
            <span className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }}>
              {released} released
            </span>
          )}
        </div>
      )}

      {/* Individual catches */}
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-3">All catches</div>
        <div className="flex flex-col gap-2">
          {catches.map((c) => (
            <CatchCard key={c.id} record={c} settings={settings} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CondItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} style={{ color: 'var(--c-ink-3)' }} />
      <div>
        <div className="text-xs text-ink-3">{label}</div>
        <div className="text-sm font-bold text-ink capitalize">{value}</div>
      </div>
    </div>
  );
}
