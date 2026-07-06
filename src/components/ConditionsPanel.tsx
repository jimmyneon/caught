import type { Conditions } from '../types';
import { windSector, WIND_NAMES } from '../lib/format';
import { moonEmoji } from '../lib/moon';
import { weatherIcon } from '../lib/weatherIcons';
import {
  Thermometer,
  Wind,
  Gauge,
  Waves,
  Cloud,
  Moon as MoonIcon,
  Eye,
  Droplets,
} from 'lucide-react';
import type { ComponentType } from 'react';

function Row({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: 'var(--c-water-bg)', color: 'var(--c-water)' }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-ink">{value}</div>
        {sub && <div className="text-xs text-ink-3">{sub}</div>}
      </div>
      <div className="text-xs font-medium text-ink-3">{label}</div>
    </div>
  );
}

export default function ConditionsPanel({ conditions }: { conditions?: Conditions }) {
  if (!conditions) {
    return (
      <div className="card p-5 text-center text-sm text-ink-3">
        No conditions recorded for this catch
      </div>
    );
  }

  const c = conditions;
  const WeatherIcon = c.weatherCode != null ? weatherIcon(c.weatherCode) : Cloud;

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--c-line)' }}>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: 'var(--c-water-bg)', color: 'var(--c-water)' }}
        >
          <WeatherIcon size={24} />
        </div>
        <div>
          <div className="text-base font-bold text-ink">{c.weatherLabel ?? 'Unknown'}</div>
          {c.cloudCover != null && (
            <div className="text-xs text-ink-3">{Math.round(c.cloudCover)}% cloud cover</div>
          )}
        </div>
      </div>

      {c.tempC != null && (
        <Row icon={Thermometer} label="Air" value={`${Math.round(c.tempC)}\u00B0C`} />
      )}

      {c.waterTempC != null && (
        <Row icon={Thermometer} label="Water" value={`${c.waterTempC}\u00B0C`} sub="Sea surface temp" />
      )}

      {c.windDir != null && (
        <Row
          icon={Wind}
          label="Wind"
          value={`${Math.round(c.windKph ?? 0)} km/h ${windSector(c.windDir)}`}
          sub={WIND_NAMES[windSector(c.windDir)]}
        />
      )}

      {c.pressureHpa != null && (
        <Row
          icon={Gauge}
          label="Pressure"
          value={`${Math.round(c.pressureHpa)} hPa`}
          sub={c.pressureTrend ? `${c.pressureTrend}` : undefined}
        />
      )}

      {c.moonPhase != null && (
        <Row
          icon={MoonIcon}
          label="Moon"
          value={c.moonLabel ?? 'Unknown'}
          sub={moonEmoji(c.moonPhase)}
        />
      )}

      {c.tideState && (
        <Row
          icon={Waves}
          label="Tide"
          value={`${c.tideState}${c.tideHeightM != null ? ` (${c.tideHeightM}m)` : ''}`}
        />
      )}

      {c.waveHeightM != null && (
        <Row icon={Waves} label="Wave" value={`${c.waveHeightM} m`} />
      )}

      {c.visibilityKm != null && (
        <Row icon={Eye} label="Visibility" value={`${Math.round(c.visibilityKm)} km`} />
      )}

      {c.humidity != null && (
        <Row icon={Droplets} label="Humidity" value={`${Math.round(c.humidity)}%`} />
      )}
    </div>
  );
}
