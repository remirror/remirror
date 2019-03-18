/**
 * Flatten arbitrarily nested arrays into a non-nested list of non-array items
 *
 * @param list
 * @param depth
 */
declare function flatten<GReturn = any>(arr: any[], depth?: number): GReturn[];

export = flatten;
