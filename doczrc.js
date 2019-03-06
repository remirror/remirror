const { resolve } = require('path');
const localConfig = require('./docs/.babelrc');

const workingDir = (path = '') => resolve(__dirname, path);

const babelConfig = {
  ...localConfig,
  plugins: [
    ...localConfig.plugins,
    ...(process.env.COVERAGE
      ? [
          [
            'istanbul',
            {
              exclude: [
                '**/node_modules/**',
                'node_modules/**',
                'node_modules',
                '**/*.d.ts',
                '**/__mocks__',
                '**/__tests__/',
                '**/__fixtures__',
                'jest\\.*\\.ts',
                'live-test-helpers.ts',
                'unit-test-helpers.ts',
              ],
            },
          ],
        ]
      : []),
  ],
};

module.exports = {
  public: 'support/assets',
  htmlContext: {
    favicon: '/public/favicon.ico',
  },
  title: 'Remirror',
  typescript: true,
  modifyBabelRc() {
    return babelConfig;
  },
  modifyBundlerConfig: config => {
    const loaders = config.plugins[0].config.loaders.map(loader => {
      if (loader.loader.includes('react-docgen-typescript-loader')) {
        return {
          ...loader,
          options: {
            propFilter: prop => !prop.parent.fileName.includes('node_modules'),
            tsconfigPath: workingDir('./base.tsconfig.json'),
          },
        };
      }
      return loader;
    });

    config.plugins[0].config.loaders = loaders;

    config.module.rules.push({
      test: /\.tsx?$/,
      loader: 'babel-loader',
      options: babelConfig,
      include: [workingDir('./@remirror'), /@remirror/],
    });

    return config;
  },
};
