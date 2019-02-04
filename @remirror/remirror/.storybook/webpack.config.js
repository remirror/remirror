const { resolve, join } = require('path');

const defaultConfig = require('../../../support/babel/base.babel');

const babelConfig = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          node: '8',
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    ...defaultConfig.plugins,
    [
      'module-resolver',
      {
        alias: {
          '@remirror/core': '../core/src',
          '@remirror/core-extensions': '../core-extensions/src',
          '@remirror/react': '../react/src',
          '@remirror/mentions-extension': '../mentions-extension/src',
          '@remirror/renderer': '../renderer/src',
        },
        cwd: 'babelrc',
      },
    ],
  ],
};

const use = [{ loader: require.resolve('babel-loader'), options: babelConfig }];

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.tsx?$/,
    use,
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
      include: resolve(__dirname, '../../'),
    });
  }

  config.resolve.alias = config.resolve.alias || {};

  // Object.assign(config.resolve.alias, {
  //   '@remirror/core': packagesDirectory('core/src/index.ts'),
  //   '@remirror/core-extensions': packagesDirectory('core-extensions/src/index.ts'),
  //   '@remirror/react': packagesDirectory('react/src/index.ts'),
  //   '@remirror/mentions-extension': packagesDirectory('mentions-extension/src/index.ts'),
  //   '@remirror/renderer': packagesDirectory('renderer/src/index.ts'),
  // });

  config.externals = { ...(config.externals || {}), fs: '__NOT_USED__' };

  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
