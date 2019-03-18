const { resolve, join } = require('path');

const baseDir = (...paths) => resolve(__dirname, '..', '..', join(...paths));
const jestSupportDir = (...args) => baseDir(join('support', 'jest', ...args));

exports.baseDir = baseDir;
exports.jestSupportDir = jestSupportDir;
