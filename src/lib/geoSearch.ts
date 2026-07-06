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

  // Default to UK + Ireland filtering — only broaden if user is clearly outside UK
  let countrycodes = 'gb,ie';
  if (userLat != null && userLon != null) {
    const inUK = userLat > 49 && userLat < 61 && userLon > -9 && userLon < 2;
    if (!inUK) countrycodes = '';
  }

  // Use Nominatim (OpenStreetMap) — supports countrycodes + address detail
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '10',
    addressdetails: '1',
  });
  if (countrycodes) params.set('countrycodes', countrycodes);

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) throw new Error('Nominatim failed');
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    let results: GeoLocation[] = data.map((r: any) => {
      const a = r.address ?? {};
      // Use r.name (the actual place name from Nominatim) — NOT a.city
      // because in the UK, a.city often contains the district/borough name
      // e.g. Lyndhurst has address.city = "New Forest"
      const name = r.name
        ?? a.village ?? a.town ?? a.hamlet ?? a.suburb
        ?? r.display_name?.split(',')[0]
        ?? 'Unknown';
      // Subtitle: county, state, country — skip city (district name)
      const parts = [
        a.county ?? a.state_district,
        a.state,
        a.country,
      ].filter(Boolean);
      return {
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        name,
        country: parts.join(', '),
        countryCode: a.country_code?.toUpperCase(),
      };
    });

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
    return searchLocationsFallback(query, userLat, userLon, countrycodes);
  }
}

async function searchLocationsFallback(
  query: string,
  userLat?: number,
  userLon?: number,
  countrycodes?: string,
): Promise<GeoLocation[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=20&language=en&format=json`;
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

  // Filter to UK/Ireland if requested
  if (countrycodes) {
    const codes = countrycodes.split(',').map((c) => c.toUpperCase());
    results = results.filter((r) => r.countryCode && codes.includes(r.countryCode));
  }

  if (userLat != null && userLon != null) {
    results = results.map((r) => ({
      ...r,
      distance: haversineKm(userLat, userLon, r.lat, r.lon),
    })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  return results;
}
