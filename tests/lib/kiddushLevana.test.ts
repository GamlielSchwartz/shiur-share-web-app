import { describe, it, expect } from 'vitest';
import { getKiddushLevanaMonths, type MonthZmanim } from '../../src/lib/kiddushLevana';

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

describe('announced molad (Jerusalem mean time) matches Chabad/luchos', () => {
  // The announced molad is Jerusalem mean solar time + chalakim, exactly as
  // Chabad.org publishes it. Format it the way the table reads for comparison.
  const announced = (m: MonthZmanim) =>
    `${m.moladAnnounced.toFormat('ccc LLL d yyyy h:mm a')} + ${m.moladChalakim}`;

  it('Adar 5781 = Fri Feb 12 2021 6:19 AM + 4 chalakim (the cited bug case)', () => {
    const adar = find(monthsFor('2021-02-12'), 5781, 12);
    expect(announced(adar)).toBe('Fri Feb 12 2021 6:19 AM + 4');
  });

  // Spot-checks against Chabad.org's published molad table for 5786 (2025-26),
  // including evening molados where the announced day is the civil weekday.
  it.each([
    ['2025-09-22', 5786, 7, 'Mon Sep 22 2025 12:10 PM + 7'], // Tishrei
    ['2026-02-17', 5786, 12, 'Tue Feb 17 2026 3:50 AM + 12'], // Adar
    ['2026-05-16', 5786, 3, 'Sat May 16 2026 6:02 PM + 15'], // Sivan (evening)
    ['2026-07-14', 5786, 5, 'Tue Jul 14 2026 7:30 PM + 17'], // Av (evening)
  ])('molad of %s matches Chabad', (date, year, month, expected) => {
    const m = find(monthsFor(date as string), year as number, month as number);
    expect(announced(m)).toBe(expected);
  });

  it('the announced molad is the same instant regardless of the user timezone', () => {
    const jlem = find(monthsFor('2021-02-12', 'Asia/Jerusalem'), 5781, 12);
    const ny = find(monthsFor('2021-02-12', 'America/New_York'), 5781, 12);
    expect(ny.moladAnnounced.toMillis()).toBe(jlem.moladAnnounced.toMillis());
    expect(ny.moladAnnounced.toFormat('ccc h:mm a')).toBe('Fri 6:19 AM');
  });

  it('the announced (mean) time leads the actual instant by the LMT correction', () => {
    const adar = find(monthsFor('2021-02-12', 'Asia/Jerusalem'), 5781, 12);
    // Announced 6:19 AM (mean) vs actual 5:58:16 AM (Israel Standard) ≈ 21 min.
    const diffMin =
      (adar.moladAnnounced.toMillis() - adar.molad.toMillis()) / 60000;
    expect(Math.round(diffMin)).toBe(21);
  });

  it('exposes the exact molad chalakim, independent of clock seconds', () => {
    const adar = find(monthsFor('2021-02-12'), 5781, 12);
    // Clock time is 05:58:16 (16s ≈ 5 chalakim), but the true molad is 4 chalakim.
    expect(adar.moladChalakim).toBe(4);
    expect(adar.molad.second).toBe(16);
  });

  it('keeps the announced molad and chalakim within valid ranges every month', () => {
    for (const m of monthsFor('2024-03-01')) {
      expect(m.moladAnnounced.isValid).toBe(true);
      expect(m.moladChalakim).toBeGreaterThanOrEqual(0);
      expect(m.moladChalakim).toBeLessThanOrEqual(17);
    }
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
