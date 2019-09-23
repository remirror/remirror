const baseBabel = require('../babel/base.babel');
const { resolve } = require('path');
const { modules } = require('./modules.json');

const moduleResolver = [
  'module-resolver',
  {
    alias: {
      ...modules,
    },
    cwd: resolve(__dirname),
  },
];

module.exports = {
  ...baseBabel,
  plugins: [...baseBabel.plugins, moduleResolver],
  sourceType: 'unambiguous',
};
