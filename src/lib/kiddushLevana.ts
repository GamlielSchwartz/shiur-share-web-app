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
  /**
   * The molad as announced in shul and printed in luchos: Jerusalem *mean*
   * solar time, with no timezone or daylight-saving adjustment. This matches
   * Chabad's published molad tables to the minute and chelek. It is pinned to a
   * fixed +02:00 offset so the announced wall-clock reading is preserved no
   * matter where it is rendered.
   */
  moladAnnounced: DateTime;
  /** The exact chalakim of the molad (not derived from rounded clock seconds). */
  moladChalakim: number;
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

  // The molad as announced in shul / printed in luchos. KosherJava's getMolad()
  // reports the announcement decomposition (Gregorian date, clock time, and
  // chalakim) in Jerusalem mean solar time — this matches Chabad's published
  // tables exactly. We pin it to a fixed +02:00 offset so the announced
  // wall-clock reading is preserved wherever it is rendered.
  const moladObj = jc.getMolad();
  const moladChalakim = moladObj.getMoladChalakim();
  const moladAnnounced = DateTime.fromObject(
    {
      year: moladObj.getGregorianYear(),
      month: moladObj.getGregorianMonth() + 1,
      day: moladObj.getGregorianDayOfMonth(),
      hour: moladObj.getMoladHours(),
      minute: moladObj.getMoladMinutes(),
    },
    { zone: 'UTC+2' },
  );

  // The true astronomical instant, after the Local Mean Time correction (~21
  // min, or ~39 min under DST). This is what the Kiddush Levana window is
  // measured from, shown in the user's local clock time.
  const moladInstant = jc.getMoladAsDate();
  return {
    id: `${year}-${month}`,
    jewishYear: year,
    jewishMonth: month,
    monthName: formatter.formatMonth(jc),
    molad: moladInstant.setZone(zone),
    moladAnnounced,
    moladChalakim,
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
