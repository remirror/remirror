require('source-map-support').install();

const { baseDir } = require('../scripts/helpers');
require('ts-node').register({
  project: baseDir('support/build/tsconfig.json'),
  transpileOnly: true,
});

module.exports = require('./rollup-build.ts');
