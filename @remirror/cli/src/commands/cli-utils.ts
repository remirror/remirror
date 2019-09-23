const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

// const units = ['ms', 's', 'm', 'h', 'd', 'w'] as const;
// type Unit = typeof units[number];

/**
 * Transforms a millisecond value to a human readable value.
 */
export const msToDuration = (duration: number, skipMs = false): string => {
  if (duration === 0 && skipMs) {
    return '';
  }

  if (duration < ONE_SECOND && !skipMs) {
    return `${duration}ms`.padStart(5, '0');
  }

  if (duration < ONE_MINUTE) {
    return `${Number(duration / ONE_SECOND).toFixed(skipMs ? 0 : 2)}s`;
  }

  if (duration < ONE_HOUR) {
    return `${Math.floor(duration / ONE_MINUTE)}m ${msToDuration(duration % ONE_MINUTE, true)}`.trim();
  }

  if (duration < ONE_DAY) {
    return `${Math.floor(duration / ONE_HOUR)}h ${msToDuration(duration % ONE_HOUR, true)}`.trim();
  }

  if (duration < ONE_WEEK) {
    return `${Math.floor(duration / ONE_DAY)}d ${msToDuration(duration % ONE_DAY, true)}`.trim();
  }

  return `${Math.floor(duration / ONE_WEEK)}w ${msToDuration(duration % ONE_WEEK, true)}`.trim();
};
