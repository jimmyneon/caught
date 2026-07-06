import { useLiveQuery } from 'dexie-react-hooks';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Fish } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { db } from '../db';
import { useSettings } from '../hooks/useSettings';
import { formatWeight } from '../lib/units';
import { fmtDate } from '../lib/format';
import { EmptyState } from '../components/EmptyState';

function pinIcon(color: string): L.DivIcon {
  const icon = renderToStaticMarkup(
    <div style={{ position: 'relative', width: 32, height: 32 }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 16 16 16s16-4 16-16C32 7.2 24.8 0 16 0z" fill={color} opacity="0.9"/>
      </svg>
      <div style={{ position: 'absolute', top: 6, left: 0, width: 32, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Fish size={16} strokeWidth={2} color="white" />
      </div>
    </div>
  );
  return L.divIcon({
    html: icon,
    className: 'catch-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}

export default function MapPage() {
  const [settings] = useSettings();
  const catches = useLiveQuery(
    async () => {
      const all = await db.catches.toArray();
      return all.filter((c) => !c.deleted);
    },
    [],
  ) ?? [];

  if (!catches) return null;
  const located = catches.filter((c) => c.lat != null && c.lon != null);

  if (located.length === 0) {
    return (
      <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <h1 className="mb-4 text-xl font-extrabold tracking-tight text-ink">Map</h1>
        <EmptyState
          icon="map"
          title="No mapped catches yet"
          message="Enable GPS location in Settings and your catches will appear on the map automatically."
        />
      </div>
    );
  }

  const last = located[located.length - 1];
  const isDusk = settings.theme === 'dusk';
  const markerColor = isDusk ? '#4db5e8' : '#1a5f8c';

  const tileUrl = isDusk
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="h-full">
      <MapContainer
        center={[last.lat!, last.lon!]}
        zoom={11}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        {located.map((c) => (
          <Marker key={c.id} position={[c.lat!, c.lon!]} icon={pinIcon(markerColor)}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{c.species || 'Unknown fish'}</div>
                <div style={{ color: '#999' }}>
                  {fmtDate(c.createdAt)}
                  {c.weightKg != null && <> &middot; {formatWeight(c.weightKg, settings.units)}</>}
                </div>
                <Link to={`/catch/${c.id}`} className="font-bold" style={{ color: markerColor }}>
                  View catch
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
