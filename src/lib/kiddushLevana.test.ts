import { describe, it, expect } from 'vitest';
import { getKiddushLevanaMonths, type MonthZmanim } from './kiddushLevana';

const JLEM = 'Asia/Jerusalem';
const HOUR_MS = 3_600_000;

function monthsFor(dateISO: string, zone = JLEM): MonthZmanim[] {
  return getKiddushLevanaMonths(new Date(dateISO), zone);
}

function find(months: MonthZmanim[], year: number, month: number): MonthZmanim {
  const found = months.find(
    (m) => m.jewishYear === year && m.jewishMonth === month,
  );
  if (!found) throw new Error(`month ${year}-${month} not found`);
  return found;
}

describe('molad accuracy (KosherJava reference cases)', () => {
  // These are the exact cases the KosherJava author cited as broken in the old
  // hand-rolled calculation (off by 20.94 min, or 39.06 min under DST).
  it('Adar 5781 molad matches the corrected Jerusalem standard time', () => {
    const adar = find(monthsFor('2021-02-12'), 5781, 12);
    expect(adar.molad.zoneName).toBe(JLEM);
    expect(adar.molad.toFormat('ccc yyyy-LL-dd HH:mm:ss')).toBe(
      'Fri 2021-02-12 05:58:16',
    );
    expect(adar.molad.toUTC().toISO()).toBe('2021-02-12T03:58:16.837Z');
    expect(adar.molad.toMillis()).toBe(1613102296837);
  });

  it('Sivan 5781 molad matches the corrected time under DST (IDT, UTC+3)', () => {
    const sivan = find(monthsFor('2021-05-11'), 5781, 3);
    expect(sivan.molad.toFormat('ccc yyyy-LL-dd HH:mm:ss')).toBe(
      'Tue 2021-05-11 21:10:26',
    );
    expect(sivan.molad.offset).toBe(180);
  });
});

describe('Kiddush Levana boundaries', () => {
  it('earliest/latest are exact offsets from the molad', () => {
    const adar = find(monthsFor('2021-02-12'), 5781, 12);
    const molad = adar.molad.toMillis();
    expect(adar.earliest3Days.toMillis() - molad).toBe(72 * HOUR_MS);
    expect(adar.earliest7Days.toMillis() - molad).toBe(168 * HOUR_MS);
    expect(adar.sof15Days.toMillis() - molad).toBe(360 * HOUR_MS);
    // half of 29d 12h 793 chalakim = 14d 18h 22m 1s 666ms
    expect(adar.sofBetweenMoldos.toMillis() - molad).toBe(
      ((14 * 24 + 18) * 3600 + 22 * 60 + 1) * 1000 + 666,
    );
  });

  it('the majority window opens earlier and closes earlier than Shulchan Aruch', () => {
    const adar = find(monthsFor('2021-02-12'), 5781, 12);
    expect(adar.earliest3Days.toMillis()).toBeLessThan(
      adar.earliest7Days.toMillis(),
    );
    expect(adar.sofBetweenMoldos.toMillis()).toBeLessThan(
      adar.sof15Days.toMillis(),
    );
  });
});

describe('Jewish calendar structure', () => {
  it('a non-leap year has 12 months ending in Adar (no Adar I/II)', () => {
    const months = monthsFor('2021-02-12').filter((m) => m.jewishYear === 5781);
    expect(months).toHaveLength(12);
    const names = months.map((m) => m.monthName);
    expect(names).toContain('Adar');
    expect(names).not.toContain('Adar I');
    expect(names).not.toContain('Adar II');
  });

  it('a leap year has 13 months including Adar I and Adar II', () => {
    const months = monthsFor('2024-03-01').filter((m) => m.jewishYear === 5784);
    expect(months).toHaveLength(13);
    const names = months.map((m) => m.monthName);
    expect(names).toContain('Adar I');
    expect(names).toContain('Adar II');
  });

  it('molad instants are strictly increasing in chronological order', () => {
    const months = monthsFor('2024-03-01');
    for (let i = 1; i < months.length; i++) {
      expect(months[i].molad.toMillis()).toBeGreaterThan(
        months[i - 1].molad.toMillis(),
      );
    }
  });

  it('covers the reference Jewish year plus its neighbors', () => {
    const years = [...new Set(monthsFor('2021-02-12').map((m) => m.jewishYear))];
    expect(years.sort()).toEqual([5780, 5781, 5782]);
  });

  it('rolls over to the next Jewish year for an autumn date', () => {
    // Tishrei 5783 begins late Sep 2022.
    const years = [...new Set(monthsFor('2022-10-15').map((m) => m.jewishYear))];
    expect(years).toContain(5783);
  });
});
