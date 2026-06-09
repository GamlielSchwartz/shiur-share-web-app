import type { DateTime } from 'luxon';
import type { MonthZmanim, OpinionKey } from './kiddushLevana';
import {
  ROV_ACHARONIM_WHEN_CAN_START_KL,
  SH_AR_WHEN_CAN_START_KL,
} from '../assets/halachicBlurbs';

export interface OpinionInfo {
  key: OpinionKey;
  title: string;
  /** Short subtitle describing how the window is derived. */
  subtitle: string;
  /** Text color for the calendar bar. */
  color: string;
  /** Background color for the calendar bar. */
  bgColor: string;
  /** Explanatory halachic source text. */
  blurb: string;
  earliest: (month: MonthZmanim) => DateTime;
  latest: (month: MonthZmanim) => DateTime;
}

export const OPINIONS: Record<OpinionKey, OpinionInfo> = {
  majority: {
    key: 'majority',
    title: 'Majority',
    subtitle: '3 days after the molad until halfway between the moldos',
    color: '#0b3d2e',
    bgColor: '#55D6BE',
    blurb: ROV_ACHARONIM_WHEN_CAN_START_KL,
    earliest: (month) => month.earliest3Days,
    latest: (month) => month.sofBetweenMoldos,
  },
  shulchanAruch: {
    key: 'shulchanAruch',
    title: 'Shulchan Aruch',
    subtitle: '7 days after the molad until 15 days after the molad',
    color: '#ffffff',
    bgColor: '#152A80',
    blurb: SH_AR_WHEN_CAN_START_KL,
    earliest: (month) => month.earliest7Days,
    latest: (month) => month.sof15Days,
  },
};

export const OPINION_LIST: OpinionInfo[] = [
  OPINIONS.majority,
  OPINIONS.shulchanAruch,
];
