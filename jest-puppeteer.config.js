const { PUPPETEER_DEBUG, PUPPETEER_BROWSER } = process.env;

const debug = PUPPETEER_DEBUG === 'true';
const browser = PUPPETEER_BROWSER || 'chromium';

module.exports = {
  launch: {
    dumpio: debug,
    headless: !debug,
  },
  browser,
};
