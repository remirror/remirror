const coverageThreshold = {
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};

module.exports = {
  cacheDirectory: '<rootDir>/.jest',
  coverageReporters: ['json', 'html', 'text', 'text-summary', 'lcov'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverage: true,
  projects: ['<rootDir>/@remirror/*', '<rootDir>/docs', '<rootDir>/packages/*'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  ...(process.env.TEST_ENV === false ? coverageThreshold : {}),
  testRunner: 'jest-circus/runner',
};
