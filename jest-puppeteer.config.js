const server =
  process.env.TEST_ENV === 'live'
    ? {
        command: 'yarn docs:ci',
        port: 3000,
        host: 'localhost',
        // protocol: 'http-get',
        launchTimeout: 30000,
        // debug: true,
      }
    : {};

const launch =
  process.env.TEST_ENV === 'live'
    ? {}
    : {
        // headless: false,
        // slowMo: 50,
        // devtools: true
      };

module.exports = {
  server,
  launch,
};
