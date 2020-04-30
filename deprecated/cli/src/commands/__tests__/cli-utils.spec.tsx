import { msToDuration } from '../cli-utils';

test('humanReadableDuration', () => {
  expect(msToDuration(512)).toBe('512ms');
  expect(msToDuration(1512)).toBe('1.51s');
  expect(msToDuration(60500)).toBe('1m 1s');
  expect(msToDuration(3600000)).toBe('1h');
  expect(msToDuration(8000000)).toBe('2h 13m 20s');
  expect(msToDuration(96000000)).toBe('1d 2h 40m');
  expect(msToDuration(960000000)).toBe('1w 4d 2h 40m');
});
