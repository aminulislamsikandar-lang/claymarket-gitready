// Real-world place/region search using OpenStreetMap's Nominatim geocoding
// service. This is free and requires no API key, unlike Google Places
// Autocomplete. Nominatim's usage policy (max ~1 request/second, no bulk
// automation) is respected by the caller debouncing keystrokes before
// invoking this function. See: https://operations.osmfoundation.org/policies/nominatim/

export interface PlaceSuggestion {
  id: string;
  label: string;
  sublabel: string;
  lat: number;
  lon: number;
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(trimmed)}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Place lookup failed.');

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((place: any) => {
    const addr = place.address || {};
    const primary =
      place.name ||
      addr.city || addr.town || addr.village || addr.county ||
      String(place.display_name || '').split(',')[0];
    const sublabel = [addr.state, addr.country].filter(Boolean).join(', ');

    return {
      id: String(place.place_id ?? `${place.lat}_${place.lon}`),
      label: String(primary || trimmed),
      sublabel,
      lat: Number(place.lat),
      lon: Number(place.lon),
    };
  });
}
