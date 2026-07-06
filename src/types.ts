export type WaterType = 'sea' | 'river' | 'lake' | 'canal' | 'reservoir' | 'pond' | 'stream' | 'estuary' | 'stillwater' | 'loch';

export type PressureTrend = 'rising' | 'falling' | 'steady';

export interface Conditions {
  tempC?: number;
  weatherCode?: number;
  weatherLabel?: string;
  cloudCover?: number;
  windKph?: number;
  windDir?: number;
  pressureHpa?: number;
  pressureTrend?: PressureTrend;
  moonPhase?: number;
  moonLabel?: string;
  tideState?: 'rising' | 'falling' | 'high' | 'low';
  tideHeightM?: number;
  waterTempC?: number;
  waveHeightM?: number;
  visibilityKm?: number;
  humidity?: number;
}

export interface CatchRecord {
  id: string;
  createdAt: number;
  lat?: number;
  lon?: number;
  species?: string;
  weightKg?: number;
  photo?: string;
  method?: string;
  baitSubType?: string;
  waterType?: WaterType;
  notes?: string;
  kept?: boolean;
  complete: boolean;
  conditions?: Conditions;
  syncedAt?: number;
  deleted?: boolean;
}

export type Theme = 'dawn' | 'dusk';

export interface Settings {
  units: 'metric' | 'imperial';
  tempUnit: 'celsius' | 'fahrenheit';
  saveLocation: boolean;
  favouriteSpecies: string[];
  favouriteBaits: string[];
  defaultWaterType?: WaterType;
  theme: Theme;
}

export interface ForecastHour {
  time: number;
  tempC: number;
  code: number;
  windKph: number;
  windDir: number;
  pressure: number;
}
