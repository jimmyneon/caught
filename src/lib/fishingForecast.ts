export type FishingType = 'trout' | 'coarse' | 'sea' | 'predator' | 'carp';

export interface DayForecast {
  date: number;
  tempC: number;
  minTempC: number;
  maxTempC: number;
  weatherCode: number;
  windKph: number;
  windDir: number;
  pressureHpa: number;
  pressureTrend: 'rising' | 'falling' | 'steady';
  cloudCover: number;
  precipMm: number;
  humidity: number;
  tideTimes?: { time: string; height: number; type: 'high' | 'low' }[];
  waveHeightM?: number;
  waterTempC?: number;
  sunrise?: string;
  sunset?: string;
}

export interface DayScore {
  date: number;
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  factors: ScoreFactor[];
  bestTimes: string[];
  reasoning: string[];
}

export interface ScoreFactor {
  label: string;
  score: number;
  detail: string;
  icon: string;
  good: boolean;
}

interface Criteria {
  pressureRange: [number, number];
  optimalPressure: [number, number];
  windRange: [number, number];
  optimalWind: [number, number];
  tempRange: [number, number];
  optimalTemp: [number, number];
  prefersCloud: boolean;
  prefersRain: boolean;
  prefersFallingPressure: boolean;
  windDirections: number[];
  usesTide: boolean;
  waterTempMax?: number;
  waterTempIdeal?: number;
  season: { months: number[]; label: string };
  typeSpecificTips: string[];
}

const CRITERIA: Record<FishingType, Criteria> = {
  trout: {
    pressureRange: [1000, 1025],
    optimalPressure: [1006, 1018],
    windRange: [0, 20],
    optimalWind: [3, 12],
    tempRange: [8, 22],
    optimalTemp: [12, 18],
    prefersCloud: true,
    prefersRain: true,
    prefersFallingPressure: true,
    windDirections: [180, 200, 220, 240, 260],
    usesTide: false,
    waterTempMax: 20,
    waterTempIdeal: 14,
    season: { months: [3, 4, 5, 6, 9, 10], label: 'Mar–Jun & Sep–Oct' },
    typeSpecificTips: [
      'Trout stop feeding when water temp exceeds 20°C — fish early morning or move to deeper pools',
      'Ideal water temperature is around 14°C',
      'During summer, focus on fast-flowing rivers and streams where oxygen levels stay high',
      'Respect the close season (typically Oct–Mar on rivers for brown trout)',
    ],
  },
  coarse: {
    pressureRange: [1005, 1030],
    optimalPressure: [1010, 1020],
    windRange: [0, 18],
    optimalWind: [3, 10],
    tempRange: [5, 25],
    optimalTemp: [14, 20],
    prefersCloud: true,
    prefersRain: true,
    prefersFallingPressure: true,
    windDirections: [180, 200, 220, 240, 260],
    usesTide: false,
    season: { months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], label: 'Year-round' },
    typeSpecificTips: [
      'Coarse fishing is year-round on stillwaters, but rivers have a close season (Mar 15–Jun 15)',
      'Fish feed more actively in warm overcast conditions',
    ],
  },
  sea: {
    pressureRange: [1000, 1025],
    optimalPressure: [1006, 1018],
    windRange: [0, 25],
    optimalWind: [5, 15],
    tempRange: [8, 24],
    optimalTemp: [14, 20],
    prefersCloud: true,
    prefersRain: false,
    prefersFallingPressure: true,
    windDirections: [180, 200, 220, 240, 260],
    usesTide: true,
    season: { months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], label: 'Year-round' },
    typeSpecificTips: [
      'Fish around tide changes — the hour either side of high or low tide is prime',
      'Spring tides (full/new moon) bring bigger tides and more fish movement',
      'Onshore winds push baitfish toward the shore — fish the windward side',
      'Check local tide tables — some marks fish best on the flood, others on the ebb',
    ],
  },
  predator: {
    pressureRange: [1005, 1025],
    optimalPressure: [1008, 1018],
    windRange: [0, 22],
    optimalWind: [5, 14],
    tempRange: [8, 26],
    optimalTemp: [15, 22],
    prefersCloud: true,
    prefersRain: true,
    prefersFallingPressure: true,
    windDirections: [180, 200, 220, 240, 260],
    usesTide: false,
    season: { months: [10, 11, 12, 1, 2, 3], label: 'Oct–Mar (best in winter)' },
    typeSpecificTips: [
      'Pike and perch are most active in cooler months — winter is prime season',
      'Respect the close season on rivers (Mar 15–Jun 15)',
      'Deadbaits work best in cold water, lures as water warms',
    ],
  },
  carp: {
    pressureRange: [1008, 1025],
    optimalPressure: [1012, 1020],
    windRange: [0, 15],
    optimalWind: [2, 10],
    tempRange: [12, 28],
    optimalTemp: [18, 24],
    prefersCloud: true,
    prefersRain: false,
    prefersFallingPressure: false,
    windDirections: [180, 200, 220, 240, 260],
    usesTide: false,
    season: { months: [4, 5, 6, 7, 8, 9, 10], label: 'Apr–Oct' },
    typeSpecificTips: [
      'Carp are most active in warm months — water temp above 12°C is key',
      'Pre-baiting and consistent feeding patterns produce best results',
      'Warm nights in summer can produce excellent surface feeding',
    ],
  },
};

function scoreInRange(value: number, range: [number, number], optimal: [number, number]): number {
  if (value < range[0] || value > range[1]) return 0;
  if (value >= optimal[0] && value <= optimal[1]) return 1;
  const distFromOptimal = value < optimal[0]
    ? optimal[0] - value
    : value - optimal[1];
  const maxDist = value < optimal[0]
    ? optimal[0] - range[0]
    : range[1] - optimal[1];
  return Math.max(0, 1 - distFromOptimal / maxDist);
}

function isWindFavorable(dir: number, favorable: number[]): boolean {
  return favorable.some((d) => {
    const diff = Math.abs(((dir - d + 540) % 360) - 180);
    return diff < 45;
  });
}

export function scoreDay(forecast: DayForecast, type: FishingType): DayScore {
  const c = CRITERIA[type];
  const factors: ScoreFactor[] = [];
  const reasoning: string[] = [];
  const bestTimes: string[] = [];

  // Check if in season
  const month = new Date(forecast.date).getMonth();
  const inSeason = c.season.months.includes(month);
  if (!inSeason) {
    reasoning.push(`Out of peak season for ${type} fishing (best: ${c.season.label})`);
  }

  // Water temperature check (if data available and criteria defined)
  if (c.waterTempMax != null && forecast.waterTempC != null) {
    if (forecast.waterTempC > c.waterTempMax) {
      reasoning.push(`Water temperature ${Math.round(forecast.waterTempC)}°C exceeds the safe limit of ${c.waterTempMax}°C — fish are stressed and not feeding`);
    } else if (c.waterTempIdeal != null && Math.abs(forecast.waterTempC - c.waterTempIdeal) <= 3) {
      reasoning.push(`Water temperature ${Math.round(forecast.waterTempC)}°C is near ideal (${c.waterTempIdeal}°C)`);
    }
  }

  // Pressure (25% weight)
  const pressureScore = scoreInRange(forecast.pressureHpa, c.pressureRange, c.optimalPressure);
  let pressureBonus = 0;
  if (c.prefersFallingPressure && forecast.pressureTrend === 'falling') {
    pressureBonus = 0.3;
    reasoning.push('Falling pressure triggers feeding — fish sense an approaching front');
  }
  const finalPressureScore = Math.min(1, pressureScore + pressureBonus);
  factors.push({
    label: 'Pressure',
    score: finalPressureScore,
    detail: `${Math.round(forecast.pressureHpa)} hPa · ${forecast.pressureTrend}`,
    icon: 'gauge',
    good: finalPressureScore >= 0.6,
  });
  if (finalPressureScore < 0.4) {
    reasoning.push(`Pressure ${Math.round(forecast.pressureHpa)} hPa is outside the ideal range for ${type}`);
  }

  // Wind (20% weight)
  const windScore = scoreInRange(forecast.windKph, c.windRange, c.optimalWind);
  const windFavorable = isWindFavorable(forecast.windDir, c.windDirections);
  const windDirBonus = windFavorable ? 0.2 : 0;
  const finalWindScore = Math.min(1, windScore + windDirBonus);
  factors.push({
    label: 'Wind',
    score: finalWindScore,
    detail: `${Math.round(forecast.windKph)} km/h`,
    icon: 'wind',
    good: finalWindScore >= 0.6,
  });
  if (windFavorable && finalWindScore >= 0.6) {
    reasoning.push('Favourable wind direction pushes baitfish toward shore');
  }
  if (forecast.windKph > c.windRange[1]) {
    reasoning.push(`Wind ${Math.round(forecast.windKph)} km/h is too strong for comfortable fishing`);
  }

  // Temperature (15% weight)
  const tempScore = scoreInRange(forecast.tempC, c.tempRange, c.optimalTemp);
  factors.push({
    label: 'Temperature',
    score: tempScore,
    detail: `${Math.round(forecast.tempC)}°C`,
    icon: 'thermometer',
    good: tempScore >= 0.6,
  });

  // Cloud cover (15% weight)
  let cloudScore = 0.5;
  if (c.prefersCloud) {
    if (forecast.cloudCover >= 60) cloudScore = 1;
    else if (forecast.cloudCover >= 40) cloudScore = 0.7;
    else if (forecast.cloudCover >= 20) cloudScore = 0.4;
    else cloudScore = 0.2;
  } else {
    cloudScore = 0.6;
  }
  factors.push({
    label: 'Cloud cover',
    score: cloudScore,
    detail: `${Math.round(forecast.cloudCover)}%`,
    icon: 'cloud',
    good: cloudScore >= 0.6,
  });
  if (cloudScore >= 0.8 && c.prefersCloud) {
    reasoning.push('Overcast skies extend feeding windows beyond dawn/dusk');
  }

  // Precipitation (10% weight)
  let precipScore = 0.5;
  if (c.prefersRain) {
    if (forecast.precipMm > 0 && forecast.precipMm <= 5) precipScore = 1;
    else if (forecast.precipMm > 5 && forecast.precipMm <= 15) precipScore = 0.6;
    else if (forecast.precipMm > 15) precipScore = 0.2;
    else precipScore = 0.5;
  } else {
    if (forecast.precipMm <= 1) precipScore = 0.9;
    else if (forecast.precipMm <= 5) precipScore = 0.6;
    else precipScore = 0.3;
  }
  factors.push({
    label: 'Precipitation',
    score: precipScore,
    detail: forecast.precipMm > 0 ? `${forecast.precipMm.toFixed(1)} mm` : 'Dry',
    icon: 'rain',
    good: precipScore >= 0.6,
  });

  // Tide (15% weight for sea fishing, 0% otherwise)
  let tideScore = 0;
  let weights: { pressure: number; wind: number; temp: number; cloud: number; precip: number; tide: number };

  if (c.usesTide && forecast.tideTimes && forecast.tideTimes.length > 0) {
    // Best tide: a tide time within 2 hours of dawn or dusk, or a changing tide (high to low)
    const highTides = forecast.tideTimes.filter((t) => t.type === 'high');
    const lowTides = forecast.tideTimes.filter((t) => t.type === 'low');
    const hasBoth = highTides.length > 0 && lowTides.length > 0;

    if (hasBoth) {
      tideScore = 1;
      reasoning.push('Two tide changes mean multiple feeding windows');
    } else if (highTides.length >= 2 || lowTides.length >= 2) {
      tideScore = 0.7;
    } else {
      tideScore = 0.5;
    }

    // Add tide times to best times
    for (const t of forecast.tideTimes) {
      bestTimes.push(`${t.time} (${t.type} tide)`);
    }

    factors.push({
      label: 'Tide',
      score: tideScore,
      detail: forecast.tideTimes.map((t) => `${t.type} ${t.time}`).join(', '),
      icon: 'waves',
      good: tideScore >= 0.6,
    });

    weights = { pressure: 0.20, wind: 0.18, temp: 0.12, cloud: 0.12, precip: 0.08, tide: 0.15 };
  } else {
    weights = { pressure: 0.25, wind: 0.20, temp: 0.15, cloud: 0.15, precip: 0.10, tide: 0 };
  }

  // Best fishing times: dawn/dusk + tide times
  if (forecast.sunrise) bestTimes.push(`${forecast.sunrise} (dawn)`);
  if (forecast.sunset) bestTimes.push(`${forecast.sunset} (dusk)`);
  if (bestTimes.length === 0) {
    bestTimes.push('Dawn & dusk (standard feeding times)');
  }

  const total =
    finalPressureScore * weights.pressure +
    finalWindScore * weights.wind +
    tempScore * weights.temp +
    cloudScore * weights.cloud +
    precipScore * weights.precip +
    tideScore * weights.tide;

  const score = Math.round(total * 100);
  let rating: DayScore['rating'] = 'poor';
  if (score >= 70) rating = 'excellent';
  else if (score >= 55) rating = 'good';
  else if (score >= 40) rating = 'fair';

  if (rating === 'excellent' || rating === 'good') {
    reasoning.unshift(`Conditions align well for ${type} fishing`);
  }

  // Add a type-specific tip
  if (c.typeSpecificTips.length > 0) {
    const tip = c.typeSpecificTips[Math.floor(forecast.date / 86400000) % c.typeSpecificTips.length];
    reasoning.push(tip);
  }

  // Out-of-season penalty
  if (!inSeason) {
    // Cap score at fair
    if (rating === 'excellent' || rating === 'good') {
      // Still show the score but note the season
    }
  }

  return { date: forecast.date, score, rating, factors, bestTimes, reasoning };
}

export const FISHING_TYPES: { value: FishingType; label: string; description: string }[] = [
  { value: 'trout', label: 'Trout', description: 'Trout & fly fishing' },
  { value: 'coarse', label: 'Coarse', description: 'General coarse fishing' },
  { value: 'sea', label: 'Sea', description: 'Sea & shore fishing' },
  { value: 'predator', label: 'Predator', description: 'Pike, perch & zander' },
  { value: 'carp', label: 'Carp', description: 'Carp & specimen fishing' },
];

export const PERIOD_OPTIONS = [7, 10, 14] as const;

export function getCriteria(type: FishingType): Criteria {
  return CRITERIA[type];
}
