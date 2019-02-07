const wp = require('@cypress/webpack-preprocessor');

module.exports = (on, config) => {
  const options = {
    webpackOptions: require('../../webpack.config'),
  };
  on('file:preprocessor', wp(options));

  return config;
};
