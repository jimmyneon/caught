import type { LiveConditions } from '../hooks/useLiveConditions';
import { windSector } from '../lib/format';
import { moonEmoji } from '../lib/moon';
import { weatherIcon } from '../lib/weatherIcons';
import { Thermometer, Wind, Gauge, Waves, MapPin } from 'lucide-react';
import type { ComponentType } from 'react';

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={16} style={{ color: 'var(--c-accent)' }} />
      <span className="text-sm font-bold text-ink-2">{value}</span>
      <span className="text-[10px] text-ink-3">{label}</span>
    </div>
  );
}

export default function LiveConditionsCard({ conditions }: { conditions: LiveConditions }) {
  if (conditions.loading) {
    return (
      <div className="card flex items-center justify-center gap-2 p-4 text-sm text-ink-3">
        <div
          className="h-4 w-4 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--c-accent-light)', borderTopColor: 'var(--c-accent)' }}
        />
        Reading conditions…
      </div>
    );
  }

  if (conditions.error) {
    return (
      <div className="card flex items-center gap-2 p-4 text-sm text-ink-3">
        <MapPin size={16} />
        Location needed for live conditions
      </div>
    );
  }

  const WeatherIcon = conditions.weatherCode != null ? weatherIcon(conditions.weatherCode) : Thermometer;

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 text-white"
        style={{ background: 'var(--c-accent)' }}
      >
        <WeatherIcon size={32} />
        <div className="flex-1">
          <div className="text-lg font-bold">{conditions.weatherLabel ?? '—'}</div>
          <div className="text-xs opacity-80">
            {conditions.tempC != null ? `${Math.round(conditions.tempC)}\u00B0C` : ''}
            {conditions.moonPhase != null && <> · {moonEmoji(conditions.moonPhase)} {conditions.moonLabel}</>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 p-3">
        {conditions.tempC != null && (
          <MiniStat icon={Thermometer} value={`${Math.round(conditions.tempC)}\u00B0`} label="Temp" />
        )}
        {conditions.windKph != null && (
          <MiniStat icon={Wind} value={`${Math.round(conditions.windKph)}`} label="km/h" />
        )}
        {conditions.pressureHpa != null && (
          <MiniStat icon={Gauge} value={`${Math.round(conditions.pressureHpa)}`} label="hPa" />
        )}
        {conditions.tideState ? (
          <MiniStat icon={Waves} value={conditions.tideState} label="tide" />
        ) : (
          conditions.windDir != null && (
            <MiniStat icon={Wind} value={windSector(conditions.windDir)} label="wind" />
          )
        )}
      </div>
    </div>
  );
}
