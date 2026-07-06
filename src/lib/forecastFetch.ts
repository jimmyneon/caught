import type { DayForecast } from './fishingForecast';

export async function fetchMultiDayForecast(
  lat: number,
  lon: number,
  days: number,
): Promise<DayForecast[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,` +
    `wind_direction_10m_dominant,surface_pressure_mean,cloud_cover_mean,precipitation_sum,` +
    `relative_humidity_2m_mean,sunrise,sunset` +
    `&forecast_days=${days}&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast fetch failed');
  const data = await res.json();
  const d = data.daily;

  // Fetch marine data in parallel for tide times
  let marineData: { tides?: { time: string; height: number; type: 'high' | 'low' }[]; waveHeight?: number; waterTemp?: number }[] = [];
  try {
    marineData = await fetchMarineDaily(lat, lon, days);
  } catch {
    // Marine data is optional
  }

  return d.time.map((t: string, i: number) => {
    const date = new Date(t).getTime();
    const pressure = d.surface_pressure_mean[i];
    const prevPressure = i > 0 ? d.surface_pressure_mean[i - 1] : pressure;
    const delta = pressure - prevPressure;

    const sunrise = d.sunrise?.[i] ? new Date(d.sunrise[i]).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined;
    const sunset = d.sunset?.[i] ? new Date(d.sunset[i]).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined;

    return {
      date,
      tempC: Math.round(((d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2) * 10) / 10,
      minTempC: d.temperature_2m_min[i],
      maxTempC: d.temperature_2m_max[i],
      weatherCode: d.weather_code[i],
      windKph: d.wind_speed_10m_max[i],
      windDir: d.wind_direction_10m_dominant[i],
      pressureHpa: Math.round(pressure),
      pressureTrend: delta > 1 ? 'rising' as const : delta < -1 ? 'falling' as const : 'steady' as const,
      cloudCover: Math.round(d.cloud_cover_mean[i]),
      precipMm: d.precipitation_sum[i],
      humidity: Math.round(d.relative_humidity_2m_mean[i]),
      sunrise,
      sunset,
      tideTimes: marineData[i]?.tides,
      waveHeightM: marineData[i]?.waveHeight,
      waterTempC: marineData[i]?.waterTemp,
    };
  });
}

async function fetchMarineDaily(
  lat: number,
  lon: number,
  days: number,
): Promise<{ tides?: { time: string; height: number; type: 'high' | 'low' }[]; waveHeight?: number; waterTemp?: number }[]> {
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&hourly=sea_level_height_msl,sea_surface_temperature,wave_height` +
    `&forecast_days=${days}&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const h = data.hourly;
  if (!h?.time) return [];

  // Group hourly tide data by day and find high/low points
  const dayMap = new Map<string, { time: string; height: number }[]>();

  h.time.forEach((t: string, i: number) => {
    const height = h.sea_level_height_msl?.[i];
    if (height == null) return;
    const dayKey = t.split('T')[0];
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, []);
    dayMap.get(dayKey)!.push({ time: t, height });
  });

  const dayKeys = [...dayMap.keys()].sort();

  return dayKeys.map((dayKey) => {
    const hours = dayMap.get(dayKey)!;
    const tides: { time: string; height: number; type: 'high' | 'low' }[] = [];

    for (let i = 1; i < hours.length - 1; i++) {
      const prev = hours[i - 1].height;
      const curr = hours[i].height;
      const next = hours[i + 1].height;
      if (curr >= prev && curr >= next) {
        tides.push({
          time: new Date(hours[i].time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          height: Math.round(curr * 10) / 10,
          type: 'high',
        });
      } else if (curr <= prev && curr <= next) {
        tides.push({
          time: new Date(hours[i].time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          height: Math.round(curr * 10) / 10,
          type: 'low',
        });
      }
    }

    // Get daily wave height max and water temp mean for this day
    const dayHours = h.time.filter((t: string) => t.split('T')[0] === dayKey);
    const dayIndices = dayHours.map((_: string, idx: number) => h.time.indexOf(dayHours[idx]));
    const waveHeights = dayIndices.map((idx: number) => h.wave_height?.[idx]).filter((v: number | null) => v != null);
    const waterTemps = dayIndices.map((idx: number) => h.sea_surface_temperature?.[idx]).filter((v: number | null) => v != null);

    return {
      tides: tides.length > 0 ? tides.slice(0, 4) : undefined,
      waveHeight: waveHeights.length > 0 ? Math.round(Math.max(...waveHeights) * 10) / 10 : undefined,
      waterTemp: waterTemps.length > 0 ? Math.round((waterTemps.reduce((a: number, b: number) => a + b, 0) / waterTemps.length) * 10) / 10 : undefined,
    };
  });
}
