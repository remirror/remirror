const { resolve } = require('path');
const localConfig = require('./.babelrc');

const workingDir = (path = '') => resolve(__dirname, path);

const babelConfig = {
  ...localConfig,
};

module.exports = {
  title: 'Remirror Docs',
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
            tsconfigPath: workingDir('../base.tsconfig.json'),
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
      include: [workingDir('../@remirror'), /@remirror/],
    });

    return config;
  },
};
