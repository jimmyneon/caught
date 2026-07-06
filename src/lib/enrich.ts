import { db } from '../db';
import type { CatchRecord, Conditions } from '../types';
import { getPosition } from './geo';
import { moonPhase, moonLabel } from './moon';
import { fetchConditionsAt, fetchTideAt } from './weather';

export async function enrichCatch(id: string, saveLocation: boolean): Promise<void> {
  const rec = await db.catches.get(id);
  if (!rec) return;
  const date = new Date(rec.createdAt);
  const phase = moonPhase(date);
  let conditions: Conditions = {
    ...rec.conditions,
    moonPhase: phase,
    moonLabel: moonLabel(phase),
  };
  const updates: Partial<CatchRecord> = {};

  let lat = rec.lat;
  let lon = rec.lon;
  if (saveLocation && lat == null) {
    try {
      const pos = await getPosition();
      lat = Math.round(pos.coords.latitude * 100000) / 100000;
      lon = Math.round(pos.coords.longitude * 100000) / 100000;
      updates.lat = lat;
      updates.lon = lon;
    } catch {
      /* location denied or unavailable */
    }
  }

  if (lat != null && lon != null && navigator.onLine) {
    try {
      conditions = { ...conditions, ...(await fetchConditionsAt(lat, lon, date)) };
    } catch {
      /* keep offline record, retry later */
    }
    try {
      conditions = { ...conditions, ...(await fetchTideAt(lat, lon, date)) };
    } catch {
      /* inland or no tide data */
    }
  }

  await db.catches.update(id, { ...updates, conditions });
}

export async function retryPendingEnrichment(saveLocation: boolean): Promise<void> {
  if (!navigator.onLine) return;
  const cutoff = Date.now() - 7 * 86400000;
  const pending = await db.catches
    .where('createdAt')
    .above(cutoff)
    .filter((c) => c.conditions?.weatherCode == null)
    .toArray();
  for (const c of pending) {
    await enrichCatch(c.id, saveLocation && c.lat == null);
  }
}
