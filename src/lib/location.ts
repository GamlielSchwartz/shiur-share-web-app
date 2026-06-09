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

/**
 * Resolve a US zip code to a location with its IANA timezone. Returns null when
 * the zip code cannot be found. The bulky `zipcodes` and `tz-lookup` datasets
 * are loaded on demand so they stay out of the initial bundle.
 */
export async function lookupZip(zip: string): Promise<AppLocation | null> {
  const [zipcodes, tzlookupModule] = await Promise.all([
    import('zipcodes'),
    import('tz-lookup'),
  ]);
  const tzlookup = tzlookupModule.default;
  const data = zipcodes.lookup(zip.trim());
  if (!data || data.latitude == null || data.longitude == null) {
    return null;
  }
  const timeZone = tzlookup(data.latitude, data.longitude);
  return {
    city: data.state ? `${data.city}, ${data.state}` : data.city,
    timeZone,
    latitude: data.latitude,
    longitude: data.longitude,
    zip: data.zip ?? zip.trim(),
  };
}
