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
  return duration === 0 && skipMs
    ? ''
    : duration < ONE_SECOND && !skipMs
    ? `${duration}ms`.padStart(5, '0')
    : duration < ONE_MINUTE
    ? `${Number(duration / ONE_SECOND).toFixed(skipMs ? 0 : 2)}s`
    : duration < ONE_HOUR
    ? `${Math.floor(duration / ONE_MINUTE)}m ${msToDuration(duration % ONE_MINUTE, true)}`.trim()
    : duration < ONE_DAY
    ? `${Math.floor(duration / ONE_HOUR)}h ${msToDuration(duration % ONE_HOUR, true)}`.trim()
    : duration < ONE_WEEK
    ? `${Math.floor(duration / ONE_DAY)}d ${msToDuration(duration % ONE_DAY, true)}`.trim()
    : `${Math.floor(duration / ONE_WEEK)}w ${msToDuration(duration % ONE_WEEK, true)}`.trim();
};
