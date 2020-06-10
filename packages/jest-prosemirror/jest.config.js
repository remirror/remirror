const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  setupFilesAfterEnv: [],
  snapshotSerializers: [],

  displayName: { name: require('./package.json').name.replace('@remirror/', ''), color: 'pink' },
};
