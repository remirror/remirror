const coverageThreshold = {
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
};

module.exports = {
  cacheDirectory: '<rootDir>/.jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!config/**',
    '!**/__mocks__/**',
    '!**/tmp/**',
    '!**/__tests__/**',
    '!jest.*.ts',
  ],
  coveragePathIgnorePatterns: ['**/dtslint/*.ts'],
  projects: ['<rootDir>/@packages/*'], // Doesn't work with only one project https://github.com/facebook/jest/pull/7498
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  ...(process.env.TEST_ENV ? coverageThreshold : {}),
};
