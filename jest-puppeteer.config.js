const { PUPPETEER_DEBUG, PUPPETEER_BROWSER, PUPPETEER_DOCKER } = process.env;

const debug = PUPPETEER_DEBUG === 'true';
const browser = PUPPETEER_BROWSER || 'chromium';

const extraLaunchConfig =
  PUPPETEER_DOCKER && browser === 'chromium'
    ? { args: ['--no-sandbox', '--disable-dev-shm-usage'] }
    : {};

module.exports = {
  launch: {
    headless: !debug,
    timeout: 120000,
    slowMo: debug ? 10 : undefined,
    ...extraLaunchConfig,
  },
  browser,
};
