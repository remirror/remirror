const config = require('../support/jest/jest.config');

const {
  clearMocks,
  verbose,
  moduleFileExtensions,
  globals,
  transform,
  coveragePathIgnorePatterns,
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
  coveragePathIgnorePatterns,
  testPathIgnorePatterns,
  testRegex,
  cacheDirectory,
  moduleNameMapper,
  name: '@remirror/docz',
  displayName: 'docs',
  preset: 'jest-puppeteer',
};
