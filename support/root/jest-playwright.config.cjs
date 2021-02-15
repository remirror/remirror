// @ts-check

const { E2E_DEBUG, E2E_COVERAGE, E2E_BROWSER = 'chromium' } = process.env;

/** @type {?} */
const browsers = E2E_BROWSER.split(',')
const collectCoverage = E2E_COVERAGE === 'true';
const debug = E2E_DEBUG === 'true';

/**
 * @type {import('jest-playwright-preset').JestPlaywrightConfig}
 */
const config = {
  launchOptions: {
    headless: !debug,
    timeout: 120_000,
    slowMo: debug ? 10 : undefined,
  },
  browsers,
  collectCoverage,
};

module.exports = config
