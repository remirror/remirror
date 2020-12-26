const reporters = ['default'];

if (process.env.CI === 'true') {
  reporters.push('jest-github-reporter');
}

module.exports = {
  ...require('../jest/jest.config'),
  coverageThreshold: {
    global: {
      statements: 80,
      functions: 80,
      lines: 80,
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

    // This is internal code and doesn't affect the end user experience.
    '!packages/@remirror/playground/**',

    // Currently can't be tested with JSDOM
    '!packages/@remirror/extension-epic-mode/**',

    // Tests written but needs more coverage.
    '!packages/@remirror/extension-codemirror5/**',

    // Refactor upcoming for emoji which will change the structure.
    '!packages/@remirror/extension-emoji/src/data/**',

    // Positions can't be tested properly in JSDOM. This will be addressed again
    // once the project moves to a new unit test runner.
    '!packages/@remirror/extension-positioner/**',

    // Themes may be removed at some point, or heavily refactored.
    '!packages/@remirror/theme/**',

    // Tables are still in a very early stage
    '!packages/@remirror/preset-table/**',

    // There is still al ot of work needed in order to make renderers useful.
    '!packages/@remirror/react/src/renderers/**',

    // SSR is currently being looked at, starting from e2e tests.
    '!packages/@remirror/react/src/ssr/**',

    // Still deciding whether to deprecate and replace with `yjs`.
    '!packages/@remirror/extension-collaboration/**',

    // Still a wip
    '!packages/@remirror/extension-image/**',

    // Still a wip
    '!packages/@remirror/preset-embed/**',

    // Still a wip
    '!packages/@remirror/preset-list/**',

    // Still a wip
    '!packages/@remirror/react-components/**',

    // Deprecated package
    '!packages/@remirror/react-social/**',

    // Still deciding how best to use this project. It should be moved outside
    // of remirror for simplification.
    '!packages/multishift/**',

    // Deprecated package
    '!packages/@remirror/react-wysiwyg/**',

    // Deprecated package
    '!packages/@remirror/showcase/**',

    // Still a wip. No tests at the moment due to lack of usage.
    '!packages/@remirror/cli/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  collectCoverage: true,
  reporters,
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  testRunner: 'jest-circus/runner',
  testPathIgnorePatterns: ['<rootDir>/support/', '/node_modules/'],
};
