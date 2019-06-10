const config = require('./jest.config');
const { jestSupportDir, baseDir } = require('./helpers');

const {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  testPathIgnorePatterns,
  cacheDirectory,
  moduleNameMapper,
} = config;

module.exports = {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  rootDir: baseDir('support/e2e'),
  // coveragePathIgnorePatterns,
  testPathIgnorePatterns,
  testRegex: '/.*\\.puppeteer\\.ts$',
  cacheDirectory,
  moduleNameMapper,
  name: '@remirror/docz',
  displayName: 'docs',
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer', jestSupportDir('jest.framework.ts')],
  globalSetup: jestSupportDir('jest.puppeteer.setup.ts'),
  globalTeardown: jestSupportDir('jest.puppeteer.teardown.ts'),
};
