const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  displayName: { name: require('./package.json').name.replace('@remirror/', ''), color: 'pink' },
  testEnvironment: 'node',
};
