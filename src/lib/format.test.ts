import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { formatDateTime, formatShort, formatMolad } from './format';

const base = DateTime.fromObject(
  { year: 2021, month: 2, day: 12, hour: 5, minute: 58, second: 16 },
  { zone: 'Asia/Jerusalem' },
);

describe('format helpers', () => {
  it('formatDateTime gives a full, friendly date and time', () => {
    expect(formatDateTime(base)).toBe('Friday, Feb 12, 2021, 5:58 AM');
  });

  it('formatShort omits the weekday', () => {
    expect(formatShort(base)).toBe('Feb 12, 2021, 5:58 AM');
  });

  it('formatMolad appends chalakim derived from the seconds', () => {
    // 16s ÷ 3.333 ≈ 4.8 -> 5 chalakim
    expect(formatMolad(base)).toBe(
      'Friday, Feb 12, 2021, 5:58 AM and 5 chalakim',
    );
  });

  it('uses the singular "chelek" for exactly one', () => {
    // 3s ÷ 3.333 ≈ 0.9 -> 1 chelek
    expect(formatMolad(base.set({ second: 3 }))).toContain('and 1 chelek');
  });

  it('wraps a rounded 18 chalakim back to 0 (18 chalakim = 1 minute)', () => {
    // 59s ÷ 3.333 ≈ 17.7 -> 18 -> 0
    expect(formatMolad(base.set({ second: 59 }))).toContain('and 0 chalakim');
  });

  it('handles afternoon/PM times', () => {
    expect(formatDateTime(base.set({ hour: 21, minute: 10 }))).toBe(
      'Friday, Feb 12, 2021, 9:10 PM',
    );
  });
});
