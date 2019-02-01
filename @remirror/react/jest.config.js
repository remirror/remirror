const config = require('../../config/jest.config');
const { join } = require('path');

module.exports = {
  ...config,
  name: '@remirror/react',
  displayName: 'react',
  setupFilesAfterEnv: [join(__dirname, 'jest.framework.ts')],
  testEnvironment: 'jsdom',
};
