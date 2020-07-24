const { REMIRROR_E2E_COVERAGE } = process.env;
const plugins = REMIRROR_E2E_COVERAGE
  ? [
      'istanbul',
      {
        exclude: [
          '**/__tests__',
          '**/e2e',
          '**/support',
          '**/__dts__',
          '**/__mocks__',
          '**/__fixtures__',
          '*.{test,spec}.{ts,tsx}',
          '**/*.d.ts',
          '*.d.ts',
        ],
      },
    ]
  : [];

module.exports = {
  presets: ['next/babel'],
  plugins,
};
