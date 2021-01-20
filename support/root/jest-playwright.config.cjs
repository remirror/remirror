// @ts-check

const { E2E_DEBUG, E2E_COVERAGE, E2E_BROWSER = 'chromium' } = process.env;

const browsers = E2E_BROWSER.split(',');
const collectCoverage = E2E_COVERAGE === 'true';
const debug = E2E_DEBUG === 'true';

/**
 * @type {import('jest-playwright-preset').JestPlaywrightConfig}
 */
module.exports = {
  launchOptions: {
    headless: !debug,
    timeout: 120_000,
    slowMo: debug ? 10 : undefined,
  },
  browsers,
  collectCoverage,
};
