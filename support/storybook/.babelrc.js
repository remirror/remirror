const baseBabel = require('../babel/base.babel');
const { resolve } = require('path');

const moduleResolver = [
  'module-resolver',
  {
    alias: {
      ...require('./modules.json'),
    },
    cwd: resolve(__dirname),
  },
];

module.exports = {
  ...baseBabel,
  plugins: [...baseBabel.plugins, moduleResolver],
  sourceType: 'unambiguous',
};
