const { resolve, join } = require('path');

const baseDir = (...paths) => resolve(__dirname, '..', '..', join(...paths));
const jestSupportDir = (...args) => baseDir(join('support', 'jest', ...args));

const environment = {
  get isUnit() {
    return !environment.isE2E && !environment.isIntegration;
  },

  get isIntegration() {
    return process.env.TEST_ENV === 'integration';
  },

  get isE2E() {
    return process.env.TEST_ENV === 'e2e';
  },

  get isCI() {
    return Boolean(process.env.CI);
  },

  get isMacOS() {
    return process.platform === 'darwin';
  },
};

exports.baseDir = baseDir;
exports.jestSupportDir = jestSupportDir;
exports.environment = environment;
