const reporters = ['default'];

if (process.env.CI === 'true') {
  reporters.push('jest-github-reporter');
}

module.exports = {
  ...require('./support/jest/jest.config'),
  coverageThreshold: {
    global: {
      statements: 50,
      functions: 50,
      lines: 50,
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
    '!examples/**',
    '!website/**',

    // Currently can't be tested with JSDOM
    '!packages/remirror__extension-epic-mode/**',

    // Refactor upcoming for emoji which will change the structure.
    '!packages/remirror__extension-emoji/src/data/**',

    // Positions can't be tested properly in JSDOM. This will be addressed again
    // once the project moves to a new unit test runner.
    '!packages/remirror__extension-positioner/**',

    // Themes may be removed at some point, or heavily refactored.
    '!packages/remirror__theme/**',

    // Tables are still in a very early stage
    '!packages/remirror__preset-table/**',

    // There is still al ot of work needed in order to make renderers useful.
    '!packages/remirror__react/src/renderers/**',

    // SSR is currently being looked at, starting from e2e tests.
    '!packages/remirror__react/src/ssr/**',

    // Still deciding whether to deprecate and replace with `yjs`.
    '!packages/remirror__extension-collaboration/**',

    // Still a wip
    '!packages/remirror__extension-image/**',

    // Still a wip
    '!packages/remirror__react-components/**',

    // Still deciding how best to use this project. It should be moved outside
    // of remirror for simplification.
    '!packages/multishift/**',

    // No need to test these static icon files.
    '!packages/remirror__icons/src/all-icons.ts',
    '!packages/remirror__react-components/src/icons/all.ts',

    // Still a wip. No tests at the moment due to lack of usage.
    '!packages/remirror__cli/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  collectCoverage: false,
  reporters,
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  testRunner: 'jest-circus/runner',
  testPathIgnorePatterns: ['/node_modules/'],
};
