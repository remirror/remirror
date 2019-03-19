const { environment } = require('./support/jest/helpers');

module.exports = {
  cacheDirectory: '<rootDir>/.jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverage: environment.isUnit,
  projects: ['<rootDir>/@remirror/*', '<rootDir>/docs', '<rootDir>/packages/*'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  testRunner: 'jest-circus/runner',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.d.ts',
    '/__mocks__/',
    '/__tests__/',
    '/__fixtures__/',
    '/support/',
    'jest\\.*\\.ts',
  ],
  collectCoverageFrom: ['**/*.{ts,tsx}'],
};
