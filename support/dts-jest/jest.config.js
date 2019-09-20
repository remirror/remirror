const { baseDir } = require('../scripts/helpers');

module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '/dts-jest/.+\\.ts$',
  transform: { '/dts-jest/.+\\.ts$': 'dts-jest/transform' },
  rootDir: baseDir('support/dts-jest'),
  reporters: ['default', 'dts-jest/reporter'],
  globals: {
    _dts_jest_: {
      compiler_options: baseDir('support', 'dts-jest', 'tsconfig.json'),
    },
  },
  name: 'dts',
  displayName: 'dts jest',
};
