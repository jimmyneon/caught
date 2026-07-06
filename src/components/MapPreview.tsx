import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number;
  lon: number;
  height?: number;
  userLat?: number;
  userLon?: number;
}

function pinIcon(): L.DivIcon {
  return L.divIcon({
    html: '<div style="width:24px;height:24px;border-radius:50%;background:#4db5e8;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
    className: 'location-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    html: '<div style="width:16px;height:16px;border-radius:50%;background:#ff4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
    className: 'user-pin',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13);
  }, [lat, lon, map]);
  return null;
}

export default function MapPreview({ lat, lon, height = 180, userLat, userLon }: Props) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="overflow-hidden rounded-xl" style={{ height }}>
      <MapContainer
        center={[lat, lon]}
        zoom={13}
        className="h-full w-full"
        attributionControl={false}
        zoomControl={false}
        ref={(m) => { mapRef.current = m; }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <Recenter lat={lat} lon={lon} />
        {userLat != null && userLon != null && (
          <Marker position={[userLat, userLon]} icon={userIcon()} />
        )}
        <Marker position={[lat, lon]} icon={pinIcon()} />
      </MapContainer>
    </div>
  );
}
