const config = require('../jest/jest.config');
const { jestSupportDir } = require('../jest/helpers');
const { server: __SERVER__ } = require('./server.config');

const {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  testPathIgnorePatterns,
  moduleNameMapper,
} = config;

module.exports = {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals: {
    ...globals,
    __E2E__: true,
    __SERVER__,
  },
  transform,
  testPathIgnorePatterns,
  testRegex: __SERVER__.regex,
  cacheDirectory: '<rootDir>/.jest',
  moduleNameMapper,
  modulePathIgnorePatterns: ['node_modules'],
  preset: 'jest-playwright-preset',
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  setupFilesAfterEnv: [
    'expect-playwright',
    jestSupportDir('jest.framework.ts'),
    '<rootDir>/jest-setup.ts',
  ],
  globalSetup: './jest.playwright.setup.ts',
  globalTeardown: './jest.playwright.teardown.ts',
  testEnvironment: './custom-environment.js',
  testRunner: 'jest-circus/runner',
};
