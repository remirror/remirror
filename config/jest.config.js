const { join } = require('path');

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
    '^.+\\.(js|jsx|ts|tsx)$': join(__dirname, './jest.transformer.js'),
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dtslint/',
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
  setupFilesAfterEnv: [join(__dirname, 'jest.framework.ts')],
  cacheDirectory: '../../.jest/cache',
  testEnvironment: 'node',
};
