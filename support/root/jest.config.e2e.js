const { server: __SERVER__ } = require('testing/playwright');
const config = require('../jest/jest.config');
const { jestSupportDir } = require('../jest/helpers');

const { E2E_ENVIRONMENT = 'playwright' } = process.env;

const environment = {
  playwright: {
    globalSetup: jestSupportDir('./jest.playwright.setup.ts'),
    globalTeardown: jestSupportDir('./jest.playwright.teardown.ts'),
    testRunner: 'jest-circus/runner',
    preset: 'jest-playwright-preset',
    testEnvironment: jestSupportDir('./jest.playwright.environment.js'),
    setupFilesAfterEnv: [
      'expect-playwright',
      'jest-playwright-preset/lib/extends.js',
      jestSupportDir('jest.framework.ts'),
      jestSupportDir('jest.framework.e2e.ts'),
    ],
  },
  detox: {},
  spectron: {},
  appium: {},
}[E2E_ENVIRONMENT];

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
    color: 'black',
  },
  testMatch: __SERVER__.testMatch,
  ...environment,
};
