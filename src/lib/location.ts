export interface AppLocation {
  city: string;
  timeZone: string;
  latitude: number;
  longitude: number;
  zip?: string;
}

/**
 * Default location is Yerushalayim (Har Habayis coordinates), matching the
 * reference point that the molad is traditionally calculated for.
 */
export const DEFAULT_LOCATION: AppLocation = {
  city: 'Jerusalem',
  timeZone: 'Asia/Jerusalem',
  latitude: 31.778,
  longitude: 35.2354,
};

/** Shape of the parts of the zippopotam.us response that we use. */
interface ZippopotamResponse {
  places?: Array<{
    'place name': string;
    'state abbreviation'?: string;
    latitude: string;
    longitude: string;
  }>;
}

/**
 * Resolve a US zip code to a location with its IANA timezone. Coordinates come
 * from the free zippopotam.us API (so we don't bundle the multi-megabyte US zip
 * database); the timezone is derived locally from those coordinates with
 * `tz-lookup`, loaded on demand. Returns null for malformed or unknown zips, or
 * if the request fails.
 */
export async function lookupZip(zip: string): Promise<AppLocation | null> {
  const trimmed = zip.trim();
  if (!/^\d{5}$/.test(trimmed)) {
    return null;
  }

  let data: ZippopotamResponse;
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${trimmed}`);
    if (!response.ok) {
      return null;
    }
    data = (await response.json()) as ZippopotamResponse;
  } catch {
    return null;
  }

  const place = data.places?.[0];
  if (!place) {
    return null;
  }
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const tzlookupModule = await import('tz-lookup');
  const timeZone = tzlookupModule.default(latitude, longitude);
  const state = place['state abbreviation'];
  const placeName = place['place name'];
  return {
    city: state ? `${placeName}, ${state}` : placeName,
    timeZone,
    latitude,
    longitude,
    zip: trimmed,
  };
}

/**
 * Derive a readable place name from an IANA timezone, e.g.
 * "America/Los_Angeles" → "Los Angeles", "America/Argentina/Buenos_Aires" →
 * "Buenos Aires". Used for GPS-detected locations, which give us an accurate
 * timezone but no city name (no external geocoding required).
 */
export function cityFromTimeZone(timeZone: string): string {
  const last = timeZone.split('/').pop() ?? timeZone;
  return last.replace(/_/g, ' ');
}

/**
 * Resolve the user's current location via the browser Geolocation API. The
 * coordinates are turned into an IANA timezone with `tz-lookup` (loaded on
 * demand) — that timezone is all the molad math needs. Rejects with a
 * user-friendly message if location services are unavailable or denied.
 */
export async function detectLocation(): Promise<AppLocation> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new Error('Location services are not available in this browser.');
  }

  let position: GeolocationPosition;
  try {
    position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      });
    });
  } catch {
    throw new Error(
      'Could not get your location. Please allow location access or search by zip code.',
    );
  }

  const { latitude, longitude } = position.coords;
  const tzlookupModule = await import('tz-lookup');
  const timeZone = tzlookupModule.default(latitude, longitude);
  return {
    city: cityFromTimeZone(timeZone),
    timeZone,
    latitude,
    longitude,
  };
}
