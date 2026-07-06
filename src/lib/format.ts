export const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export const WIND_NAMES: Record<string, string> = {
  N: 'northerly',
  NE: 'north-easterly',
  E: 'easterly',
  SE: 'south-easterly',
  S: 'southerly',
  SW: 'south-westerly',
  W: 'westerly',
  NW: 'north-westerly',
};

export function windSector(deg: number): string {
  return COMPASS[Math.round(deg / 45) % 8];
}

export function windStrength(kph: number): string {
  if (kph < 12) return 'light';
  if (kph < 29) return 'moderate';
  return 'strong';
}

export function timeOfDay(d: Date): string {
  const h = d.getHours();
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

export function season(d: Date): string {
  const m = d.getMonth();
  if (m === 11 || m < 2) return 'winter';
  if (m < 5) return 'spring';
  if (m < 8) return 'summer';
  return 'autumn';
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function fmtDay(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const diff = Math.round((d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'long' });
}
