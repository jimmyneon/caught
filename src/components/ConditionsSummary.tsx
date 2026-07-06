import type { Conditions } from '../types';
import { windSector } from '../lib/format';
import { weatherIcon } from '../lib/weatherIcons';
import { weatherLabel } from '../lib/weather';
import { moonLabel, moonEmoji } from '../lib/moon';
import { Thermometer, Wind, Gauge, Waves, Cloud, Droplets, Moon as MoonIcon, Eye } from 'lucide-react';
import type { ComponentType } from 'react';

export interface CondItem {
  icon: ComponentType<{ size?: number; color?: string }>;
  value: string;
  label: string;
  detail: string;
  color: string;
}

interface Props {
  conditions?: Conditions;
  onItemClick?: (item: CondItem) => void;
}

function ratingCol(score: 'good' | 'ok' | 'bad'): string {
  if (score === 'good') return '#5ba85b';
  if (score === 'ok') return '#d4943a';
  return '#c75450';
}

function tempRating(t: number): 'good' | 'ok' | 'bad' {
  if (t >= 12 && t <= 22) return 'good';
  if (t >= 8 && t <= 26) return 'ok';
  return 'bad';
}
function windRating(k: number): 'good' | 'ok' | 'bad' {
  if (k >= 3 && k <= 15) return 'good';
  if (k <= 25) return 'ok';
  return 'bad';
}
function pressureRating(h: number): 'good' | 'ok' | 'bad' {
  if (h >= 1006 && h <= 1020) return 'good';
  if (h >= 1000 && h <= 1025) return 'ok';
  return 'bad';
}
function cloudRating(c: number): 'good' | 'ok' | 'bad' {
  if (c >= 50) return 'good';
  if (c >= 25) return 'ok';
  return 'bad';
}

export default function ConditionsSummary({ conditions, onItemClick }: Props) {
  if (!conditions) {
    return (
      <div className="rounded-xl p-3 text-sm text-ink-3" style={{ background: 'var(--c-surface-3)' }}>
        No conditions recorded
      </div>
    );
  }

  const c = conditions;
  const WeatherIcon = c.weatherCode != null ? weatherIcon(c.weatherCode) : Cloud;
  const items: CondItem[] = [];

  items.push({
    icon: WeatherIcon,
    value: c.weatherLabel ?? weatherLabel(c.weatherCode ?? 0),
    label: 'Weather',
    detail: c.cloudCover != null ? `${Math.round(c.cloudCover)}% cloud cover` : 'Current conditions',
    color: c.cloudCover != null ? ratingCol(cloudRating(c.cloudCover)) : 'var(--c-ink-3)',
  });

  if (c.tempC != null) {
    items.push({
      icon: Thermometer,
      value: `${Math.round(c.tempC)}°`,
      label: 'Temperature',
      detail: `Air temperature ${Math.round(c.tempC)}°C`,
      color: ratingCol(tempRating(c.tempC)),
    });
  }

  if (c.windDir != null) {
    items.push({
      icon: Wind,
      value: `${Math.round(c.windKph ?? 0)} ${windSector(c.windDir)}`,
      label: 'Wind',
      detail: `${Math.round(c.windKph ?? 0)} km/h from ${windSector(c.windDir)}`,
      color: ratingCol(windRating(c.windKph ?? 0)),
    });
  }

  if (c.pressureHpa != null) {
    items.push({
      icon: Gauge,
      value: `${Math.round(c.pressureHpa)}`,
      label: 'Pressure',
      detail: `${Math.round(c.pressureHpa)} hPa · ${c.pressureTrend ?? 'steady'}`,
      color: ratingCol(pressureRating(c.pressureHpa)),
    });
  }

  if (c.tideState) {
    items.push({
      icon: Waves,
      value: c.tideState,
      label: 'Tide',
      detail: `Tide is ${c.tideState}${c.tideHeightM != null ? ` · ${c.tideHeightM}m` : ''}`,
      color: 'var(--c-ink-2)',
    });
  }

  if (c.waterTempC != null) {
    items.push({
      icon: Droplets,
      value: `${Math.round(c.waterTempC)}°`,
      label: 'Water temp',
      detail: `Water temperature ${Math.round(c.waterTempC)}°C`,
      color: ratingCol(tempRating(c.waterTempC)),
    });
  }

  if (c.moonPhase != null) {
    items.push({
      icon: MoonIcon,
      value: moonLabel(c.moonPhase),
      label: 'Moon',
      detail: `${moonLabel(c.moonPhase)} ${moonEmoji(c.moonPhase)}`,
      color: 'var(--c-ink-3)',
    });
  }

  if (c.visibilityKm != null) {
    items.push({
      icon: Eye,
      value: `${c.visibilityKm}km`,
      label: 'Visibility',
      detail: `Visibility ${c.visibilityKm} km`,
      color: 'var(--c-ink-3)',
    });
  }

  const half = Math.ceil(items.length / 2);
  const row1 = items.slice(0, half);
  const row2 = items.slice(half);

  const renderItem = (item: CondItem, i: number) => {
    const Icon = item.icon;
    return (
      <button
        key={i}
        className="flex flex-1 items-center justify-center rounded-2xl py-3.5 transition-colors active:bg-surface-3"
        style={{ background: 'var(--c-surface-3)' }}
        onClick={() => onItemClick?.(item)}
      >
        <Icon size={32} color={item.color} />
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">{row1.map(renderItem)}</div>
      {row2.length > 0 && <div className="flex gap-3">{row2.map(renderItem)}</div>}
    </div>
  );
}
