const { server: __SERVER__ } = require('testing/e2e');
const config = require('../jest/jest.config');
const { jestSupportDir } = require('../jest/helpers');

const environment = {
  playwright: {
    globalSetup: jestSupportDir('./jest.playwright.setup.ts'),
    globalTeardown: jestSupportDir('./jest.playwright.teardown.ts'),
    testRunner: 'jest-circus/runner',
    preset: 'jest-playwright-preset',
    testEnvironment: jestSupportDir('./jest.playwright.environment.js'),
  },
};

const {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  testPathIgnorePatterns,
  moduleNameMapper,
} = config;

/** @type Partial<import("@jest/types").Config.InitialOptions> */
module.exports = {
  clearMocks,
  verbose,
  moduleFileExtensions,
  transform,
  testPathIgnorePatterns,
  moduleNameMapper,
  globals: { ...globals, __SERVER__, __E2E__: true },
  cacheDirectory: '<rootDir>/.jest',
  modulePathIgnorePatterns: ['node_modules'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  displayName: {
    name: 'remirror:e2e',
    color: 'purple',
  },
  setupFilesAfterEnv: [
    'expect-playwright',
    jestSupportDir('jest.framework.ts'),
    jestSupportDir('jest.framework.e2e.ts'),
  ],
  testMatch: __SERVER__.testMatch,
  ...environment[__SERVER__.environment],
};
