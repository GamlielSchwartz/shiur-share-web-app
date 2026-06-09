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

/**
 * The molad expressed in clock time plus the traditional chalakim remainder,
 * e.g. "Friday, Feb 12, 2021, 5:58 AM and 5 chalakim".
 */
export function formatMolad(dt: DateTime): string {
  let chalakim = Math.round(dt.second / SECONDS_PER_CHELEK);
  if (chalakim >= 18) chalakim = 0;
  const unit = chalakim === 1 ? 'chelek' : 'chalakim';
  return `${formatDateTime(dt)} and ${chalakim} ${unit}`;
}
