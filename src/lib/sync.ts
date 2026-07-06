import { supabase } from './supabase';
import { db } from '../db';
import { loadSettings } from '../hooks/useSettings';
import type { CatchRecord, Settings } from '../types';

function toRow(c: CatchRecord, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    created_at: c.createdAt,
    species: c.species ?? null,
    weight_kg: c.weightKg ?? null,
    photo: c.photo ?? null,
    method: c.method ?? null,
    water_type: c.waterType ?? null,
    notes: c.notes ?? null,
    kept: c.kept ?? null,
    complete: c.complete,
    lat: c.lat ?? null,
    lon: c.lon ?? null,
    conditions: c.conditions ?? null,
    deleted: c.deleted ?? false,
  };
}

function fromRow(row: any): CatchRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    species: row.species ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    photo: row.photo ?? undefined,
    method: row.method ?? undefined,
    waterType: row.water_type ?? undefined,
    notes: row.notes ?? undefined,
    kept: row.kept ?? undefined,
    complete: row.complete,
    lat: row.lat ?? undefined,
    lon: row.lon ?? undefined,
    conditions: row.conditions ?? undefined,
    syncedAt: row.updated_at ?? Date.now(),
    deleted: row.deleted ?? false,
  };
}

// ============================================================
// PUSH QUEUE: Push unsynced local catches to Supabase one-by-one
// If any push fails, stop — remaining catches stay in queue for next attempt
// ============================================================

let pushInProgress = false;

export async function syncPushQueue(userId: string): Promise<void> {
  if (!supabase || pushInProgress) return;
  pushInProgress = true;
  try {
    // Get all catches that need syncing (syncedAt === 0 or undefined)
    const unsynced = await db.catches
      .filter((c) => !c.syncedAt || c.syncedAt === 0)
      .toArray();

    if (unsynced.length === 0) return;

    for (const c of unsynced) {
      const { error } = await supabase.from('catches').upsert(toRow(c, userId));
      if (error) {
        console.error('[sync] Push failed for catch', c.id, error);
        break; // Stop on first error — will retry next time
      }
      // Mark as synced with current timestamp
      await db.catches.update(c.id, { syncedAt: Date.now() });
    }

    // Clean up: remove locally-deleted catches that have been synced
    const syncedDeleted = await db.catches
      .filter((c) => c.deleted === true && c.syncedAt != null && c.syncedAt > 0)
      .toArray();
    for (const c of syncedDeleted) {
      await db.catches.delete(c.id);
    }
  } catch (e) {
    console.error('[sync] Push queue error:', e);
  } finally {
    pushInProgress = false;
  }
}

// ============================================================
// PULL: Fetch remote catches that don't exist locally
// Never overwrites local data — only adds missing records
// ============================================================

export async function pullRemoteCatches(userId: string): Promise<void> {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('catches')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[sync] Pull error:', error);
      return;
    }

    for (const row of data) {
      const existing = await db.catches.get(row.id);
      if (!existing) {
        // Remote catch not in local DB — insert it
        await db.catches.put(fromRow(row));
      }
      // If it exists locally, keep local version (it may have newer edits)
    }
  } catch (e) {
    console.error('[sync] Pull catches error:', e);
  }
}

// ============================================================
// SETTINGS SYNC
// ============================================================

export async function pushSettings(userId: string, settings: Settings): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('settings').upsert({
      user_id: userId,
      units: settings.units,
      temp_unit: settings.tempUnit,
      save_location: settings.saveLocation,
      favourite_species: settings.favouriteSpecies,
      default_water_type: settings.defaultWaterType ?? null,
      theme: settings.theme,
    });
  } catch (e) {
    console.error('[sync] Push settings error:', e);
  }
}

export async function pullSettings(userId: string): Promise<Partial<Settings> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    units: data.units,
    tempUnit: data.temp_unit,
    saveLocation: data.save_location,
    favouriteSpecies: data.favourite_species ?? [],
    defaultWaterType: data.default_water_type ?? undefined,
    theme: data.theme,
  };
}

// ============================================================
// CALENDAR PLANS SYNC
// ============================================================

export async function pushCalendarPlans(userId: string): Promise<void> {
  if (!supabase) return;
  const stored = localStorage.getItem('caught_calendar_plans');
  if (!stored) return;
  try {
    const plans = JSON.parse(stored) as { date: number; rating: string; score: number }[];
    for (const p of plans) {
      await supabase.from('calendar_plans').upsert({
        user_id: userId,
        plan_date: p.date,
        rating: p.rating,
        score: p.score,
      });
    }
  } catch (e) {
    console.error('[sync] Push plans error:', e);
  }
}

export async function pullCalendarPlans(userId: string): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('calendar_plans')
    .select('*')
    .eq('user_id', userId)
    .order('plan_date', { ascending: true });

  if (error || !data) return;

  const plans = data.map((r) => ({
    date: r.plan_date,
    rating: r.rating,
    score: r.score,
  }));
  localStorage.setItem('caught_calendar_plans', JSON.stringify(plans));
}

// ============================================================
// INITIAL SYNC: Called once when user logs in
// Pulls remote catches + settings, then pushes local queue
// ============================================================

export async function initialSync(userId: string): Promise<void> {
  try {
    console.log('[sync] Initial sync for user', userId);
    // 1. Pull remote catches that we don't have locally
    await pullRemoteCatches(userId);
    // 2. Push any unsynced local catches to remote
    await syncPushQueue(userId);
    // 3. Sync settings
    const remoteSettings = await pullSettings(userId);
    if (remoteSettings) {
      const local = loadSettings();
      const merged = { ...local, ...remoteSettings };
      localStorage.setItem('caught-settings', JSON.stringify(merged));
      window.dispatchEvent(new Event('caught-settings-changed'));
    } else {
      await pushSettings(userId, loadSettings());
    }
    // 4. Sync calendar plans
    await pullCalendarPlans(userId);
    await pushCalendarPlans(userId);
    console.log('[sync] Initial sync complete');
  } catch (e) {
    console.error('[sync] Initial sync error:', e);
  }
}

// ============================================================
// LIGHTWEIGHT SYNC: Called on online event + after each save
// Just pushes the queue — no pulling needed for routine saves
// ============================================================

export async function quickSync(userId: string): Promise<void> {
  try {
    await syncPushQueue(userId);
  } catch (e) {
    console.error('[sync] Quick sync error:', e);
  }
}

// ============================================================
// MARK FOR SYNC: Called when a catch is created/updated/deleted
// Sets syncedAt to 0 so the push queue picks it up
// ============================================================

export function markUnsynced(catchId: string): void {
  db.catches.update(catchId, { syncedAt: 0 }).catch((e) =>
    console.error('[sync] markUnsynced error:', e)
  );
}

// Soft-delete: mark as deleted, will be pushed then cleaned up
export async function softDeleteCatch(catchId: string): Promise<void> {
  await db.catches.update(catchId, { deleted: true, syncedAt: 0 });
}

