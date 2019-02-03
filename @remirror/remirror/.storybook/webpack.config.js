const path = require('path');

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.tsx?$/,
    loader: require.resolve('babel-loader'),
  });

  if (process.env.COVERAGE === 'true') {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: {
        loader: 'istanbul-instrumenter-loader',
        options: { esModules: true },
      },
      enforce: 'post',
      exclude: /node_modules|internal|docs|support|\.(spec|test)\.tsx?$/,
      include: path.resolve(__dirname, '../../..'),
    });
  }

  config.resolve.alias = config.resolve.alias || {};
  config.externals = { ...(config.externals || {}), fs: '__NOT_USED__' };

  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
