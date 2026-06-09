import { describe, it, expect } from 'vitest';
import { getKiddushLevanaMonths } from '../../src/lib/kiddushLevana';

/** Adar 5781 molad in a given zone (UTC instant 2021-02-12T03:58:16.837Z). */
function adarMolad(zone: string) {
  const month = getKiddushLevanaMonths(new Date('2021-02-12'), zone).find(
    (m) => m.jewishYear === 5781 && m.jewishMonth === 12,
  );
  if (!month) throw new Error('Adar 5781 not found');
  return month.molad;
}

function moladForDate(zone: string, dateISO: string, year: number, month: number) {
  const found = getKiddushLevanaMonths(new Date(dateISO), zone).find(
    (m) => m.jewishYear === year && m.jewishMonth === month,
  );
  if (!found) throw new Error('month not found');
  return found.molad;
}

describe('timezone & international date line handling', () => {
  it('is the same instant in every timezone (only the wall clock differs)', () => {
    const zones = [
      'Asia/Jerusalem',
      'America/New_York',
      'Pacific/Honolulu',
      'Pacific/Kiritimati', // UTC+14, the furthest-ahead civil time on earth
      'Etc/GMT+12', // UTC-12, the furthest-behind civil time on earth
    ];
    const instants = zones.map((z) => adarMolad(z).toMillis());
    expect(new Set(instants).size).toBe(1);
  });

  it('falls on the previous civil day for zones west of Jerusalem', () => {
    expect(adarMolad('Asia/Jerusalem').toFormat('ccc yyyy-LL-dd')).toBe(
      'Fri 2021-02-12',
    );
    expect(adarMolad('America/New_York').toFormat('ccc yyyy-LL-dd')).toBe(
      'Thu 2021-02-11',
    );
    expect(adarMolad('Pacific/Honolulu').toFormat('ccc yyyy-LL-dd')).toBe(
      'Thu 2021-02-11',
    );
  });

  it('straddles two civil dates across the international date line', () => {
    const farWest = adarMolad('Etc/GMT+12'); // 03:58 UTC -> 15:58 the day before
    const farEast = adarMolad('Pacific/Kiritimati'); // 03:58 UTC -> 17:58 same day
    expect(farWest.toFormat('yyyy-LL-dd')).toBe('2021-02-11');
    expect(farEast.toFormat('yyyy-LL-dd')).toBe('2021-02-12');
    // ...yet it is unambiguously one and the same moment.
    expect(farWest.toMillis()).toBe(farEast.toMillis());
    expect(farWest.offset).toBe(-720);
    expect(farEast.offset).toBe(840);
  });

  it('keeps a fixed offset year-round in zones without DST (Phoenix, Honolulu)', () => {
    expect(moladForDate('America/Phoenix', '2021-02-12', 5781, 12).offset).toBe(
      -420,
    );
    expect(moladForDate('America/Phoenix', '2021-05-11', 5781, 3).offset).toBe(
      -420,
    );
    expect(moladForDate('Pacific/Honolulu', '2021-02-12', 5781, 12).offset).toBe(
      -600,
    );
    expect(moladForDate('Pacific/Honolulu', '2021-05-11', 5781, 3).offset).toBe(
      -600,
    );
  });

  it('applies DST where it is observed (New York EST -> EDT)', () => {
    expect(
      moladForDate('America/New_York', '2021-02-12', 5781, 12).offset,
    ).toBe(-300); // EST
    expect(moladForDate('America/New_York', '2021-05-11', 5781, 3).offset).toBe(
      -240,
    ); // EDT
  });
});
