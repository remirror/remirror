const wp = require('@cypress/webpack-preprocessor');

let coverageMap;

module.exports = (on, config) => {
  const options = {
    webpackOptions: require('../../webpack.config'),
  };
  on('file:preprocessor', wp(options));

  if (config.env.coverage) {
    const istanbul = require('istanbul-lib-coverage');
    coverageMap = istanbul.createCoverageMap({});

    on('task', {
      coverage(coverage) {
        coverageMap.merge(coverage);
        return JSON.stringify(coverageMap);
      },
    });
  }

  return config;
};
