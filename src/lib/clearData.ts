import { db } from '../db';

const LOCALSTORAGE_KEYS = [
  'caught-settings',
  'caught-settings-updated-at',
  'caught_calendar_plans',
  'caught_log_view',
  'caught-gps-permission',
  'caught-gps-prompt-count',
  'caught-gps-last-prompt',
];

/**
 * Wipes all local data — localStorage settings, calendar plans, and IndexedDB catches.
 * Does NOT clear Supabase auth session (that's handled by supabase.auth.signOut()).
 */
export async function clearLocalData(): Promise<void> {
  // Clear localStorage keys
  for (const key of LOCALSTORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  // Clear IndexedDB catches
  try {
    await db.catches.clear();
  } catch (e) {
    console.error('[clearData] Error clearing IndexedDB:', e);
  }

  // Dispatch settings change event so UI updates
  window.dispatchEvent(new Event('caught-settings-changed'));
}
