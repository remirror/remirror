const config = require('../../support/jest/jest.config');
module.exports = {
  ...config,
  setupFilesAfterEnv: [],
  snapshotSerializers: [],
  name: 'jest-prosemirror',
  displayName: 'jest-prosemirror',
};
