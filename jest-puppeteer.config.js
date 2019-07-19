const { PUPPETEER_DEBUG, PUPPETEER_BROWSER, PUPPETEER_DOCKER } = process.env;

const debug = PUPPETEER_DEBUG === 'true';
const browser = PUPPETEER_BROWSER || 'chromium';

const args =
  PUPPETEER_DOCKER === 'true' && PUPPETEER_BROWSER === 'chromium'
    ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    : undefined;

module.exports = {
  launch: {
    headless: !debug,
    timeout: 120000,
    slowMo: debug ? 10 : undefined,
    args,
  },
  browser,
};
