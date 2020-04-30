const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  name: '@remirror/cli',
  displayName: 'cli',
  testEnvironment: 'node',
};
