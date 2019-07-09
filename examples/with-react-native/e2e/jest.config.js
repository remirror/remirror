const config = require('../../../support/jest/jest.config');
const { resolve } = require('path');

module.exports = {
  ...config,
  // preset: 'react-native',
  verbose: true,
  testRegex: '/.*\\.test\\.ts$',
  testEnvironment: 'node',
  setupFilesAfterEnv: [resolve(__dirname, './init.ts')],
  reporters: ['detox/runners/jest/streamlineReporter'],
};
