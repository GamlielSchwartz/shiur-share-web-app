import { JewishCalendar, HebrewDateFormatter } from 'kosher-zmanim';
import { DateTime } from 'luxon';

/**
 * The two halachic opinions surfaced in this app. Each opinion has an earliest
 * time (tchilas zman) and a latest time (sof zman) for saying Kiddush Levana.
 */
export type OpinionKey = 'majority' | 'shulchanAruch';

export interface MonthZmanim {
  /** Stable id, e.g. "5781-3". */
  id: string;
  jewishYear: number;
  /** KosherJava month numbering: Nissan=1 ... Adar=12, Adar II=13. */
  jewishMonth: number;
  /** Transliterated month name (handles Adar I / Adar II). */
  monthName: string;
  /** The molad (lunar conjunction), the true instant in the target timezone. */
  molad: DateTime;
  /** Earliest, 3 days after the molad (majority of Acharonim). */
  earliest3Days: DateTime;
  /** Earliest, 7 days after the molad (Shulchan Aruch). */
  earliest7Days: DateTime;
  /** Latest, halfway between molad and molad (Maharil / Rema). */
  sofBetweenMoldos: DateTime;
  /** Latest, 15 days after the molad (Shulchan Aruch). */
  sof15Days: DateTime;
}

const formatter = new HebrewDateFormatter();

/** Standard 19-year Metonic cycle leap-year test. */
function isJewishLeapYear(year: number): boolean {
  return (7 * year + 1) % 19 < 7;
}

/**
 * Months of a Jewish year in chronological order. The Jewish year begins in
 * Tishrei (month 7 in the Nissan-based numbering) and wraps to Elul (month 6).
 * Adar II (13) only exists in a leap year.
 */
function orderedMonths(year: number): number[] {
  const winter = isJewishLeapYear(year)
    ? [7, 8, 9, 10, 11, 12, 13]
    : [7, 8, 9, 10, 11, 12];
  return [...winter, 1, 2, 3, 4, 5, 6];
}

function computeMonth(year: number, month: number, zone: string): MonthZmanim {
  const jc = new JewishCalendar();
  jc.setJewishDate(year, month, 15);
  return {
    id: `${year}-${month}`,
    jewishYear: year,
    jewishMonth: month,
    monthName: formatter.formatMonth(jc),
    molad: jc.getMoladAsDate().setZone(zone),
    earliest3Days: jc.getTchilasZmanKidushLevana3Days().setZone(zone),
    earliest7Days: jc.getTchilasZmanKidushLevana7Days().setZone(zone),
    sofBetweenMoldos: jc.getSofZmanKidushLevanaBetweenMoldos().setZone(zone),
    sof15Days: jc.getSofZmanKidushLevana15Days().setZone(zone),
  };
}

/**
 * Compute molad and Kiddush Levana times for the Jewish year containing the
 * reference date, plus the adjacent years so the calendar grid is fully covered
 * as the user navigates across Gregorian year boundaries.
 */
export function getKiddushLevanaMonths(
  referenceDate: Date,
  zone: string,
): MonthZmanim[] {
  const ref = new JewishCalendar(DateTime.fromJSDate(referenceDate));
  const baseYear = ref.getJewishYear();
  const months: MonthZmanim[] = [];
  for (const year of [baseYear - 1, baseYear, baseYear + 1]) {
    for (const month of orderedMonths(year)) {
      months.push(computeMonth(year, month, zone));
    }
  }
  return months;
}
