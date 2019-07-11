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

const { PUPPETEER_SERVERS } = process.env;

const __SERVERS__ = PUPPETEER_SERVERS
  ? PUPPETEER_SERVERS.split(',')
  : ['next', 'docz', 'storybook'];

module.exports = {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals: {
    ...globals,
    __E2E__: true,
    __SERVERS__,
  },
  transform,
  rootDir: baseDir('e2e'),
  testPathIgnorePatterns,
  testRegex: '/.*\\.puppeteer\\.ts$',
  cacheDirectory,
  moduleNameMapper,
  modulePathIgnorePatterns: ['node_modules'],
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer', jestSupportDir('jest.framework.ts')],
  globalSetup: jestSupportDir('jest.puppeteer.setup.ts'),
  globalTeardown: jestSupportDir('jest.puppeteer.teardown.ts'),
};
