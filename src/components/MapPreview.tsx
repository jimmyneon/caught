import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number;
  lon: number;
  height?: number;
}

function pinIcon(): L.DivIcon {
  return L.divIcon({
    html: '<div style="width:24px;height:24px;border-radius:50%;background:#4db5e8;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
    className: 'location-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13);
  }, [lat, lon, map]);
  return null;
}

export default function MapPreview({ lat, lon, height = 180 }: Props) {
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
        <Marker position={[lat, lon]} icon={pinIcon()} />
      </MapContainer>
    </div>
  );
}
