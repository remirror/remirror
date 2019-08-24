import {
  bool,
  clamp,
  isArray,
  isNumber,
  isObject,
  isPlainObject,
  isString,
  isUndefined,
} from '@remirror/core-helpers';
import { Brand } from '@remirror/core-types';

interface HueBrand {
  readonly Hue: unique symbol;
}
interface PercentBrand {
  readonly Percent: unique symbol;
}

type Hue = Brand<number, HueBrand>;
type Percent = Brand<number, PercentBrand>;
type Alpha = Percent | undefined;

interface BrandedHSLObject {
  h: Hue;
  s: Percent;
  l: Percent;
  a: Alpha;
}

export interface ValidHSLObject {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export type ValidHSLTuple = [number, number, number, number?];

export interface NamedHSLObject {
  hue: number | string;
  saturation: number | string;
  lightness: number | string;
  alpha?: number | string;
}
export interface HSLObject {
  h: number | string;
  s: number | string;
  l: number | string;
  a?: number | string;
}

export type HSLTuple = [number | string, number | string, number | string, (number | string)?];

export type HSLCreateParams = HSL | HSLObject | NamedHSLObject | HSLTuple | string;

// Taken from https://github.com/regexhq/hsla-regex/blob/master/test/test.js#L7
const HSLA_REGEX = /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/;

// Taken from https://github.com/regexhq/hsl-regex/blob/3ea5cede63c1e4a30878e7329a197c502337b7b3/index.js#L7
const HSL_REGEX = /^hsl\(\s*(\d+)\s*,\s*(\d*(?:\.\d+)?%)\s*,\s*(\d*(?:\.\d+)?%)\)$/;

const HSL_SYMBOL = Symbol.for('hslColor');

export const isHSL = (value: unknown): value is HSL =>
  isObject(value) && value.constructor && (value.constructor as any).$$id === HSL_SYMBOL;

const isNamedHSLObject = (value: unknown): value is NamedHSLObject =>
  bool(isPlainObject(value) && value.hue && value.saturation && value.lightness);

const isHSLObject = (value: unknown): value is HSLObject =>
  bool(isPlainObject(value) && value.h && value.s && value.l);

const hslStringToObject = (value: string): HSLObject => {
  const regexValue = HSLA_REGEX.exec(value) || HSL_REGEX.exec(value);

  if (!regexValue) {
    throw new Error(`Invalid HSL input string used: '${value}'`);
  }

  const [, ...array] = regexValue;

  return hslArrayToObject(array);
};

const hslArrayToObject = (value: any[]): HSLObject => {
  const [h, s, l, a] = value;
  return { h, s, l, a };
};

const convertHSLToObject = (value: HSLObject | NamedHSLObject | HSLTuple | string): HSLObject => {
  if (isHSLObject(value)) {
    return value;
  }

  if (isNamedHSLObject(value)) {
    const { hue: h, saturation: s, lightness: l, alpha: a } = value;
    return { h, s, l, a };
  }

  if (isArray(value)) {
    return hslArrayToObject(value);
  }

  if (isString(value)) {
    return hslStringToObject(value);
  }

  throw new Error(`Invalid HSL input value passed: ${isPlainObject(value) ? JSON.stringify(value) : value}`);
};

const isValidHue = (hue: unknown): hue is Hue => isNumber(hue) && hue <= 360 && hue >= 0;
const createValidHue = (value: number | string) => {
  const hue = isString(value) ? Number(value) % 360 : value % 360;

  if (!isValidHue(hue)) {
    throw new Error(`Invalid 'hue': ${value}`);
  }

  return hue;
};

const isValidPercent = (percent: unknown): percent is Percent =>
  isNumber(percent) && percent <= 100 && percent >= 0;

const createValidPercent = (value: number | string) => {
  const percent = isString(value) ? Number(value.replace(/[%\s]+/g, '')) : value;

  if (!isValidPercent(percent)) {
    throw new Error(`Invalid 'percentage': ${value}`);
  }

  return percent;
};

const clampPercent = (value: number) => clamp({ min: 0, max: 100, value });

const createValidAlpha = (value: number | string | undefined): Alpha => {
  const alpha = isString(value)
    ? value.includes('%')
      ? Number(value.replace(/[%\s]+/g, ''))
      : Number(value) * 100
    : value;

  if (isUndefined(alpha)) {
    return alpha;
  }

  return createValidPercent(alpha);
};

/**
 * Create a valid hsl object with numbers as value. Throws an error if
 */
const createValidHSLObject = ({
  h: hue,
  s: saturation,
  l: lightness,
  a: alpha,
}: HSLObject): BrandedHSLObject => ({
  h: createValidHue(hue),
  s: createValidPercent(saturation),
  l: createValidPercent(lightness),
  a: createValidAlpha(alpha),
});

/**
 * HSLColor is a small utility for transforming colors, but only hsl colors.
 */
export class HSL {
  public static $$id = HSL_SYMBOL;

  /**
   * Create a hsl class from the passed in string / array / object parameters.
   *
   * Throws a descriptive error if invalid parameters are passed in.
   */
  public static create(value: HSLCreateParams): HSL {
    if (isHSL(value)) {
      return value.clone();
    }

    const hsl = createValidHSLObject(convertHSLToObject(value));
    return new HSL(hsl);
  }

  /**
   * Store the hue as an object of number values. Percentages are stored as decimals
   * between 0 and 1.
   */
  private readonly hsla: Readonly<BrandedHSLObject>;

  private constructor(hsla: BrandedHSLObject) {
    this.hsla = freeze(hsla);
  }

  /**
   * Hue
   *
   * A value between 0 and 360 representing the color wheel rotation.
   */
  get h(): number {
    return this.hsla.h;
  }

  /**
   * Saturation
   *
   * A value between 0 and 100 representing the percentage saturation.
   */
  get s(): number {
    return this.hsla.s;
  }

  /**
   * Lightness
   *
   * A value between 0 and 100 representing the percentage lightness.
   */
  get l(): number {
    return this.hsla.l;
  }

  /**
   * Alpha
   *
   * The alpha value which is a number between 0 and 1.
   */
  get a(): number | undefined {
    return this.hsla.a;
  }

  /**
   * Returns the object representation of the hsl class.
   */
  public toJSON() {
    const { h, s, l, a } = this;
    return { h, s, l, a };
  }

  /**
   * Return the array representation of the hsl
   */
  public toArray() {
    const { h, s, l, a } = this;
    return [h, s, l, a] as const;
  }

  /**
   * Produces a valid HSL string that can be used to represent a color in your css.
   */
  public toString() {
    const { h, s, l, a } = this;
    const [hue, saturation, lightness, alpha] = [h.toString(), `${s}%`, `${l}%`, a ? `${a}%` : undefined];

    return isString(alpha)
      ? `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`
      : `hsl(${hue}, ${saturation}, ${lightness})`;
  }

  /**
   * Rotate the color around the color wheel. The value is always clamped between 0 and 360deg.
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)')
   * color.rotate(100).h // => 280
   * ```
   */
  public rotate(degrees: number): HSL {
    const { h, ...sla } = this.hsla;
    return this.clone({ ...sla, h: createValidHue(h + degrees) });
  }

  public complement(): HSL {
    return this.rotate(180);
  }

  /**
   * Lighten the color.
   *
   * Can either be a number or a string which represents a percentage.
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)')
   * color.lighten(50).l // => 75
   * color.lighten('25%').l // => 62.5
   * ```
   */
  public lighten(percent: number | string): HSL {
    const { l, ...hsa } = this.hsla;
    const lightness = createValidPercent(clampPercent(l + createValidPercent(percent)));
    return this.clone({ ...hsa, l: lightness });
  }

  /**
   * Darken the color.
   *
   * Can either be a number or a string which represents a percentage.
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)')
   * color.darken(50).l // => 25
   * color.darken('25%').l // => 37.5
   * ```
   */
  public darken(percent: number | string): HSL {
    const { l, ...hsa } = this.hsla;
    const lightness = createValidPercent(clampPercent(l - createValidPercent(percent)));
    return this.clone({ ...hsa, l: lightness });
  }

  /**
   * Increase the opacity of the color.
   *
   * Can either be a number or a string which represents a percentage.
   *
   * ```ts
   * const hsl = HSL.create('hsla(180, 50%, 50%, 0.5)')
   * color.unfade(50).a // => 0.75
   * color.unfade('25%').a // => 0.625
   * ```
   */
  public unfade(percent: number | string): HSL {
    const { a = 1, ...hsl } = this.hsla;
    const alpha = createValidPercent(clampPercent(a + createValidPercent(percent)));
    return this.clone({ ...hsl, a: alpha });
  }

  /**
   * Decrease the opacity of the color.
   *
   * Can either be a number or a string which represents a percentage.
   *
   * ```ts
   * const hsl = HSL.create('hsla(180, 50%, 50%, 0.5)')
   * color.fade(50).a // => 0.25
   * color.fade('25%').a // => 0.375
   * ```
   */
  public fade(percent: number | string): HSL {
    const { a = 100, ...hsl } = this.hsla;
    const num = clampPercent(a - createValidPercent(percent));
    const alpha = createValidPercent(num);
    return this.clone({ ...hsl, a: alpha });
  }

  /**
   * Increase the color saturation.
   *
   * Can either be a number or a string which represents a percentage.
   *
   * NOTE: the number is treated as a percentage value (not a ratio).
   * - `50` is treated as `50%`
   * - `0.5` is treated as `0.5%`
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)')
   * hsl.saturate(50).s // => 75
   * hsl.saturate('100%').s // => 100
   * ```
   */
  public saturate(percent: number | string): HSL {
    const { s, ...hla } = this.hsla;
    const saturation = createValidPercent(clampPercent(s + createValidPercent(percent)));
    return this.clone({ ...hla, s: saturation });
  }

  /**
   * Decrease the color saturation.
   *
   * Can either be a number or a string which represents a percentage.
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)')
   * hsl.desaturate(50).s // => 25
   * hsl.desaturate('100%').s // => 0
   * ```
   */
  public desaturate(percent: number | string): HSL {
    const { s, ...hla } = this.hsla;
    const saturation = createValidPercent(clampPercent(s - createValidPercent(percent)));
    return this.clone({ ...hla, s: saturation });
  }

  /**
   * Set the hue value of the color.
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)');
   * hsl.hue(100).h //=> 100
   * ```
   */
  public hue(hue: number | string): HSL {
    return this.clone({ ...this.hsla, h: createValidHue(hue) });
  }

  /**
   * Set the saturation value of the color.
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)');
   * hsl.saturation(15).s //=> 15
   * ```
   */
  public saturation(saturation: number | string): HSL {
    return this.clone({ ...this.hsla, s: createValidPercent(saturation) });
  }

  /**
   * Set the lightness value of the color.
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%)');
   * hsl.lightness(100).h //=> 100
   * ```
   */
  public lightness(lightness: number | string): HSL {
    return this.clone({ ...this.hsla, l: createValidPercent(lightness) });
  }

  /**
   * Set the alpha (transparency) value of the color.
   *
   * Value passed must be a percentage;
   *
   * ```ts
   * const hsl = HSL.create('hsl(180, 50%, 50%, 0.5)');
   * hsl.alpha(40).a // => 40
   * ```
   */
  public alpha(alpha?: number | string): HSL {
    return this.clone({ ...this.hsla, a: createValidAlpha(isNumber(alpha) ? `${alpha}%` : alpha) });
  }

  /**
   * Returns a cloned version of the HSL.
   *
   * If an HSLObject is provided it merges these properties into the final object.
   */
  public clone(hsla: Partial<HSLObject> = {}) {
    return new HSL(createValidHSLObject({ ...this.hsla, ...hsla }));
  }
}

const freeze = (hslObject: BrandedHSLObject): Readonly<BrandedHSLObject> => Object.freeze(hslObject);
