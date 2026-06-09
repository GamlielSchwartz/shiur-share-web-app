import { describe, it, expect } from 'vitest';
import { lookupZip, DEFAULT_LOCATION } from '../../src/lib/location';

describe('DEFAULT_LOCATION', () => {
  it('is Yerushalayim at Har Habayis coordinates', () => {
    expect(DEFAULT_LOCATION.city).toBe('Jerusalem');
    expect(DEFAULT_LOCATION.timeZone).toBe('Asia/Jerusalem');
    expect(DEFAULT_LOCATION.latitude).toBeCloseTo(31.778, 2);
    expect(DEFAULT_LOCATION.longitude).toBeCloseTo(35.2354, 3);
  });
});

describe('lookupZip — zip codes across every US timezone', () => {
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
    const loc = await lookupZip(zip);
    expect(loc).not.toBeNull();
    expect(loc!.timeZone).toBe(timeZone);
    expect(loc!.city).toBe(city);
    expect(loc!.zip).toBe(zip);
    expect(typeof loc!.latitude).toBe('number');
    expect(typeof loc!.longitude).toBe('number');
  });

  it('returns null for unknown or malformed zip codes', async () => {
    expect(await lookupZip('00000')).toBeNull();
    expect(await lookupZip('abcde')).toBeNull();
    expect(await lookupZip('')).toBeNull();
    expect(await lookupZip('123')).toBeNull();
  });

  it('trims surrounding whitespace before looking up', async () => {
    const loc = await lookupZip('  10001  ');
    expect(loc?.city).toBe('New York, NY');
    expect(loc?.zip).toBe('10001');
  });

  it('spans the full continental + outlying offset range', async () => {
    const zips = ['10001', '60601', '80201', '90001', '99501', '96801'];
    const zones = new Set<string>();
    for (const zip of zips) {
      const loc = await lookupZip(zip);
      zones.add(loc!.timeZone);
    }
    expect(zones.size).toBe(zips.length);
  });
});
