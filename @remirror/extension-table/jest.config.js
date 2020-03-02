const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  name: '@remirror/extension-tables',
  displayName: 'extension-tables',
  testEnvironment: 'enzyme',
  setupFilesAfterEnv: [...config.setupFilesAfterEnv, 'jest-enzyme'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
};
