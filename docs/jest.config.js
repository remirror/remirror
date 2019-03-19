const config = require('../support/jest/jest.config');
const { jestSupportDir } = require('../support/jest/helpers');

const {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  // coveragePathIgnorePatterns,
  testPathIgnorePatterns,
  testRegex,
  cacheDirectory,
  moduleNameMapper,
} = config;

module.exports = {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  // coveragePathIgnorePatterns,
  testPathIgnorePatterns,
  testRegex,
  cacheDirectory,
  moduleNameMapper,
  name: '@remirror/docz',
  displayName: 'docs',
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer', jestSupportDir('jest.framework.ts')],
};
