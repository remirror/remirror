const {
  REMIRROR_E2E_DEBUG,
  REMIRROR_E2E_COVERAGE,
  REMIRROR_E2E_BROWSER = 'chromium',
} = process.env;

/** @type {import('testing/playwright').PlaywrightBrowserName} */
const browsers = REMIRROR_E2E_BROWSER.split(',');
const collectCoverage = REMIRROR_E2E_COVERAGE === 'true';
const debug = REMIRROR_E2E_DEBUG === 'true';

module.exports = {
  launch: {
    headless: !debug,
    timeout: 120_000,
    slowMo: debug ? 10 : undefined,
  },
  browsers,
  collectCoverage,
};
