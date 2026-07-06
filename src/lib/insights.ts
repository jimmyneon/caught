import type { CatchRecord, ForecastHour } from '../types';
import { weatherGroup } from './weather';
import { windSector, WIND_NAMES, windStrength, timeOfDay, season, fmtDay } from './format';
import { moonLabel } from './moon';

export interface SpeciesProfile {
  species: string;
  count: number;
  weather: string;
  windSector: string;
  windStrength: string;
  pressureTrend: string;
  tempLo: number;
  tempHi: number;
  timeOfDay: string;
  season: string;
  moon: string;
  summary: string;
}

export interface FishingWindow {
  time: number;
  label: string;
  score: number;
  maxScore: number;
}

function mode(values: (string | undefined)[]): string | undefined {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestN = 0;
  counts.forEach((n, v) => {
    if (n > bestN) {
      bestN = n;
      best = v;
    }
  });
  return best;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export function buildProfiles(catches: CatchRecord[], minCatches = 3): SpeciesProfile[] {
  const bySpecies = new Map<string, CatchRecord[]>();
  for (const c of catches) {
    if (!c.species) continue;
    const key = c.species.trim().toLowerCase();
    bySpecies.set(key, [...(bySpecies.get(key) ?? []), c]);
  }
  const profiles: SpeciesProfile[] = [];
  bySpecies.forEach((recs) => {
    const withCond = recs.filter((r) => r.conditions?.weatherCode != null);
    if (withCond.length < minCatches) return;
    const conds = withCond.map((r) => r.conditions!);
    const temps = conds.map((c) => c.tempC!).filter((t) => t != null);
    const tempLo = Math.round(Math.min(...temps));
    const tempHi = Math.round(Math.max(...temps));
    const p: SpeciesProfile = {
      species: withCond[0].species!,
      count: withCond.length,
      weather: mode(conds.map((c) => weatherGroup(c.weatherCode!))) ?? 'clear',
      windSector: mode(conds.map((c) => (c.windDir != null ? windSector(c.windDir) : undefined))) ?? 'SW',
      windStrength: windStrength(median(conds.map((c) => c.windKph ?? 10))),
      pressureTrend: mode(conds.map((c) => c.pressureTrend)) ?? 'steady',
      tempLo,
      tempHi,
      timeOfDay: mode(withCond.map((r) => timeOfDay(new Date(r.createdAt)))) ?? 'morning',
      season: mode(withCond.map((r) => season(new Date(r.createdAt)))) ?? 'summer',
      moon: mode(conds.map((c) => (c.moonPhase != null ? moonLabel(c.moonPhase) : undefined))) ?? 'Full moon',
      summary: '',
    };
    p.summary =
      `Your best ${p.species.toLowerCase()} catches usually happen in ${p.weather} weather, ` +
      `${p.windStrength} ${WIND_NAMES[p.windSector]} wind, ${p.pressureTrend} pressure, ` +
      `and air temperature between ${tempLo}\u2013${tempHi}\u00B0C.`;
    profiles.push(p);
  });
  return profiles.sort((a, b) => b.count - a.count);
}

function scoreHour(p: SpeciesProfile, hours: ForecastHour[], i: number): number {
  const h = hours[i];
  let score = 0;
  if (weatherGroup(h.code) === p.weather) score += 2;
  if (windSector(h.windDir) === p.windSector) score += 1;
  if (h.tempC >= p.tempLo - 1 && h.tempC <= p.tempHi + 1) score += 1;
  const prev = hours[Math.max(0, i - 3)];
  const delta = h.pressure - prev.pressure;
  const trend = delta > 1 ? 'rising' : delta < -1 ? 'falling' : 'steady';
  if (trend === p.pressureTrend) score += 1;
  if (timeOfDay(new Date(h.time)) === p.timeOfDay) score += 1;
  return score;
}

export const MAX_SCORE = 6;

export function findWindows(p: SpeciesProfile, hours: ForecastHour[]): FishingWindow[] {
  const now = Date.now();
  const buckets = new Map<string, FishingWindow>();
  hours.forEach((h, i) => {
    if (h.time < now) return;
    const d = new Date(h.time);
    const hr = d.getHours();
    if (hr < 5 || hr > 21) return;
    const score = scoreHour(p, hours, i);
    if (score < 4) return;
    const key = `${d.toDateString()}-${timeOfDay(d)}`;
    const existing = buckets.get(key);
    if (!existing || score > existing.score) {
      buckets.set(key, {
        time: h.time,
        label: `${fmtDay(h.time)} ${timeOfDay(d)}`,
        score,
        maxScore: MAX_SCORE,
      });
    }
  });
  return [...buckets.values()].sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 3);
}
