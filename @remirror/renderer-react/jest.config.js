const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  name: '@remirror/renderer-react',
  displayName: 'renderer-react',
  testEnvironment: 'enzyme',
  setupFilesAfterEnv: [...config.setupFilesAfterEnv, 'jest-enzyme'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
};
