const { PUPPETEER_DEBUG, PUPPETEER_BROWSER } = process.env;

const debug = PUPPETEER_DEBUG === 'true';
const browser = PUPPETEER_BROWSER || 'chromium';

module.exports = {
  launch: {
    headless: !debug,
    timeout: 120000,
    slowMo: debug ? 10 : undefined,
  },
  browser,
};
