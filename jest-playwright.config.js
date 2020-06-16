const { REMIRROR_E2E_DEBUG, REMIRROR_E2E_BROWSER = 'chromium', REMIRROR_E2E_DOCKER } = process.env;

/** @typedef {'chromium' | 'firefox' | 'webkit'} BrowserType */

/** @type BrowserType[] */
const browsers = REMIRROR_E2E_BROWSER.split(',');

const debug = REMIRROR_E2E_DEBUG === 'true';
const extraLaunchConfig =
  REMIRROR_E2E_DOCKER && browsers.includes('chromium')
    ? { args: ['--no-sandbox', '--disable-dev-shm-usage'] }
    : {};

module.exports = {
  launch: {
    headless: !debug,
    timeout: 120000,
    slowMo: debug ? 10 : undefined,
    ...extraLaunchConfig,
  },
  browsers,
};
