const { jestSupportDir, baseDir } = require('./helpers');

module.exports = {
  clearMocks: true,
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  globals: {
    __DEV__: true,
    __TEST__: true,
    __E2E__: false,
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': jestSupportDir('jest.transformer.js'),
  },
  moduleDirectories: ['node_modules'],
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/'],
  testRegex: '/__tests__/.*\\.spec\\.tsx?$',
  setupFilesAfterEnv: [
    jestSupportDir('jest.framework.ts'),
    jestSupportDir('jest.framework.dom.ts'),
  ],
  snapshotSerializers: ['jest-emotion'],
  cacheDirectory: baseDir('.jest'),
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@remirror\\/([a-z0-9-]+)$': baseDir('@remirror', '$1', 'src'),
    'jest-remirror$': baseDir('packages', 'jest-remirror', 'src'),
    'jest-prosemirror$': baseDir('packages', 'jest-prosemirror', 'src'),
    '@test-fixtures/(.*)$': baseDir('support/fixtures/$1'),
  },
};
