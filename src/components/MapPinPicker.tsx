import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Check, ChevronDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface Props {
  onConfirm: (lat: number, lon: number) => void;
  onBack: () => void;
  initialLat?: number;
  initialLon?: number;
}

function pinIcon(): L.DivIcon {
  return L.divIcon({
    html: '<div style="width:24px;height:24px;border-radius:50%;background:#4db5e8;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
    className: 'location-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function ClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPinPicker({ onConfirm, onBack, initialLat, initialLon }: Props) {
  const [pinLat, setPinLat] = useState<number | undefined>(initialLat);
  const [pinLon, setPinLon] = useState<number | undefined>(initialLon);
  const mapRef = useRef<L.Map | null>(null);

  const center: [number, number] = pinLat != null && pinLon != null ? [pinLat, pinLon] : [51.5074, -0.1278];

  const useGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPinLat(pos.coords.latitude);
        setPinLon(pos.coords.longitude);
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 14);
      },
      () => {},
    );
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-sm font-bold text-ink-3"
          onClick={onBack}
        >
          <ChevronDown size={16} /> Back
        </button>
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
          style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }}
          onClick={useGPS}
        >
          <Navigation size={14} /> My location
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          attributionControl={false}
          ref={(m) => { mapRef.current = m; }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <ClickHandler onClick={(lat, lon) => { setPinLat(lat); setPinLon(lon); }} />
          {pinLat != null && pinLon != null && (
            <Marker
              position={[pinLat, pinLon]}
              icon={pinIcon()}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const ll = m.getLatLng();
                  setPinLat(ll.lat);
                  setPinLon(ll.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-ink-3">Tap the map or drag the pin to set your location.</p>

      {pinLat != null && pinLon != null && (
        <div className="rounded-xl p-3 text-sm font-bold text-ink" style={{ background: 'var(--c-surface-3)' }}>
          {pinLat.toFixed(5)}, {pinLon.toFixed(5)}
        </div>
      )}

      <button
        className="btn-primary flex items-center justify-center gap-2"
        disabled={pinLat == null}
        onClick={() => pinLat != null && pinLon != null && onConfirm(pinLat, pinLon)}
      >
        <Check size={18} /> Use this location
      </button>
    </div>
  );
}
