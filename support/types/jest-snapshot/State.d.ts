/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// declare module 'jest-snapshot/State' {
// tslint:disable-next-line:no-implicit-dependencies
import { Config } from '@jest/types';
export declare interface SnapshotStateOptions {
  updateSnapshot: Config.SnapshotUpdateState;
  getPrettier: () => null | any;
  getBabelTraverse: () => Function;
  expand?: boolean;
}
export declare interface SnapshotMatchOptions {
  testName: string;
  received: any;
  key?: string;
  inlineSnapshot?: string;
  error?: Error;
}
export default class SnapshotState {
  private _counters;
  private _dirty;
  private _index;
  private _updateSnapshot;
  private _snapshotData;
  private _snapshotPath;
  private _inlineSnapshots;
  private _uncheckedKeys;
  private _getBabelTraverse;
  private _getPrettier;
  public added: number;
  public expand: boolean;
  public matched: number;
  public unmatched: number;
  public updated: number;
  constructor(snapshotPath: Config.Path, options: SnapshotStateOptions);
  public markSnapshotsAsCheckedForTest(testName: string): void;
  private _addSnapshot;
  public save(): {
    deleted: boolean;
    saved: boolean;
  };
  public getUncheckedCount(): number;
  public getUncheckedKeys(): string[];
  public removeUncheckedKeys(): void;
  public match(
    options: SnapshotMatchOptions,
  ): {
    actual: string;
    count: number;
    expected: string | null;
    key: string;
    pass: boolean;
  };
  public fail(testName: string, _received: any, key?: string): string;
}
// }
