/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CoverageMapData } from 'istanbul-lib-coverage';
export declare type DoneFn = (reason?: string | Error) => void;
export declare type TestName = string;
export declare type TestFn = (done?: DoneFn) => Promise<any> | void | undefined;
export declare type BlockFn = () => void;
export declare type BlockName = string;
declare interface JasmineType {
  _DEFAULT_TIMEOUT_INTERVAL?: number;
  addMatchers: Function;
}
declare type Each = () => void;
export interface ItBase {
  (testName: TestName, fn: TestFn, timeout?: number): void;
  each: Each;
}
export interface It extends ItBase {
  only: ItBase;
  skip: ItBase;
  todo: (testName: TestName, ...rest: any[]) => void;
}
export type ItConcurrentBase = (testName: string, testFn: () => Promise<any>, timeout?: number) => void;
export interface ItConcurrentExtended extends ItConcurrentBase {
  only: ItConcurrentBase;
  skip: ItConcurrentBase;
}
export interface ItConcurrent extends It {
  concurrent: ItConcurrentExtended;
}
export interface DescribeBase {
  (blockName: BlockName, blockFn: BlockFn): void;
  each: Each;
}
export interface Describe extends DescribeBase {
  only: ItBase;
  skip: ItBase;
}
export interface Global extends NodeJS.Global {
  it: It;
  test: ItConcurrent;
  fit: ItBase;
  xit: ItBase;
  xtest: ItBase;
  describe: Describe;
  xdescribe: DescribeBase;
  fdescribe: DescribeBase;
  __coverage__: CoverageMapData;
  jasmine: JasmineType;
}
declare global {
  namespace NodeJS {
    interface Global {
      it: It;
      test: ItConcurrent;
      fit: ItBase;
      xit: ItBase;
      xtest: ItBase;
      describe: Describe;
      xdescribe: DescribeBase;
      fdescribe: DescribeBase;
    }
  }
}
export {};
// # sourceMappingURL=Global.d.ts.map
