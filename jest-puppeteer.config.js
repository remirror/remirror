module.exports = {
  ...(process.env.TEST_ENV === 'live'
    ? {
        server: {
          command: 'yarn launch:docs',
          port: 3000,
          host: 'localhost',
          launchTimeout: 30000,
        },
      }
    : {}),
  ...(process.env.TEST_ENV === 'live'
    ? {
        // launch: {
        //   headless: false,
        //   slowMo: 50,
        //   devtools: true,
        // },
      }
    : {
        launch: {
          headless: false,
          slowMo: 50,
          devtools: true,
        },
      }),
};
