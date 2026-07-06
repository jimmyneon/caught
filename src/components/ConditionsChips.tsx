import type { Conditions } from '../types';
import { windSector } from '../lib/format';
import { moonEmoji } from '../lib/moon';
import { weatherIcon } from '../lib/weatherIcons';
import { Thermometer, Wind, Gauge, Waves } from 'lucide-react';
import type { ComponentType } from 'react';

function MiniChip({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
      style={{ background: 'var(--c-water-bg)', color: 'var(--c-water)' }}
    >
      <Icon size={11} />
      {children}
    </span>
  );
}

export default function ConditionsChips({ conditions }: { conditions?: Conditions }) {
  if (!conditions) return null;
  const c = conditions;
  const WeatherIcon = c.weatherCode != null ? weatherIcon(c.weatherCode) : Thermometer;
  return (
    <div className="flex flex-wrap gap-1">
      <MiniChip icon={WeatherIcon}>{c.weatherLabel ?? '—'}</MiniChip>
      {c.tempC != null && <MiniChip icon={Thermometer}>{Math.round(c.tempC)}&deg;C</MiniChip>}
      {c.windDir != null && (
        <MiniChip icon={Wind}>
          {windSector(c.windDir)} {Math.round(c.windKph ?? 0)}
        </MiniChip>
      )}
      {c.pressureHpa != null && <MiniChip icon={Gauge}>{Math.round(c.pressureHpa)} hPa</MiniChip>}
      {c.moonPhase != null && <MiniChip icon={Thermometer}>{moonEmoji(c.moonPhase)}</MiniChip>}
      {c.tideState && <MiniChip icon={Waves}>{c.tideState}</MiniChip>}
    </div>
  );
}
