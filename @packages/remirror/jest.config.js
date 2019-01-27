const config = require('../../config/jest.config');
const { join } = require('path');

module.exports = {
  ...config,
  name: 'remirror',
  displayName: 'remirror',
  setupFilesAfterEnv: [join(__dirname, 'jest.framework.ts')],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@test-utils$': join(__dirname, 'src', '__tests__', 'test-utils.tsx'),
  },
};
