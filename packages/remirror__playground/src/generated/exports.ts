/**
 * @module
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see `support/scripts/src/playground.ts`
 */

import { loadJson } from 'json.macro';

import type { DtsCache } from '../playground-types';

// Use a babel macro to load the json file.
const dtsCache = loadJson<DtsCache>('./dts.json', 'dtsCache');

/**
 * The pre populated cache of definition files.
 */
export const DTS_CACHE: DtsCache = dtsCache;
