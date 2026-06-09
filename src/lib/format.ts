import type { DateTime } from 'luxon';

/** 1 chelek = 3⅓ seconds, so there are 18 chalakim in a minute. */
const SECONDS_PER_CHELEK = 10 / 3;

/** Friendly date + time, e.g. "Friday, Feb 12, 2021, 5:58 AM". */
export function formatDateTime(dt: DateTime): string {
  return dt.toFormat('cccc, LLL d, yyyy, h:mm a');
}

/** Short date + time, e.g. "Feb 12, 2021, 5:58 AM". */
export function formatShort(dt: DateTime): string {
  return dt.toFormat('LLL d, yyyy, h:mm a');
}

/** Pluralize a chalakim count, e.g. "1 chelek" / "4 chalakim". */
function chalakimLabel(chalakim: number): string {
  return `${chalakim} ${chalakim === 1 ? 'chelek' : 'chalakim'}`;
}

/**
 * The molad expressed in clock time plus its chalakim remainder, e.g.
 * "Friday, Feb 12, 2021, 5:58 AM and 4 chalakim". Pass the exact molad chalakim
 * (from {@link MoladTraditional}); if omitted it is approximated from the clock
 * seconds, which can be off by a chelek due to the Local Mean Time conversion.
 */
export function formatMolad(dt: DateTime, chalakim?: number): string {
  let parts = chalakim;
  if (parts == null) {
    parts = Math.round(dt.second / SECONDS_PER_CHELEK);
    if (parts >= 18) parts = 0;
  }
  return `${formatDateTime(dt)} and ${chalakimLabel(parts)}`;
}
