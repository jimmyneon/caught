import { fmtDate } from '../lib/format';
import type { DayForecast, ScoreFactor } from '../lib/fishingForecast';
import { Gauge, Wind, Thermometer, Cloud, Droplets, Waves, Sunrise, Sunset } from 'lucide-react';

const FACTOR_ICONS: Record<string, typeof Gauge> = {
  pressure: Gauge,
  wind: Wind,
  temperature: Thermometer,
  'cloud cover': Cloud,
  precipitation: Droplets,
  tide: Waves,
};

function factorColor(score: number): string {
  if (score >= 0.7) return '#5ba85b';
  if (score >= 0.4) return '#d4943a';
  return '#c75450';
}

function factorBg(score: number): string {
  if (score >= 0.7) return 'rgba(91, 168, 91, 0.12)';
  if (score >= 0.4) return 'rgba(212, 148, 58, 0.12)';
  return 'rgba(199, 84, 80, 0.10)';
}

function getFactorValue(forecast: DayForecast, label: string): string {
  switch (label.toLowerCase()) {
    case 'pressure': return `${Math.round(forecast.pressureHpa)} hPa`;
    case 'wind': return `${Math.round(forecast.windKph)} km/h`;
    case 'temperature': return `${Math.round(forecast.tempC)}°C`;
    case 'cloud cover': return `${Math.round(forecast.cloudCover)}%`;
    case 'precipitation': return forecast.precipMm > 0 ? `${forecast.precipMm.toFixed(1)}mm` : 'Dry';
    case 'tide':
      return forecast.tideTimes && forecast.tideTimes.length > 0
        ? forecast.tideTimes.map((t) => `${t.type} ${t.time}`).join(', ')
        : 'No tide data';
    default: return '';
  }
}

function getFactorExplanation(label: string, forecast: DayForecast): string {
  switch (label.toLowerCase()) {
    case 'pressure':
      return `Barometric pressure affects fish swim bladders. ${forecast.pressureTrend === 'falling' ? 'Falling pressure triggers feeding as fish sense an approaching front.' : forecast.pressureTrend === 'rising' ? 'Rising pressure after a front can slow feeding.' : 'Steady pressure means predictable, consistent fishing.'}`;
    case 'wind':
      return `Wind pushes plankton and baitfish toward the windward shore. ${forecast.windKph > 20 ? 'Strong wind makes casting difficult and unsafe.' : forecast.windKph < 3 ? 'Very little wind means fish may be spooked in clear water.' : 'Light to moderate wind creates ideal surface chop.'}`;
    case 'temperature':
      return `Fish are cold-blooded — water temperature controls their metabolism. ${forecast.tempC >= 12 && forecast.tempC <= 22 ? 'This temperature range keeps fish actively feeding.' : forecast.tempC < 8 ? 'Cold water slows fish metabolism — they feed less.' : 'Warm water can push fish to deeper, cooler areas.'}`;
    case 'cloud cover':
      return `Cloud cover acts as a dimmer switch. ${forecast.cloudCover >= 60 ? 'Overcast skies extend feeding windows beyond dawn/dusk.' : forecast.cloudCover >= 30 ? 'Partly cloudy brings short feeding bursts.' : 'Bright sun pushes fish deep — focus on dawn/dusk only.'}`;
    case 'precipitation':
      return forecast.precipMm > 0
        ? `${forecast.precipMm <= 5 ? 'Light rain oxygenates water and washes in food — excellent.' : forecast.precipMm <= 15 ? 'Moderate rain is okay but watch water clarity.' : 'Heavy rain reduces visibility and shuts down feeding.'}`
        : 'Dry conditions are fine — fish feed on their normal schedule.';
    case 'tide':
      return forecast.tideTimes && forecast.tideTimes.length > 0
        ? `Tide changes trigger feeding. ${forecast.tideTimes.map((t) => `${t.type} at ${t.time} (${t.height}m)`).join(', ')}.`
        : 'Tide data not available for this location.';
    default: return '';
  }
}

interface Props {
  factorLabel: string;
  forecasts: DayForecast[];
  scores: { factors: ScoreFactor[] }[];
  selectedIndex: number;
}

export default function FactorWeekView({ factorLabel, forecasts, scores, selectedIndex }: Props) {
  const Icon = FACTOR_ICONS[factorLabel.toLowerCase()] ?? Gauge;
  const selectedFc = forecasts[selectedIndex];
  const selectedFactor = scores[selectedIndex]?.factors.find((f) => f.label.toLowerCase() === factorLabel.toLowerCase());

  return (
    <div className="flex flex-col gap-4">
      {/* Header with icon and label */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: selectedFactor ? factorBg(selectedFactor.score) : 'var(--c-surface-3)',
            color: selectedFactor ? factorColor(selectedFactor.score) : 'var(--c-ink-2)',
          }}
        >
          <Icon size={24} />
        </div>
        <div>
          <div className="text-lg font-extrabold text-ink">{factorLabel}</div>
          <div className="text-xs text-ink-3">{forecasts.length}-day overview</div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedFactor && (
        <div className="rounded-xl p-3" style={{ background: 'var(--c-surface-3)' }}>
          <div className="mb-1 text-xs font-bold text-ink-3">{fmtDate(selectedFc.date)}</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink">{selectedFactor.detail}</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: factorBg(selectedFactor.score), color: factorColor(selectedFactor.score) }}
            >
              {selectedFactor.score >= 0.7 ? 'Good' : selectedFactor.score >= 0.4 ? 'OK' : 'Poor'}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-2">{getFactorExplanation(factorLabel, selectedFc)}</p>
        </div>
      )}

      {/* Day-by-day list */}
      <div className="flex flex-col gap-1.5">
        {forecasts.map((fc, i) => {
          const factor = scores[i]?.factors.find((f) => f.label.toLowerCase() === factorLabel.toLowerCase());
          if (!factor) return null;
          const isSel = i === selectedIndex;
          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg p-2"
              style={{ background: isSel ? 'var(--c-accent-bg)' : 'transparent' }}
            >
              <div className="w-12 shrink-0 text-xs font-bold text-ink-3">{fmtDate(fc.date).split(' ')[0]}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--c-surface-3)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${factor.score * 100}%`, background: factorColor(factor.score) }}
                />
              </div>
              <div className="w-20 shrink-0 text-right text-xs font-medium text-ink-2">{getFactorValue(fc, factorLabel)}</div>
            </div>
          );
        })}
      </div>

      {/* Sunrise/sunset for selected day */}
      {(selectedFc.sunrise || selectedFc.sunset) && (
        <div className="flex justify-center gap-6">
          {selectedFc.sunrise && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-3"><Sunrise size={14} /> {selectedFc.sunrise}</div>
          )}
          {selectedFc.sunset && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-3"><Sunset size={14} /> {selectedFc.sunset}</div>
          )}
        </div>
      )}
    </div>
  );
}
