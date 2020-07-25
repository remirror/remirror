module.exports = {
  ...require('../jest/jest.config'),
  coverageThreshold: {
    global: {
      statements: 60,
    },
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.dts.ts',
    '!**/theme-styles.ts',
    '!**/styles.ts',
    '!**/__mocks__/**',
    '!**/__tests__/**',
    '!**/__dts__/**',
    '!**/__fixtures__/**',
    '!support/**',
    '!packages/@remirror/playground/**',
    '!packages/@remirror/showcase/**',
    '!packages/@remirror/cli/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  collectCoverage: true,
  reporters: ['default', 'jest-github-reporter'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  testRunner: 'jest-circus/runner',
  testPathIgnorePatterns: ['<rootDir>/support/', '/node_modules/'],
};
