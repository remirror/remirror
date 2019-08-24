import { pick } from '@remirror/core-helpers';
import { HSL, HSLObject, NamedHSLObject, ValidHSLObject, ValidHSLTuple } from '../ui-hsl';

const validInputString: Array<[string, ValidHSLObject, ValidHSLTuple, string]> = [
  [
    'hsla(111, 12.343%, 0.9%, .1)',
    { h: 111, s: 12.343, l: 0.9, a: 10 },
    [111, 12.343, 0.9, 10],
    'hsla(111, 12.343%, 0.9%, 10%)',
  ],
  [
    'hsla(123, 45%, 67%, 1)',
    { h: 123, s: 45, l: 67, a: 100 },
    [123, 45, 67, 100],
    'hsla(123, 45%, 67%, 100%)',
  ],
  [
    'hsla(1, 1.111%, 1.1111%, .4)',
    { h: 1, s: 1.111, l: 1.1111, a: 40 },
    [1, 1.111, 1.1111, 40],
    'hsla(1, 1.111%, 1.1111%, 40%)',
  ],
  [
    'hsl(180, 50.000%, 50%)',
    { h: 180, s: 50, l: 50, a: undefined },
    [180, 50, 50, undefined],
    'hsl(180, 50%, 50%)',
  ],
];

const validInputObject: Array<[HSLObject | NamedHSLObject, string]> = [
  [{ h: 111, s: '12.343%', l: 0.9, a: '0.1' }, 'hsla(111, 12.343%, 0.9%, 10%)'],
  [{ h: '180', s: 50, l: '50' }, 'hsl(180, 50%, 50%)'],
  [{ hue: '200', saturation: 50, lightness: 50, alpha: 80 }, 'hsla(200, 50%, 50%, 80%)'],
];

describe('valid `HSL.create`', () => {
  it.each(validInputString)('validates input string toJSON #%#', (input, expected) => {
    expect(HSL.create(input).toJSON()).toEqual(expected);
  });

  it.each(validInputString)('validates input string toArray #%#', (input, _, expected) => {
    expect(HSL.create(input).toArray()).toEqual(expected);
  });

  it.each(validInputString)('validates input string toString #%#', (input, _obj, _arr, expected) => {
    expect(HSL.create(input).toString()).toEqual(expected);
  });

  it.each(validInputObject)('validates input object toString #%#', (input, expected) => {
    expect(HSL.create(input).toString()).toEqual(expected);
  });

  it('supports a seperate instance of HSL', () => {
    const hsl = HSL.create('hsl(0, 0%, 0%)');
    expect(HSL.create(hsl)).toBeInstanceOf(HSL);
  });
});

const invalidInputString = [
  ['hsl(111, 12.343%, 0.9%, 0.1)'],
  ['hsl(111, 12.343%, 0.9)'],
  ['hsla(111, 12.343, 0.9%, 0.1)'],
  ['hsla(, 12.343%, 0.9%, 0.1)'],
];

const invalidInputObject: Array<[any]> = [
  [{ hue: 111, s: '12.343%', l: 0.9, a: '0.1' }], // mixing named and shorthand
  [{ hue: '200', saturation: 50, lightness: 50, alpha: '80' }], // invalid alpha (if string it should specify the % sign)
];

describe('invalid `HSL.create`', () => {
  it.each(invalidInputString)('invalid input string should throw #%#', input => {
    expect(() => HSL.create(input)).toThrowErrorMatchingSnapshot();
  });

  it.each(invalidInputObject)('invalid input object should throw #%#', input => {
    expect(() => HSL.create(input)).toThrowErrorMatchingSnapshot();
  });
});

describe('methods', () => {
  let hsl: HSL;

  beforeEach(() => {
    hsl = HSL.create('hsla(180, 50%, 50%, 0.5)');
  });

  test('#clone', () => {
    const cloned = hsl.clone();
    expect(cloned).not.toBe(hsl);
    expect(pick(hsl, ['h', 's', 'l', 'a'])).toEqual(pick(cloned, ['h', 's', 'l', 'a']));
  });

  test('#rotate', () => {
    expect(hsl.rotate(20).h).toBe(200);
    expect(hsl.rotate(-100).h).toBe(80);
    expect(hsl.rotate(180).h).toBe(0);
  });

  test('#lighten', () => {
    expect(hsl.lighten(60).l).toBe(100);
    expect(hsl.lighten(25).l).toBe(75);
  });

  test('#darken', () => {
    expect(hsl.darken(60).l).toBe(0);
    expect(hsl.darken(25).l).toBe(25);
  });

  test('#saturate', () => {
    expect(hsl.saturate(60).s).toBe(100);
    expect(hsl.saturate(25).s).toBe(75);
  });

  test('#desaturate', () => {
    expect(hsl.desaturate(60).s).toBe(0);
    expect(hsl.desaturate(25).s).toBe(25);
  });

  test('#unfade', () => {
    expect(hsl.unfade(60).a).toBe(100);
    expect(hsl.unfade(25).a).toBe(75);
  });

  test('#fade', () => {
    expect(hsl.fade(60).a).toBe(0);
    expect(hsl.fade(25).a).toBe(25);
  });
});
