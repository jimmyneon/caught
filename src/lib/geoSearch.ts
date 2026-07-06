export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country?: string;
}

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((r: { latitude: number; longitude: number; name: string; country?: string; admin1?: string }) => ({
    lat: r.latitude,
    lon: r.longitude,
    name: r.name,
    country: [r.admin1, r.country].filter(Boolean).join(', '),
  }));
}
