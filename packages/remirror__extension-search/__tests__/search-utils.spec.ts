import { rotateIndex } from '../src/search-utils';

test('rotateIndex', () => {
  expect(rotateIndex(0, 10)).toBe(0);
  expect(rotateIndex(1, 10)).toBe(1);
  expect(rotateIndex(9, 10)).toBe(9);
  expect(rotateIndex(10, 10)).toBe(0);
  expect(rotateIndex(11, 10)).toBe(1);
  expect(rotateIndex(42, 10)).toBe(2);

  expect(rotateIndex(-1, 10)).toBe(9);
  expect(rotateIndex(-9, 10)).toBe(1);
  expect(rotateIndex(-10, 10)).toBe(0);
  expect(rotateIndex(-11, 10)).toBe(9);
  expect(rotateIndex(-42, 10)).toBe(8);

  expect(rotateIndex(0, 0)).toBe(0);
  expect(rotateIndex(1, 0)).toBe(0);
  expect(rotateIndex(-1, 0)).toBe(0);
  expect(rotateIndex(42, 0)).toBe(0);
  expect(rotateIndex(-42, 0)).toBe(0);

  expect(rotateIndex(0, -10)).toBe(0);
  expect(rotateIndex(1, -10)).toBe(0);
  expect(rotateIndex(-1, -10)).toBe(0);
  expect(rotateIndex(42, -10)).toBe(0);
  expect(rotateIndex(-42, -10)).toBe(0);

  expect(rotateIndex(1, Number.NaN)).toBeNaN();
  expect(rotateIndex(Number.NaN, 1)).toBeNaN();
  expect(rotateIndex(Number.NaN, Number.NaN)).toBeNaN();
});
