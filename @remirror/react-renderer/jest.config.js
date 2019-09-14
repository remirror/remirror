const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  name: '@remirror/react-renderer',
  displayName: 'renderer-react',
  testEnvironment: 'enzyme',
  setupFilesAfterEnv: [...config.setupFilesAfterEnv, 'jest-enzyme'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
};
