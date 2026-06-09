import type { MonthZmanim } from './kiddushLevana';
import { OPINION_LIST, type OpinionInfo } from './opinions';

export interface KlEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  month: MonthZmanim;
  opinion: OpinionInfo;
}

/**
 * Turn the computed monthly zmanim into ranged calendar events, one bar per
 * opinion: earliest time (tchilas zman) to latest time (sof zman).
 */
export function buildEvents(months: MonthZmanim[]): KlEvent[] {
  const events: KlEvent[] = [];
  for (const month of months) {
    for (const opinion of OPINION_LIST) {
      events.push({
        id: `${month.id}-${opinion.key}`,
        title: opinion.title,
        start: opinion.earliest(month).toJSDate(),
        end: opinion.latest(month).toJSDate(),
        month,
        opinion,
      });
    }
  }
  return events;
}
