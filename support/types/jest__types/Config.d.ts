/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Arguments } from 'yargs';
export declare type Path = string;
export declare type Glob = string;
export declare interface HasteConfig {
  computeSha1?: boolean;
  defaultPlatform?: string | null | undefined;
  hasteImplModulePath?: string;
  platforms?: string[];
  providesModuleNodeModules: string[];
}
export declare type ReporterConfig = [string, object];
export declare type ConfigGlobals = object;
export declare interface DefaultOptions {
  automock: boolean;
  bail: number;
  browser: boolean;
  cache: boolean;
  cacheDirectory: Path;
  changedFilesWithAncestor: boolean;
  clearMocks: boolean;
  collectCoverage: boolean;
  collectCoverageFrom: string[] | null | undefined;
  coverageDirectory: string | null | undefined;
  coveragePathIgnorePatterns: string[];
  coverageReporters: string[];
  coverageThreshold:
    | {
        global: {
          [key: string]: number;
        };
      }
    | null
    | undefined;
  cwd: Path;
  dependencyExtractor: string | null | undefined;
  errorOnDeprecated: boolean;
  expand: boolean;
  filter: Path | null | undefined;
  forceCoverageMatch: Glob[];
  globals: ConfigGlobals;
  globalSetup: string | null | undefined;
  globalTeardown: string | null | undefined;
  haste: HasteConfig;
  maxConcurrency: number;
  moduleDirectories: string[];
  moduleFileExtensions: string[];
  moduleNameMapper: {
    [key: string]: string;
  };
  modulePathIgnorePatterns: string[];
  noStackTrace: boolean;
  notify: boolean;
  notifyMode: string;
  preset: string | null | undefined;
  prettierPath: string | null | undefined;
  projects: Array<string | ProjectConfig> | null | undefined;
  resetMocks: boolean;
  resetModules: boolean;
  resolver: Path | null | undefined;
  restoreMocks: boolean;
  rootDir: Path | null | undefined;
  roots: Path[] | null | undefined;
  runner: string;
  runTestsByPath: boolean;
  setupFiles: Path[];
  setupFilesAfterEnv: Path[];
  skipFilter: boolean;
  snapshotSerializers: Path[];
  testEnvironment: string;
  testEnvironmentOptions: object;
  testFailureExitCode: string | number;
  testLocationInResults: boolean;
  testMatch: Glob[];
  testPathIgnorePatterns: string[];
  testRegex: string[];
  testResultsProcessor: string | null | undefined;
  testRunner: string | null | undefined;
  testURL: string;
  timers: 'real' | 'fake';
  transform:
    | {
        [key: string]: string;
      }
    | null
    | undefined;
  transformIgnorePatterns: Glob[];
  watchPathIgnorePatterns: string[];
  useStderr: boolean;
  verbose: boolean | null | undefined;
  watch: boolean;
  watchman: boolean;
}
export declare interface InitialOptions {
  automock?: boolean;
  bail?: boolean | number;
  browser?: boolean;
  cache?: boolean;
  cacheDirectory?: Path;
  clearMocks?: boolean;
  changedFilesWithAncestor?: boolean;
  changedSince?: string;
  collectCoverage?: boolean;
  collectCoverageFrom?: Glob[];
  collectCoverageOnlyFrom?: {
    [key: string]: boolean;
  };
  coverageDirectory?: string;
  coveragePathIgnorePatterns?: string[];
  coverageReporters?: string[];
  coverageThreshold?: {
    global: {
      [key: string]: number;
    };
  };
  dependencyExtractor?: string;
  detectLeaks?: boolean;
  detectOpenHandles?: boolean;
  displayName?: string;
  expand?: boolean;
  extraGlobals?: string[];
  filter?: Path;
  findRelatedTests?: boolean;
  forceCoverageMatch?: Glob[];
  forceExit?: boolean;
  json?: boolean;
  globals?: ConfigGlobals;
  globalSetup?: string | null | undefined;
  globalTeardown?: string | null | undefined;
  haste?: HasteConfig;
  reporters?: Array<string | ReporterConfig>;
  logHeapUsage?: boolean;
  lastCommit?: boolean;
  listTests?: boolean;
  mapCoverage?: boolean;
  maxConcurrency?: number;
  moduleDirectories?: string[];
  moduleFileExtensions?: string[];
  moduleLoader?: Path;
  moduleNameMapper?: {
    [key: string]: string;
  };
  modulePathIgnorePatterns?: string[];
  modulePaths?: string[];
  name?: string;
  noStackTrace?: boolean;
  notify?: boolean;
  notifyMode?: string;
  onlyChanged?: boolean;
  outputFile?: Path;
  passWithNoTests?: boolean;
  preprocessorIgnorePatterns?: Glob[];
  preset?: string | null | undefined;
  prettierPath?: string | null | undefined;
  projects?: Glob[];
  replname?: string | null | undefined;
  resetMocks?: boolean;
  resetModules?: boolean;
  resolver?: Path | null | undefined;
  restoreMocks?: boolean;
  rootDir: Path;
  roots?: Path[];
  runner?: string;
  runTestsByPath?: boolean;
  scriptPreprocessor?: string;
  setupFiles?: Path[];
  setupTestFrameworkScriptFile?: Path;
  setupFilesAfterEnv?: Path[];
  silent?: boolean;
  skipFilter?: boolean;
  skipNodeResolution?: boolean;
  snapshotResolver?: Path;
  snapshotSerializers?: Path[];
  errorOnDeprecated?: boolean;
  testEnvironment?: string;
  testEnvironmentOptions?: object;
  testFailureExitCode?: string | number;
  testLocationInResults?: boolean;
  testMatch?: Glob[];
  testNamePattern?: string;
  testPathDirs?: Path[];
  testPathIgnorePatterns?: string[];
  testRegex?: string | string[];
  testResultsProcessor?: string | null | undefined;
  testRunner?: string;
  testURL?: string;
  timers?: 'real' | 'fake';
  transform?: {
    [key: string]: string;
  };
  transformIgnorePatterns?: Glob[];
  watchPathIgnorePatterns?: string[];
  unmockedModulePathPatterns?: string[];
  updateSnapshot?: boolean;
  useStderr?: boolean;
  verbose?: boolean | null | undefined;
  watch?: boolean;
  watchAll?: boolean;
  watchman?: boolean;
  watchPlugins?: Array<string | [string, object]>;
}
export declare type SnapshotUpdateState = 'all' | 'new' | 'none';
declare type NotifyMode = 'always' | 'failure' | 'success' | 'change' | 'success-change' | 'failure-change';
export declare interface GlobalConfig {
  bail: number;
  changedSince: string;
  changedFilesWithAncestor: boolean;
  collectCoverage: boolean;
  collectCoverageFrom: Glob[];
  collectCoverageOnlyFrom:
    | {
        [key: string]: boolean;
      }
    | null
    | undefined;
  coverageDirectory: string;
  coveragePathIgnorePatterns?: string[];
  coverageReporters: string[];
  coverageThreshold: {
    global: {
      [key: string]: number;
    };
  };
  detectLeaks: boolean;
  detectOpenHandles: boolean;
  enabledTestsMap:
    | {
        [key: string]: {
          [key: string]: boolean;
        };
      }
    | null
    | undefined;
  expand: boolean;
  extraGlobals: string[];
  filter: Path | null | undefined;
  findRelatedTests: boolean;
  forceExit: boolean;
  json: boolean;
  globalSetup: string | null | undefined;
  globalTeardown: string | null | undefined;
  lastCommit: boolean;
  logHeapUsage: boolean;
  listTests: boolean;
  maxConcurrency: number;
  maxWorkers: number;
  noStackTrace: boolean;
  nonFlagArgs: string[];
  noSCM: boolean | null | undefined;
  notify: boolean;
  notifyMode: NotifyMode;
  outputFile: Path | null | undefined;
  onlyChanged: boolean;
  onlyFailures: boolean;
  passWithNoTests: boolean;
  projects: Glob[];
  replname: string | null | undefined;
  reporters: Array<string | ReporterConfig>;
  runTestsByPath: boolean;
  rootDir: Path;
  silent: boolean;
  skipFilter: boolean;
  errorOnDeprecated: boolean;
  testFailureExitCode: number;
  testNamePattern: string;
  testPathPattern: string;
  testResultsProcessor: string | null | undefined;
  updateSnapshot: SnapshotUpdateState;
  useStderr: boolean;
  verbose: boolean | null | undefined;
  watch: boolean;
  watchAll: boolean;
  watchman: boolean;
  watchPlugins:
    | Array<{
        path: string;
        config: object;
      }>
    | null
    | undefined;
}
export declare interface ProjectConfig {
  automock: boolean;
  browser: boolean;
  cache: boolean;
  cacheDirectory: Path;
  clearMocks: boolean;
  coveragePathIgnorePatterns: string[];
  cwd: Path;
  dependencyExtractor?: string;
  detectLeaks: boolean;
  detectOpenHandles: boolean;
  displayName: string | null | undefined;
  errorOnDeprecated: boolean;
  extraGlobals: Array<keyof NodeJS.Global>;
  filter: Path | null | undefined;
  forceCoverageMatch: Glob[];
  globalSetup: string | null | undefined;
  globalTeardown: string | null | undefined;
  globals: ConfigGlobals;
  haste: HasteConfig;
  moduleDirectories: string[];
  moduleFileExtensions: string[];
  moduleLoader: Path;
  moduleNameMapper: Array<[string, string]>;
  modulePathIgnorePatterns: string[];
  modulePaths: string[];
  name: string;
  prettierPath: string;
  resetMocks: boolean;
  resetModules: boolean;
  resolver: Path | null | undefined;
  restoreMocks: boolean;
  rootDir: Path;
  roots: Path[];
  runner: string;
  setupFiles: Path[];
  setupFilesAfterEnv: Path[];
  skipFilter: boolean;
  skipNodeResolution: boolean;
  snapshotResolver: Path | null | undefined;
  snapshotSerializers: Path[];
  testEnvironment: string;
  testEnvironmentOptions: object;
  testMatch: Glob[];
  testLocationInResults: boolean;
  testPathIgnorePatterns: string[];
  testRegex: string[];
  testRunner: string;
  testURL: string;
  timers: 'real' | 'fake';
  transform: Array<[string, Path]>;
  transformIgnorePatterns: Glob[];
  watchPathIgnorePatterns: string[];
  unmockedModulePathPatterns: string[] | null | undefined;
}
export declare type Argv = Arguments<{
  all: boolean;
  automock: boolean;
  bail: boolean | number;
  browser: boolean;
  cache: boolean;
  cacheDirectory: string;
  changedFilesWithAncestor: boolean;
  changedSince: string;
  ci: boolean;
  clearCache: boolean;
  clearMocks: boolean;
  collectCoverage: boolean;
  collectCoverageFrom: string[];
  collectCoverageOnlyFrom: string[];
  config: string;
  coverage: boolean;
  coverageDirectory: string;
  coveragePathIgnorePatterns: string[];
  coverageReporters: string[];
  coverageThreshold: string;
  debug: boolean;
  env: string;
  expand: boolean;
  findRelatedTests: boolean;
  forceExit: boolean;
  globals: string;
  globalSetup: string | null | undefined;
  globalTeardown: string | null | undefined;
  h: boolean;
  haste: string;
  help: boolean;
  init: boolean;
  json: boolean;
  lastCommit: boolean;
  logHeapUsage: boolean;
  maxWorkers: number;
  moduleDirectories: string[];
  moduleFileExtensions: string[];
  moduleLoader: string;
  moduleNameMapper: string;
  modulePathIgnorePatterns: string[];
  modulePaths: string[];
  name: string;
  noSCM: boolean;
  noStackTrace: boolean;
  notify: boolean;
  notifyMode: string;
  onlyChanged: boolean;
  outputFile: string;
  preset: string | null | undefined;
  projects: string[];
  prettierPath: string | null | undefined;
  replname: string | null | undefined;
  resetMocks: boolean;
  resetModules: boolean;
  resolver: string | null | undefined;
  restoreMocks: boolean;
  rootDir: string;
  roots: string[];
  runInBand: boolean;
  setupFiles: string[];
  setupFilesAfterEnv: string[];
  showConfig: boolean;
  silent: boolean;
  snapshotSerializers: string[];
  testEnvironment: string;
  testFailureExitCode: string | null | undefined;
  testMatch: string[];
  testNamePattern: string;
  testPathIgnorePatterns: string[];
  testPathPattern: string[];
  testRegex: string | string[];
  testResultsProcessor: string | null | undefined;
  testRunner: string;
  testURL: string;
  timers: 'real' | 'fake';
  transform: string;
  transformIgnorePatterns: string[];
  unmockedModulePathPatterns: string[] | null | undefined;
  updateSnapshot: boolean;
  useStderr: boolean;
  verbose: boolean | null | undefined;
  version: boolean;
  watch: boolean;
  watchAll: boolean;
  watchman: boolean;
  watchPathIgnorePatterns: string[];
}>;
export {};
