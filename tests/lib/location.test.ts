import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  lookupZip,
  detectLocation,
  cityFromTimeZone,
  DEFAULT_LOCATION,
} from '../../src/lib/location';

interface Place {
  placeName: string;
  stateAbbr: string;
  lat: number;
  long: number;
}

/**
 * Real (approximate) coordinates for representative zips. The timezone in the
 * assertions is derived from these by the real `tz-lookup`; only the network
 * call to zippopotam.us is mocked.
 */
const PLACES: Record<string, Place> = {
  '10001': { placeName: 'New York', stateAbbr: 'NY', lat: 40.7506, long: -73.9971 },
  '08701': { placeName: 'Lakewood', stateAbbr: 'NJ', lat: 40.0763, long: -74.2099 },
  '33101': { placeName: 'Miami', stateAbbr: 'FL', lat: 25.7796, long: -80.1947 },
  '60601': { placeName: 'Chicago', stateAbbr: 'IL', lat: 41.8855, long: -87.6217 },
  '80201': { placeName: 'Denver', stateAbbr: 'CO', lat: 39.7541, long: -104.9966 },
  '85001': { placeName: 'Phoenix', stateAbbr: 'AZ', lat: 33.4484, long: -112.074 },
  '90001': { placeName: 'Los Angeles', stateAbbr: 'CA', lat: 33.9731, long: -118.2479 },
  '99501': { placeName: 'Anchorage', stateAbbr: 'AK', lat: 61.2167, long: -149.8949 },
  '96801': { placeName: 'Honolulu', stateAbbr: 'HI', lat: 21.3069, long: -157.8583 },
  '00901': { placeName: 'San Juan', stateAbbr: 'PR', lat: 18.4655, long: -66.1057 },
};

function stubZippopotam(places: Record<string, Place>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const zip = String(url).split('/').pop() ?? '';
      const place = places[zip];
      if (!place) {
        return { ok: false, status: 404 } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          'post code': zip,
          places: [
            {
              'place name': place.placeName,
              'state abbreviation': place.stateAbbr,
              latitude: String(place.lat),
              longitude: String(place.long),
            },
          ],
        }),
      } as unknown as Response;
    }),
  );
}

describe('DEFAULT_LOCATION', () => {
  it('is Yerushalayim at Har Habayis coordinates', () => {
    expect(DEFAULT_LOCATION.city).toBe('Jerusalem');
    expect(DEFAULT_LOCATION.timeZone).toBe('Asia/Jerusalem');
    expect(DEFAULT_LOCATION.latitude).toBeCloseTo(31.778, 2);
    expect(DEFAULT_LOCATION.longitude).toBeCloseTo(35.2354, 3);
  });
});

describe('lookupZip — zip codes across every US timezone', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['10001', 'America/New_York', 'New York, NY'],
    ['08701', 'America/New_York', 'Lakewood, NJ'],
    ['33101', 'America/New_York', 'Miami, FL'],
    ['60601', 'America/Chicago', 'Chicago, IL'],
    ['80201', 'America/Denver', 'Denver, CO'],
    ['85001', 'America/Phoenix', 'Phoenix, AZ'],
    ['90001', 'America/Los_Angeles', 'Los Angeles, CA'],
    ['99501', 'America/Anchorage', 'Anchorage, AK'],
    ['96801', 'Pacific/Honolulu', 'Honolulu, HI'],
    ['00901', 'America/Puerto_Rico', 'San Juan, PR'],
  ])('resolves %s -> %s (%s)', async (zip, timeZone, city) => {
    stubZippopotam(PLACES);
    const loc = await lookupZip(zip);
    expect(loc).not.toBeNull();
    expect(loc!.timeZone).toBe(timeZone);
    expect(loc!.city).toBe(city);
    expect(loc!.zip).toBe(zip);
    expect(typeof loc!.latitude).toBe('number');
    expect(typeof loc!.longitude).toBe('number');
  });

  it('returns null for an unknown zip (API 404)', async () => {
    stubZippopotam(PLACES);
    expect(await lookupZip('00000')).toBeNull();
  });

  it('rejects malformed zips without ever calling the API', async () => {
    stubZippopotam(PLACES);
    expect(await lookupZip('abcde')).toBeNull();
    expect(await lookupZip('')).toBeNull();
    expect(await lookupZip('123')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns null when the network request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    expect(await lookupZip('10001')).toBeNull();
  });

  it('trims surrounding whitespace before looking up', async () => {
    stubZippopotam(PLACES);
    const loc = await lookupZip('  10001  ');
    expect(loc?.city).toBe('New York, NY');
    expect(loc?.zip).toBe('10001');
  });

  it('spans the full continental + outlying offset range', async () => {
    stubZippopotam(PLACES);
    const zips = ['10001', '60601', '80201', '90001', '99501', '96801'];
    const zones = new Set<string>();
    for (const zip of zips) {
      const loc = await lookupZip(zip);
      zones.add(loc!.timeZone);
    }
    expect(zones.size).toBe(zips.length);
  });
});

describe('cityFromTimeZone', () => {
  it('turns an IANA zone into a readable place name', () => {
    expect(cityFromTimeZone('America/Los_Angeles')).toBe('Los Angeles');
    expect(cityFromTimeZone('America/New_York')).toBe('New York');
    expect(cityFromTimeZone('Asia/Jerusalem')).toBe('Jerusalem');
  });

  it('uses the most specific segment for nested zones', () => {
    expect(cityFromTimeZone('America/Argentina/Buenos_Aires')).toBe(
      'Buenos Aires',
    );
  });
});

describe('detectLocation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubGeolocation(impl: Geolocation['getCurrentPosition']) {
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: impl } });
  }

  it('resolves GPS coordinates to a timezone and derived city', async () => {
    // Los Angeles coordinates.
    stubGeolocation((success) =>
      success({
        coords: { latitude: 34.05, longitude: -118.24 },
      } as GeolocationPosition),
    );
    const loc = await detectLocation();
    expect(loc.timeZone).toBe('America/Los_Angeles');
    expect(loc.city).toBe('Los Angeles');
    expect(loc.latitude).toBeCloseTo(34.05, 2);
  });

  it('rejects with a friendly message when permission is denied', async () => {
    stubGeolocation((_success, error) =>
      error?.({ code: 1, message: 'denied' } as GeolocationPositionError),
    );
    await expect(detectLocation()).rejects.toThrow(/allow location access/i);
  });

  it('rejects when geolocation is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    await expect(detectLocation()).rejects.toThrow(/not available/i);
  });
});
