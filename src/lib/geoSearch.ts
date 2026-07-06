export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  countryCode?: string;
  distance?: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchLocations(
  query: string,
  userLat?: number,
  userLon?: number,
): Promise<GeoLocation[]> {
  if (query.trim().length < 2) return [];

  // Use Nominatim (OpenStreetMap) — supports countrycodes + proximity bias
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '10',
    addressdetails: '1',
  });

  // If user is in the UK, bias toward UK results
  if (userLat != null && userLon != null) {
    // Check if user is roughly in the UK
    if (userLat > 49 && userLat < 61 && userLon > -9 && userLon < 2) {
      params.set('countrycodes', 'gb,ie');
    }
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) throw new Error('Nominatim failed');
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    let results: GeoLocation[] = data.map((r: any) => ({
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      name: r.display_name?.split(',')[0] ?? r.name ?? 'Unknown',
      country: [r.address?.city, r.address?.county, r.address?.state, r.address?.country]
        .filter(Boolean).join(', '),
      countryCode: r.address?.country_code?.toUpperCase(),
    }));

    // Sort by distance from user if we have their location
    if (userLat != null && userLon != null) {
      results = results.map((r) => ({
        ...r,
        distance: haversineKm(userLat, userLon, r.lat, r.lon),
      })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    return results;
  } catch {
    // Fallback to Open-Meteo if Nominatim fails
    return searchLocationsFallback(query, userLat, userLon);
  }
}

async function searchLocationsFallback(
  query: string,
  userLat?: number,
  userLon?: number,
): Promise<GeoLocation[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results) return [];

  let results: GeoLocation[] = data.results.map((r: any) => ({
    lat: r.latitude,
    lon: r.longitude,
    name: r.name,
    country: [r.admin1, r.country].filter(Boolean).join(', '),
    countryCode: r.country_code?.toUpperCase(),
  }));

  if (userLat != null && userLon != null) {
    results = results.map((r) => ({
      ...r,
      distance: haversineKm(userLat, userLon, r.lat, r.lon),
    })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  return results;
}
