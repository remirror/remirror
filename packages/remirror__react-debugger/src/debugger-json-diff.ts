import type { DiffPatcher } from 'jsondiffpatch';
import { uniqueId } from '@remirror/core';

import { JsonDiffInput, JsonDiffOutput, JsonDiffWorkerInput } from './debugger-types';
import { IdleScheduler, TypedPromiseWorker } from './debugger-utils';

export abstract class BaseJsonDiff {
  /**
   * Scheduler for deferring worker until the browser is less busy.
   */
  readonly scheduler = new IdleScheduler();

  /**
   * Run a diff on the input.
   */
  abstract diff(input: JsonDiffInput): Promise<JsonDiffOutput>;
}

export class WorkerJsonDiff extends BaseJsonDiff {
  /**
   * A worker which allows for
   */
  worker: TypedPromiseWorker<JsonDiffOutput, JsonDiffWorkerInput>;

  constructor() {
    super();
    const worker = new Worker('../worker.json-diff', { name: 'jsonDiffWorker', type: 'module' });
    this.worker = new TypedPromiseWorker(worker);
  }

  async diff(input: JsonDiffInput): Promise<JsonDiffOutput> {
    // Wait for a free moment
    await this.scheduler.request();

    const id = uniqueId();
    return this.worker.send({ id, input });
  }
}

/**
 * Diff the json within the browser.
 */
export class DefaultJsonDiff extends BaseJsonDiff {
  /**
   * An instance of the diff-patcher which is loaded dynamically due to the
   * bundle size.
   */
  diffPatcher: Promise<DiffPatcher>;

  constructor() {
    super();

    this.diffPatcher = import('jsondiffpatch').then(({ DiffPatcher }) => {
      return new DiffPatcher({
        arrays: { detectMove: false, includeValueOnMove: false },
        textDiff: { minLength: 1 },
      });
    });
  }

  async diff(input: JsonDiffInput): Promise<JsonDiffOutput> {
    const diffPatcher = await this.diffPatcher;
    await this.scheduler.request();

    return {
      id: input.id,
      delta: diffPatcher.diff(input.a, input.b),
    };
  }
}
