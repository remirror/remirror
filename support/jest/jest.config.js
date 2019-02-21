const { join, resolve } = require('path');

const baseDir = (...paths) => resolve(__dirname, '..', '..', join(...paths));
const jestSupportDir = (...args) => baseDir(join('support', 'jest', ...args));
const testRegex = process.env.TEST_ENV
  ? '/__tests__/.*\\.(spec|test)\\.tsx?$'
  : '/__tests__/.*\\.spec\\.tsx?$';

module.exports = {
  clearMocks: true,
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  globals: {
    __DEV__: true,
    __TEST__: true,
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': jestSupportDir('jest.transformer.js'),
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.d.ts',
    '/__mocks__/',
    '/__tests__/',
    '/__fixtures__/',
    'jest\\.*\\.ts',
    'live-test-helpers\\.ts',
    'unit-test-helpers\\.ts',
  ],
  moduleDirectories: ['node_modules'],
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/'],
  testRegex,
  setupFilesAfterEnv: [
    jestSupportDir('jest.framework.ts'),
    jestSupportDir('jest.framework.dom.ts'),
  ],
  cacheDirectory: '../../.jest/cache',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@test-utils$': baseDir('@remirror', 'core', 'src', '__tests__', 'test-utils.tsx'),
    '@remirror\\/([a-z0-9-]+)$': baseDir('@remirror/$1/src'),
    // '@remirror/core$': baseDir('@remirror', 'core', 'src'),
    // '@remirror/core-extensions$': baseDir('@remirror', 'core-extensions', 'src'),
    // '@remirror/react$': baseDir('@remirror', 'react', 'src'),
    // '@remirror/mentions-extension$': baseDir('@remirror', 'mentions-extension', 'src'),
    // '@remirror/twitter-ui$': baseDir('@remirror', 'twitter-ui', 'src'),
    // '@remirror/renderer$': baseDir('@remirror', 'renderer', 'src'),
  },
};
