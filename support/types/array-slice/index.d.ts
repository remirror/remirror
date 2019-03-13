/**
 * Array-slice method. Slices `array` from the `start` index up to, but not including, the `end` index.
 *
 * @params arr
 * @params start
 * @params end
 */
function slice<GArray extends any[]>(arr: GArray, start: number, end?: number): GArray;

export = slice;
