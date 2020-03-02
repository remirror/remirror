const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  name: '@remirror/extension-table',
  displayName: 'extension-table',
  testEnvironment: 'enzyme',
  setupFilesAfterEnv: [...config.setupFilesAfterEnv, 'jest-enzyme'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
};
