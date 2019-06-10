const config = require('../support/jest/jest.config');
const { jestSupportDir, baseDir } = require('../support/jest/helpers');

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
  globals: {
    ...globals,
    __E2E__: true,
  },
  transform,
  rootDir: baseDir('e2e'),
  testPathIgnorePatterns,
  testRegex: '/.*\\.puppeteer\\.ts$',
  cacheDirectory,
  moduleNameMapper,
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer', jestSupportDir('jest.framework.ts')],
  globalSetup: jestSupportDir('jest.puppeteer.setup.ts'),
  globalTeardown: jestSupportDir('jest.puppeteer.teardown.ts'),
};
