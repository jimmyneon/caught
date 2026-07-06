import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Check, X, MapPin, Undo2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import BottomSheet from './BottomSheet';

interface Props {
  lat: number | undefined;
  lon: number | undefined;
  onChange: (lat: number | undefined, lon: number | undefined) => void;
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

export default function LocationPicker({ lat, lon, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draftLat, setDraftLat] = useState<number | undefined>(lat);
  const [draftLon, setDraftLon] = useState<number | undefined>(lon);
  const mapRef = useRef<L.Map | null>(null);
  const origLat = useRef<number | undefined>(lat);
  const origLon = useRef<number | undefined>(lon);

  const openPicker = () => {
    setDraftLat(lat);
    setDraftLon(lon);
    setOpen(true);
  };

  const revertLocation = () => {
    setDraftLat(origLat.current);
    setDraftLon(origLon.current);
    if (origLat.current != null && origLon.current != null) {
      mapRef.current?.setView([origLat.current, origLon.current], 16);
    }
  };

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraftLat(pos.coords.latitude);
        setDraftLon(pos.coords.longitude);
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      () => {},
    );
  };

  const save = () => {
    onChange(draftLat, draftLon);
    setOpen(false);
  };

  const clear = () => {
    onChange(undefined, undefined);
    setOpen(false);
  };

  const center: [number, number] = draftLat != null && draftLon != null ? [draftLat, draftLon] : [51.5074, -0.1278];

  return (
    <>
      {lat != null && lon != null ? (
        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="field flex flex-1 items-center gap-2"
          >
            <MapPin size={18} style={{ color: 'var(--c-accent)' }} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink">
                {lat.toFixed(5)}, {lon.toFixed(5)}
              </span>
              <span className="text-xs text-ink-3">Tap to view in Google Maps</span>
            </div>
          </a>
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--c-accent-bg)', color: 'var(--c-accent)' }}
            onClick={openPicker}
          >
            <MapPin size={18} />
          </button>
        </div>
      ) : (
        <button className="field flex items-center gap-2" onClick={openPicker}>
          <MapPin size={18} style={{ color: 'var(--c-ink-3)' }} />
          <span className="text-sm text-ink-3">Set location on map</span>
        </button>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-extrabold text-ink">Location</h2>

          <div className="flex gap-2">
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors active:bg-surface-3"
              style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink)' }}
              onClick={useCurrentLocation}
            >
              <Navigation size={16} /> Use GPS
            </button>
            {origLat.current != null && (draftLat !== origLat.current || draftLon !== origLon.current) && (
              <button
                className="flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-sm font-bold"
                style={{ background: 'var(--c-surface-3)', color: 'var(--c-ink-2)' }}
                onClick={revertLocation}
              >
                <Undo2 size={14} /> Revert
              </button>
            )}
            {lat != null && (
              <button
                className="flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-sm font-bold"
                style={{ background: 'var(--c-red-soft)', color: 'var(--c-red-accent)' }}
                onClick={clear}
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-xl" style={{ height: '300px' }}>
            <MapContainer
              center={center}
              zoom={13}
              className="h-full w-full"
              attributionControl={false}
              ref={(m) => { mapRef.current = m; }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <ClickHandler onClick={(la, lo) => { setDraftLat(la); setDraftLon(lo); }} />
              {draftLat != null && draftLon != null && (
                <Marker
                  position={[draftLat, draftLon]}
                  icon={pinIcon()}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const m = e.target as L.Marker;
                      const ll = m.getLatLng();
                      setDraftLat(ll.lat);
                      setDraftLon(ll.lng);
                    },
                  }}
                />
              )}
            </MapContainer>
          </div>

          <p className="text-xs text-ink-3">Tap the map or drag the pin to set your precise fishing spot.</p>

          {draftLat != null && draftLon != null && (
            <div className="rounded-xl p-3 text-sm font-bold text-ink" style={{ background: 'var(--c-surface-3)' }}>
              {draftLat.toFixed(5)}, {draftLon.toFixed(5)}
            </div>
          )}

          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={save}
            disabled={draftLat == null}
          >
            <Check size={18} /> Save location
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
