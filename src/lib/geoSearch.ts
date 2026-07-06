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
    limit: '15',
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
      // Priority: r.name > village > town > hamlet > suburb > locality > display_name first part
      // Explicitly avoid a.city in UK because it often contains district/borough name (e.g. "New Forest")
      const name = r.name
        ?? a.village ?? a.town ?? a.hamlet ?? a.suburb ?? a.locality
        ?? r.display_name?.split(',')[0]?.trim()
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

    // Fuzzy match: if the query is close (edit distance ≤ 2) to a result name, boost it
    const q = query.trim().toLowerCase();
    results = results.map((r) => {
      const nameLower = r.name.toLowerCase();
      const dist = levenshtein(q, nameLower);
      const startsWith = nameLower.startsWith(q.slice(0, Math.min(q.length, 3)));
      // Boost exact and near matches
      let score = 0;
      if (nameLower === q) score = 100;
      else if (nameLower.startsWith(q)) score = 80;
      else if (startsWith) score = 40;
      else if (dist <= 2) score = 60;
      else if (dist <= 4 && q.length >= 5) score = 20;
      return { ...r, _score: score };
    });

    // Sort by fuzzy match score, then by distance
    if (userLat != null && userLon != null) {
      results = results.map((r) => ({
        ...r,
        distance: haversineKm(userLat, userLon, r.lat, r.lon),
      }));
    }
    results.sort((a, b) => {
      const sa = (a as any)._score ?? 0;
      const sb = (b as any)._score ?? 0;
      if (sb !== sa) return sb - sa;
      return (a.distance ?? 9999) - (b.distance ?? 9999);
    });

    return results;
  } catch {
    // Fallback to Open-Meteo if Nominatim fails
    return searchLocationsFallback(query, userLat, userLon, countrycodes);
  }
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
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
