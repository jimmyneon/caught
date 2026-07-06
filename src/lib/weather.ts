import type { Conditions, ForecastHour, PressureTrend } from '../types';

const WEATHER_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Freezing fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

export function weatherLabel(code: number): string {
  return WEATHER_LABELS[code] ?? 'Unknown';
}

export function weatherGroup(code: number): string {
  if (code <= 1) return 'clear';
  if (code === 2) return 'partly cloudy';
  if (code === 3) return 'overcast';
  if (code <= 48) return 'foggy';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rainy';
  if (code <= 86) return 'snowy';
  return 'stormy';
}

function pressureTrend(hourly: number[], idx: number): PressureTrend | undefined {
  const from = hourly[Math.max(0, idx - 3)];
  const now = hourly[idx];
  if (from == null || now == null) return undefined;
  const delta = now - from;
  if (delta > 1) return 'rising';
  if (delta < -1) return 'falling';
  return 'steady';
}

function nearestHourIndex(times: string[], date: Date): number {
  const target = date.getTime();
  let best = 0;
  let bestDiff = Infinity;
  times.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

export async function fetchConditionsAt(lat: number, lon: number, date: Date): Promise<Partial<Conditions>> {
  const daysAgo = Math.ceil((Date.now() - date.getTime()) / 86400000);
  const pastDays = Math.min(7, Math.max(0, daysAgo));
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,visibility,relative_humidity_2m` +
    `&past_days=${pastDays}&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  const h = data.hourly;
  const idx = nearestHourIndex(h.time, date);
  return {
    tempC: h.temperature_2m[idx],
    weatherCode: h.weather_code[idx],
    weatherLabel: weatherLabel(h.weather_code[idx]),
    windKph: h.wind_speed_10m[idx],
    windDir: h.wind_direction_10m[idx],
    pressureHpa: h.surface_pressure[idx],
    pressureTrend: pressureTrend(h.surface_pressure, idx),
    cloudCover: h.cloud_cover[idx],
    visibilityKm: h.visibility?.[idx],
    humidity: h.relative_humidity_2m?.[idx],
  };
}

export async function fetchTideAt(lat: number, lon: number, date: Date): Promise<Partial<Conditions>> {
  const daysAgo = Math.ceil((Date.now() - date.getTime()) / 86400000);
  const pastDays = Math.min(7, Math.max(0, daysAgo));
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&hourly=sea_level_height_msl,sea_surface_temperature,wave_height&past_days=${pastDays}&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Tide fetch failed');
  const data = await res.json();
  const h = data.hourly;
  const heights: (number | null)[] = h?.sea_level_height_msl ?? [];
  const idx = nearestHourIndex(h.time, date);
  const now = heights[idx];
  const prev = heights[idx - 1];
  const next = heights[idx + 1];

  const result: Partial<Conditions> = {};

  if (now != null) {
    let state: Conditions['tideState'] = now > (prev ?? now) ? 'rising' : 'falling';
    if (next != null) {
      if (now >= (prev ?? now) && now >= next) state = 'high';
      if (now <= (prev ?? now) && now <= next) state = 'low';
    }
    result.tideState = state;
    result.tideHeightM = Math.round(now * 100) / 100;
  }

  const sst = h?.sea_surface_temperature?.[idx];
  if (sst != null) result.waterTempC = Math.round(sst * 10) / 10;

  const wave = h?.wave_height?.[idx];
  if (wave != null) result.waveHeightM = Math.round(wave * 10) / 10;

  return result;
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastHour[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure` +
    `&forecast_days=6&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast fetch failed');
  const data = await res.json();
  const h = data.hourly;
  return h.time.map((t: string, i: number) => ({
    time: new Date(t).getTime(),
    tempC: h.temperature_2m[i],
    code: h.weather_code[i],
    windKph: h.wind_speed_10m[i],
    windDir: h.wind_direction_10m[i],
    pressure: h.surface_pressure[i],
  }));
}
