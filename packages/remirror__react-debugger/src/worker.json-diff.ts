/**
 * @module
 *
 * A web worker which offloads json diffing to a webworker.
 */

/// <reference lib="webworker" />

import { DiffPatcher } from 'jsondiffpatch';
import registerPromiseWorker from 'promise-worker/register';

import type { JsonDiffOutput, JsonDiffWorkerInput } from './debugger-types';

const diffPatcher = new DiffPatcher({
  arrays: { detectMove: false, includeValueOnMove: false },
  textDiff: { minLength: 1 },
});

registerPromiseWorker<JsonDiffWorkerInput, JsonDiffOutput>((data) => {
  const { a, b, id } = data.input;

  return {
    id,
    delta: diffPatcher.diff(a, b),
  };
});
