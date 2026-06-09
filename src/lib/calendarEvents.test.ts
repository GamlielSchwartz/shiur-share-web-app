import { describe, it, expect } from 'vitest';
import { getKiddushLevanaMonths } from './kiddushLevana';
import { buildEvents } from './calendarEvents';

const months = getKiddushLevanaMonths(new Date('2021-02-12'), 'Asia/Jerusalem');
const events = buildEvents(months);

describe('buildEvents', () => {
  it('creates exactly two opinion bars per month', () => {
    expect(events).toHaveLength(months.length * 2);
  });

  it('every event uses JS Dates with start strictly before end', () => {
    for (const event of events) {
      expect(event.start).toBeInstanceOf(Date);
      expect(event.end).toBeInstanceOf(Date);
      expect(event.start.getTime()).toBeLessThan(event.end.getTime());
    }
  });

  it('maps majority to the 3-day window and Shulchan Aruch to the 7-day window', () => {
    const adar = months.find(
      (m) => m.jewishYear === 5781 && m.jewishMonth === 12,
    )!;
    const adarEvents = events.filter((e) => e.month.id === adar.id);
    const majority = adarEvents.find((e) => e.opinion.key === 'majority')!;
    const shulchanAruch = adarEvents.find(
      (e) => e.opinion.key === 'shulchanAruch',
    )!;

    expect(majority.start.getTime()).toBe(adar.earliest3Days.toMillis());
    expect(majority.end.getTime()).toBe(adar.sofBetweenMoldos.toMillis());
    expect(shulchanAruch.start.getTime()).toBe(adar.earliest7Days.toMillis());
    expect(shulchanAruch.end.getTime()).toBe(adar.sof15Days.toMillis());
  });

  it('gives every event a unique id', () => {
    const ids = events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
