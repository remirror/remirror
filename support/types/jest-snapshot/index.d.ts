declare module 'jest-snapshot' {
  import { Config, Matchers } from '@jest/types';
  import { Plugin } from 'pretty-format';
  import { SnapshotResolver as JestSnapshotResolver } from './snapshot_resolver';
  import SnapshotState from './State';
  import * as utils from './utils';

  declare type Context = Matchers.MatcherState & {
    snapshotState: SnapshotState;
  };
  declare const JestSnapshot: {
    EXTENSION: string;
    SnapshotState: typeof SnapshotState;
    addSerializer: (plugin: Plugin) => void;
    buildSnapshotResolver: (config: Config.ProjectConfig) => JestSnapshotResolver;
    cleanup: (
      hasteFS: import('../../jest-haste-map/build/HasteFS').default,
      update: Config.SnapshotUpdateState,
      snapshotResolver: JestSnapshotResolver,
    ) => {
      filesRemoved: number;
    };
    getSerializers: () => Plugin[];
    isSnapshotPath: (path: string) => boolean;
    toMatchInlineSnapshot: (
      this: Context,
      received: any,
      propertyMatchersOrInlineSnapshot?: any,
      inlineSnapshot?: string | undefined,
    ) =>
      | {
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          message: () => string;
          pass: boolean;
          name?: undefined;
          report?: undefined;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          actual: string;
          expected: string | null;
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
        };
    toMatchSnapshot: (
      this: Context,
      received: any,
      propertyMatchers?: any,
      testName?: string | undefined,
    ) =>
      | {
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          message: () => string;
          pass: boolean;
          name?: undefined;
          report?: undefined;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          actual: string;
          expected: string | null;
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
        };
    toThrowErrorMatchingInlineSnapshot: (
      this: Context,
      received: any,
      inlineSnapshot?: string | undefined,
      fromPromise?: boolean | undefined,
    ) =>
      | {
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          message: () => string;
          pass: boolean;
          name?: undefined;
          report?: undefined;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          actual: string;
          expected: string | null;
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
        };
    toThrowErrorMatchingSnapshot: (
      this: Context,
      received: any,
      testName: string | undefined,
      fromPromise: boolean,
    ) =>
      | {
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          message: () => string;
          pass: boolean;
          name?: undefined;
          report?: undefined;
          actual?: undefined;
          expected?: undefined;
        }
      | {
          actual: string;
          expected: string | null;
          message: () => string;
          name: string;
          pass: boolean;
          report: () => string;
        };
    utils: typeof utils;
  };

  declare namespace JestSnapshot {
    type SnapshotResolver = JestSnapshotResolver;
  }
  export = JestSnapshot;
}
