const config = require('../../config/jest.config');
const { join } = require('path');

module.exports = {
  ...config,
  name: '@remirror/core',
  displayName: 'core',
  setupFilesAfterEnv: [join(__dirname, 'jest.framework.ts')],
  testEnvironment: 'jsdom',
};
