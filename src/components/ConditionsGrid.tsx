import { useState } from 'react';
import type { Conditions } from '../types';
import { windSector } from '../lib/format';
import { moonLabel, moonEmoji } from '../lib/moon';
import { weatherIcon } from '../lib/weatherIcons';
import { weatherLabel } from '../lib/weather';
import {
  Thermometer,
  Wind,
  Gauge,
  Waves,
  Moon as MoonIcon,
  Eye,
  Droplets,
  Cloud,
  X,
} from 'lucide-react';
import type { ComponentType } from 'react';

type Rating = 'good' | 'ok' | 'bad';

function ratingColor(r: Rating): string {
  switch (r) {
    case 'good': return '#5ba85b';
    case 'ok': return '#d4943a';
    case 'bad': return '#c75450';
  }
}

function ratingBg(r: Rating): string {
  switch (r) {
    case 'good': return 'rgba(91, 168, 91, 0.12)';
    case 'ok': return 'rgba(212, 148, 58, 0.12)';
    case 'bad': return 'rgba(199, 84, 80, 0.10)';
  }
}

interface CondItem {
  icon: ComponentType<{ size?: number }>;
  value: string;
  label: string;
  detail: string;
  rating?: Rating;
}

function tempRating(tempC: number): Rating {
  if (tempC >= 12 && tempC <= 22) return 'good';
  if (tempC >= 8 && tempC <= 26) return 'ok';
  return 'bad';
}

function windRating(kph: number): Rating {
  if (kph >= 3 && kph <= 15) return 'good';
  if (kph <= 25) return 'ok';
  return 'bad';
}

function pressureRating(hpa: number): Rating {
  if (hpa >= 1006 && hpa <= 1020) return 'good';
  if (hpa >= 1000 && hpa <= 1025) return 'ok';
  return 'bad';
}

function cloudRating(cover: number): Rating {
  if (cover >= 50) return 'good';
  if (cover >= 25) return 'ok';
  return 'bad';
}

function humidityRating(h: number): Rating {
  if (h >= 60 && h <= 85) return 'good';
  if (h >= 40 && h <= 95) return 'ok';
  return 'bad';
}

function visibilityRating(km: number): Rating {
  if (km >= 10) return 'good';
  if (km >= 5) return 'ok';
  return 'bad';
}

export default function ConditionsGrid({ conditions }: { conditions?: Conditions }) {
  const [selected, setSelected] = useState<CondItem | null>(null);

  if (!conditions) return null;

  const c = conditions;
  const WeatherIcon = c.weatherCode != null ? weatherIcon(c.weatherCode) : Cloud;
  const items: CondItem[] = [];

  items.push({
    icon: WeatherIcon,
    value: c.weatherLabel ?? weatherLabel(c.weatherCode ?? 0),
    label: 'Weather',
    detail: c.cloudCover != null ? `${Math.round(c.cloudCover)}% cloud cover` : 'Current conditions',
    rating: c.cloudCover != null ? cloudRating(c.cloudCover) : undefined,
  });

  if (c.tempC != null) {
    items.push({
      icon: Thermometer,
      value: `${Math.round(c.tempC)}°`,
      label: 'Temperature',
      detail: `Air temperature ${Math.round(c.tempC)}°C`,
      rating: tempRating(c.tempC),
    });
  }

  if (c.windDir != null) {
    items.push({
      icon: Wind,
      value: `${Math.round(c.windKph ?? 0)}`,
      label: 'Wind',
      detail: `${Math.round(c.windKph ?? 0)} km/h from ${windSector(c.windDir)}`,
      rating: windRating(c.windKph ?? 0),
    });
  }

  if (c.pressureHpa != null) {
    items.push({
      icon: Gauge,
      value: `${Math.round(c.pressureHpa)}`,
      label: 'Pressure',
      detail: `${Math.round(c.pressureHpa)} hPa · ${c.pressureTrend ?? 'steady'}`,
      rating: pressureRating(c.pressureHpa),
    });
  }

  if (c.moonPhase != null) {
    items.push({
      icon: MoonIcon,
      value: moonLabel(c.moonPhase),
      label: 'Moon',
      detail: `${moonLabel(c.moonPhase)} ${moonEmoji(c.moonPhase)}`,
    });
  }

  if (c.tideState) {
    items.push({
      icon: Waves,
      value: c.tideState,
      label: 'Tide',
      detail: `Tide is ${c.tideState}${c.tideHeightM != null ? ` · ${c.tideHeightM}m` : ''}`,
    });
  }

  if (c.waterTempC != null) {
    items.push({
      icon: Thermometer,
      value: `${Math.round(c.waterTempC)}°`,
      label: 'Water',
      detail: `Water temperature ${Math.round(c.waterTempC)}°C`,
      rating: tempRating(c.waterTempC),
    });
  }

  if (c.humidity != null) {
    items.push({
      icon: Droplets,
      value: `${Math.round(c.humidity)}%`,
      label: 'Humidity',
      detail: `${Math.round(c.humidity)}% relative humidity`,
      rating: humidityRating(c.humidity),
    });
  }

  if (c.visibilityKm != null) {
    items.push({
      icon: Eye,
      value: `${Math.round(c.visibilityKm)}km`,
      label: 'Visibility',
      detail: `${Math.round(c.visibilityKm)} km visibility`,
      rating: visibilityRating(c.visibilityKm),
    });
  }

  if (c.waveHeightM != null) {
    items.push({
      icon: Waves,
      value: `${c.waveHeightM}m`,
      label: 'Wave height',
      detail: `${c.waveHeightM}m wave height`,
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          const r = item.rating;
          return (
            <button
              key={i}
              className="flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-transform active:scale-95"
              style={{
                background: r ? ratingBg(r) : 'var(--c-surface-3)',
              }}
              onClick={() => setSelected(item)}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: r ? ratingBg(r) : 'var(--c-surface)',
                  color: r ? ratingColor(r) : 'var(--c-ink-2)',
                }}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">{item.value}</div>
                <div className="truncate text-[10px] font-medium text-ink-3">{item.label}</div>
              </div>
              {r && (
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: ratingColor(r) }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Detail popup */}
      {selected && (
        <div
          className="fixed inset-0 z-1200 flex items-center justify-center p-6"
          style={{ background: 'var(--c-overlay)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="glass relative w-full max-w-xs rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-3"
              onClick={() => setSelected(null)}
            >
              <X size={18} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: selected.rating ? ratingBg(selected.rating) : 'var(--c-surface-3)',
                  color: selected.rating ? ratingColor(selected.rating) : 'var(--c-ink-2)',
                }}
              >
                <selected.icon size={28} />
              </div>
              <div className="text-lg font-extrabold text-ink">{selected.value}</div>
              <div className="mt-0.5 text-xs font-bold uppercase tracking-wide text-ink-3">{selected.label}</div>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{selected.detail}</p>
              {selected.rating && (
                <div
                  className="mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: ratingBg(selected.rating),
                    color: ratingColor(selected.rating),
                  }}
                >
                  <div className="h-2 w-2 rounded-full" style={{ background: ratingColor(selected.rating) }} />
                  {selected.rating === 'good' ? 'Favourable' : selected.rating === 'ok' ? 'Acceptable' : 'Unfavourable'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
