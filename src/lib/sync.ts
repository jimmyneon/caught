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
    deleted: false,
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
  };
}

export async function pushLocalCatches(userId: string) {
  if (!supabase) return;
  const local = await db.catches.toArray();
  for (const c of local) {
    await supabase.from('catches').upsert(toRow(c, userId));
  }
}

export async function pullRemoteCatches(userId: string) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('catches')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted', false)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('pullRemoteCatches error:', error);
    return;
  }

  for (const row of data) {
    const existing = await db.catches.get(row.id);
    if (!existing) {
      // New remote catch not in local DB — insert it
      await db.catches.put(fromRow(row));
    }
    // If catch exists locally, keep local version (it may have newer edits)
  }
}

export async function pushSettings(userId: string, settings: Settings) {
  if (!supabase) return;
  await supabase.from('settings').upsert({
    user_id: userId,
    units: settings.units,
    temp_unit: settings.tempUnit,
    save_location: settings.saveLocation,
    favourite_species: settings.favouriteSpecies,
    default_water_type: settings.defaultWaterType ?? null,
    theme: settings.theme,
  });
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

export async function pushCalendarPlans(userId: string) {
  if (!supabase) return;
  const stored = localStorage.getItem('caught_calendar_plans');
  if (!stored) return;
  const plans = JSON.parse(stored) as { date: number; rating: string; score: number }[];
  for (const p of plans) {
    await supabase.from('calendar_plans').upsert({
      user_id: userId,
      plan_date: p.date,
      rating: p.rating,
      score: p.score,
    });
  }
}

export async function pullCalendarPlans(userId: string) {
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

export async function fullSync(userId: string) {
  try {
    const localCount = await db.catches.count();
    console.log(`[sync] Starting fullSync for user ${userId}. Local catches: ${localCount}`);
    await pullRemoteCatches(userId);
    await pushLocalCatches(userId);
    // Sync settings
    const remoteSettings = await pullSettings(userId);
    if (remoteSettings) {
      const local = loadSettings();
      const merged = { ...local, ...remoteSettings };
      localStorage.setItem('caught-settings', JSON.stringify(merged));
      window.dispatchEvent(new Event('caught-settings-changed'));
    } else {
      await pushSettings(userId, loadSettings());
    }
    await pullCalendarPlans(userId);
    await pushCalendarPlans(userId);
    const afterCount = await db.catches.count();
    console.log(`[sync] fullSync complete. Local catches: ${afterCount}`);
  } catch (e) {
    console.error('Sync error:', e);
  }
}
