import { useState, useEffect, useRef } from 'react';
import { Loader2, Check, MapPin, Search, Navigation, Clock, Calendar, Cloud, Wind, Gauge, Waves, Droplets, Thermometer, Info } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { fetchMultiDayForecast } from '../lib/forecastFetch';
import { scoreDay, FISHING_TYPES, PERIOD_OPTIONS, getCriteria } from '../lib/fishingForecast';
import type { FishingType, DayForecast, DayScore } from '../lib/fishingForecast';
import { weatherIcon } from '../lib/weatherIcons';
import { fmtDate } from '../lib/format';
import { searchLocations, type GeoLocation } from '../lib/geoSearch';
import BottomSheet from '../components/BottomSheet';

function ratingColor(rating: DayScore['rating']): string {
  switch (rating) {
    case 'excellent': return '#2d8659';
    case 'good': return '#5ba85b';
    case 'fair': return '#d4943a';
    case 'poor': return '#c75450';
  }
}

function ratingBg(rating: DayScore['rating']): string {
  switch (rating) {
    case 'excellent': return 'rgba(45, 134, 89, 0.12)';
    case 'good': return 'rgba(91, 168, 91, 0.12)';
    case 'fair': return 'rgba(212, 148, 58, 0.12)';
    case 'poor': return 'rgba(199, 84, 80, 0.08)';
  }
}

function tempDisplay(c: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') return `${Math.round(c * 9 / 5 + 32)}°F`;
  return `${Math.round(c)}°C`;
}

const FACTOR_ICONS: Record<string, typeof Gauge> = {
  pressure: Gauge,
  wind: Wind,
  temperature: Thermometer,
  'cloud cover': Cloud,
  precipitation: Droplets,
  tide: Waves,
};

interface SavedForecast {
  forecasts: DayForecast[];
  scores: DayScore[];
  fishingType: FishingType;
  location: GeoLocation | null;
  savedAt: number;
}

const STORAGE_KEY = 'caught_forecast_cache';

export default function PlanPage() {
  const [settings] = useSettings();
  const [fishingType, setFishingType] = useState<FishingType>('coarse');
  const [period, setPeriod] = useState<number>(7);
  const [typeOpen, setTypeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<DayScore[]>([]);
  const [forecasts, setForecasts] = useState<DayForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationMode, setLocationMode] = useState<'current' | 'search'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [calendarConfirm, setCalendarConfirm] = useState<DayScore | null>(null);

  const longPressTimer = useRef<number | null>(null);

  // Load saved forecast on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: SavedForecast = JSON.parse(saved);
        setForecasts(data.forecasts);
        setScores(data.scores);
        setFishingType(data.fishingType);
        setLocation(data.location);
        setHasPrevious(true);
      } catch { /* ignore */ }
    }
  }, []);

  // Save forecast when we get new data
  useEffect(() => {
    if (forecasts.length > 0 && scores.length > 0) {
      const data: SavedForecast = { forecasts, scores, fishingType, location, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHasPrevious(true);
    }
  }, [forecasts, scores, fishingType, location]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try { setSearchResults(await searchLocations(searchQuery)); }
      catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const runForecast = async () => {
    setLoading(true);
    setError(null);
    setScores([]);
    setSelectedDay(null);

    let lat: number | undefined = location?.lat;
    let lon: number | undefined = location?.lon;

    if (locationMode === 'current' || (!lat && !lon)) {
      if (!('geolocation' in navigator)) {
        setError('Location not available on this device');
        setLoading(false);
        return;
      }
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        setLocation({ lat, lon, name: 'Current location' });
      } catch {
        setError('Enable location access to get your fishing forecast');
        setLoading(false);
        return;
      }
    }

    try {
      const daily = await fetchMultiDayForecast(lat!, lon!, period);
      setForecasts(daily);
      setScores(daily.map((d) => scoreDay(d, fishingType)));
    } catch {
      setError('Could not fetch forecast. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (forecasts.length > 0) {
      setScores(forecasts.map((d) => scoreDay(d, fishingType)));
    }
  }, [fishingType]);

  const selectedType = FISHING_TYPES.find((t) => t.value === fishingType)!;
  const bestDay = scores.length > 0 ? scores.reduce((best, s) => (s.score > best.score ? s : best)) : null;
  const tempUnit = settings.tempUnit ?? 'celsius';

  const addToCalendar = (score: DayScore) => {
    const date = new Date(score.date);
    const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(date.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(`Fishing trip — ${score.rating} (${score.score})`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${endDate}&details=${encodeURIComponent('Best times: ' + score.bestTimes.join(', '))}`;
    window.open(url, '_blank');
  };

  const startLongPress = (score: DayScore) => {
    longPressTimer.current = window.setTimeout(() => setCalendarConfirm(score), 500);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  return (
    <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-20">
      <header className="mb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-ink">Fishing forecast</h1>
      </header>

      {/* Location + type — compact selectors */}
      <div className="mb-3 flex flex-col gap-2">
        <button className="field flex items-center gap-2" onClick={() => setShowLocationMenu(true)}>
          <MapPin size={16} style={{ color: 'var(--c-ink-3)' }} />
          <span className="flex-1 text-left text-sm font-medium truncate" style={{ color: location ? 'var(--c-ink)' : 'var(--c-ink-3)' }}>
            {location ? location.name : 'Choose location…'}
          </span>
        </button>

        <button
          className="field flex items-center justify-between"
          onClick={() => setTypeOpen(true)}
        >
          <span className="font-bold text-ink text-sm">{selectedType.label}</span>
          <span className="text-xs text-ink-3">{selectedType.description}</span>
        </button>
      </div>

      {/* Location slide-up */}
      <BottomSheet open={showLocationMenu} onClose={() => setShowLocationMenu(false)}>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-extrabold text-ink">Location</h2>

          <button
            className="flex w-full items-center gap-3 rounded-xl p-3.5 text-sm font-bold transition-colors active:bg-surface-3"
            style={{ background: locationMode === 'current' ? 'var(--c-accent-bg)' : 'var(--c-surface-3)', color: locationMode === 'current' ? 'var(--c-accent)' : 'var(--c-ink)' }}
            onClick={() => { setLocationMode('current'); setLocation(null); setShowLocationMenu(false); }}
          >
            <Navigation size={18} /> Use current location
            {locationMode === 'current' && <Check size={16} className="ml-auto" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: 'var(--c-line)' }} />
            <span className="text-xs font-bold text-ink-3">OR SEARCH</span>
            <div className="h-px flex-1" style={{ background: 'var(--c-line)' }} />
          </div>

          <div className="relative">
            <input
              className="field pl-11"
              placeholder="Search a town or city…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setLocationMode('search'); }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-ink-3)' }} />
            {searching && <Loader2 size={16} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-ink-3)' }} />}
          </div>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {searchResults.map((r) => (
                <button
                  key={`${r.lat}-${r.lon}`}
                  className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-sm transition-colors active:bg-surface-3"
                  style={{ background: 'var(--c-surface-3)' }}
                  onClick={() => { setLocation(r); setLocationMode('search'); setSearchQuery(''); setSearchResults([]); setShowLocationMenu(false); }}
                >
                  <MapPin size={16} style={{ color: 'var(--c-ink-3)' }} />
                  <div className="flex flex-col">
                    <span className="font-bold text-ink">{r.name}</span>
                    {r.country && <span className="text-xs text-ink-3">{r.country}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Fishing type slide-up */}
      <BottomSheet open={typeOpen} onClose={() => setTypeOpen(false)}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold text-ink mb-1">Fishing type</h2>
          {FISHING_TYPES.map((t) => {
            const crit = getCriteria(t.value);
            return (
              <button
                key={t.value}
                type="button"
                className="flex w-full items-start gap-3 rounded-xl p-3.5 text-left transition-colors active:bg-surface-3"
                style={{ background: fishingType === t.value ? 'var(--c-accent-bg)' : 'var(--c-surface-3)' }}
                onClick={() => { setFishingType(t.value); setTypeOpen(false); }}
              >
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: fishingType === t.value ? 'var(--c-accent)' : 'var(--c-ink)' }}>
                    {t.label}
                  </div>
                  <div className="text-xs text-ink-3">{t.description}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink-3">
                    Season: {crit.season.label}
                  </div>
                </div>
                {fishingType === t.value && <Check size={18} style={{ color: 'var(--c-accent)' }} />}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Period selector */}
      <div className="mb-3">
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95"
              style={
                period === p
                  ? { background: 'var(--c-accent)', color: '#fff' }
                  : { background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }
              }
              onClick={() => setPeriod(p)}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Get forecast button */}
      <button
        className="btn-primary mb-4 w-full"
        onClick={runForecast}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </span>
        ) : hasPrevious ? (
          'Refresh forecast'
        ) : (
          'Get forecast'
        )}
      </button>

      {error && (
        <div className="mb-4 rounded-xl p-3.5 text-sm font-medium" style={{ background: 'var(--c-red-soft)', color: 'var(--c-red-accent)' }}>
          {error}
        </div>
      )}

      {/* Best day — simple highlight, tap for details */}
      {bestDay && (
        <button
          className="mb-4 w-full rounded-2xl p-4 text-left transition-transform active:scale-[0.98]"
          style={{ background: ratingBg(bestDay.rating), border: `1px solid ${ratingColor(bestDay.rating)}30` }}
          onClick={() => setSelectedDay(scores.findIndex((s) => s.date === bestDay.date))}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: ratingColor(bestDay.rating) }}>Best day</div>
              <div className="mt-0.5 text-base font-extrabold text-ink">{fmtDate(bestDay.date)}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold" style={{ color: ratingColor(bestDay.rating) }}>{bestDay.score}</div>
              <div className="text-xs font-bold capitalize" style={{ color: ratingColor(bestDay.rating) }}>{bestDay.rating}</div>
            </div>
          </div>
          {bestDay.bestTimes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {bestDay.bestTimes.slice(0, 4).map((t, i) => (
                <span key={i} className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--c-surface)', color: 'var(--c-ink-2)' }}>{t}</span>
              ))}
            </div>
          )}
        </button>
      )}

      {/* Day list — simple, tap for detail, long-press for calendar */}
      {scores.length > 0 && (
        <div className="flex flex-col gap-2 pb-4">
          {scores.map((s, i) => {
            const fc = forecasts[i];
            const WeatherIcon = weatherIcon(fc.weatherCode);
            return (
              <button
                key={i}
                className="card flex w-full items-center gap-3 p-3 text-left transition-transform active:scale-[0.98]"
                style={{ borderLeft: `3px solid ${ratingColor(s.rating)}` }}
                onClick={() => setSelectedDay(i)}
                onTouchStart={() => startLongPress(s)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-ink">{fmtDate(s.date)}</span>
                    <span className="text-lg font-extrabold" style={{ color: ratingColor(s.rating) }}>{s.score}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
                    <WeatherIcon size={14} />
                    <span>{tempDisplay(fc.maxTempC, tempUnit)}</span>
                    <span>·</span>
                    <Wind size={11} />
                    <span>{Math.round(fc.windKph)}km/h</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Day detail — slide up */}
      <BottomSheet open={selectedDay !== null} onClose={() => setSelectedDay(null)}>
        {selectedDay !== null && scores[selectedDay] && (
          <div className="flex flex-col gap-4">
            {/* Score header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-ink">{fmtDate(scores[selectedDay].date)}</div>
                <div className="text-xs text-ink-3 capitalize">{scores[selectedDay].rating}</div>
              </div>
              <div className="text-3xl font-extrabold" style={{ color: ratingColor(scores[selectedDay].rating) }}>
                {scores[selectedDay].score}
              </div>
            </div>

            {/* Best times */}
            {scores[selectedDay].bestTimes.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-3">
                  <Clock size={12} /> Best times
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scores[selectedDay].bestTimes.map((t, ti) => (
                    <span key={ti} className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: 'var(--c-accent-bg)', color: 'var(--c-accent)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Why — short bullet points */}
            {scores[selectedDay].reasoning.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-3">
                  <Info size={12} /> Conditions
                </div>
                <ul className="flex flex-col gap-1.5">
                  {scores[selectedDay].reasoning.map((r, ri) => (
                    <li key={ri} className="text-sm leading-relaxed text-ink-2">{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Factor bars — visual only */}
            <div className="flex flex-col gap-2.5">
              {scores[selectedDay].factors.map((f) => {
                const Icon = FACTOR_ICONS[f.label.toLowerCase()] ?? Gauge;
                return (
                  <div key={f.label} className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: f.good ? 'rgba(91, 168, 91, 0.12)' : f.score >= 0.4 ? 'rgba(212, 148, 58, 0.12)' : 'rgba(199, 84, 80, 0.10)',
                        color: f.good ? '#5ba85b' : f.score >= 0.4 ? '#d4943a' : '#c75450',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--c-surface-3)' }}>
                      <div className="h-full rounded-full" style={{ width: `${f.score * 100}%`, background: f.score >= 0.7 ? '#5ba85b' : f.score >= 0.4 ? '#d4943a' : '#c75450' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add to calendar */}
            <button
              className="btn-secondary flex items-center justify-center gap-2"
              onClick={() => { addToCalendar(scores[selectedDay]); setSelectedDay(null); }}
            >
              <Calendar size={16} /> Add to Google Calendar
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Calendar confirm popup */}
      <BottomSheet open={calendarConfirm !== null} onClose={() => setCalendarConfirm(null)}>
        {calendarConfirm && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-ink">Add to calendar?</h2>
            <div className="rounded-xl p-4" style={{ background: ratingBg(calendarConfirm.rating) }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">{fmtDate(calendarConfirm.date)}</div>
                  <div className="text-xs capitalize text-ink-3">{calendarConfirm.rating}</div>
                </div>
                <div className="text-2xl font-extrabold" style={{ color: ratingColor(calendarConfirm.rating) }}>
                  {calendarConfirm.score}
                </div>
              </div>
              {calendarConfirm.bestTimes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {calendarConfirm.bestTimes.map((t, i) => (
                    <span key={i} className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--c-surface)', color: 'var(--c-ink-2)' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary flex-1"
                onClick={() => setCalendarConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={() => { addToCalendar(calendarConfirm); setCalendarConfirm(null); }}
              >
                <Calendar size={16} /> Add
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
