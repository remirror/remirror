
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { sync } from 'glob';
import HtmlWebpackExcludeEmptyAssetsPlugin from 'html-webpack-exclude-empty-assets-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join, resolve } from 'path';
import PurifyCSSWebpackPlugin from 'purifycss-webpack';
import { HotModuleReplacementPlugin } from 'webpack';
import WebpackChromeReloaderPlugin from 'webpack-chrome-extension-reloader';

const rootDir = (...args) => resolve(__dirname, '..', '..', join(...args));

const generateHtmlPlugins = items => {
  return items.map(
    name =>
      new HtmlWebpackPlugin({
        filename: `./templates/${name}.html`,
        chunks: [name],
        template: './src/templates/root.html',
        title: `Pledge ${name}`,
      }),
  );
};

const webpackConfig = {
  devtool: '#source-map',
  entry: {
    popup: './src/popup',
    background: './src/background',
    options: './src/options',
    content: './src/content',
  },
  output: {
    path: rootDir('@apps', 'extension', 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader',
        options: { limit: 10000000 },
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: [{ loader: 'css-loader' }],
          fallback: 'style-loader',
        }),
      },
      {
        test: /(\.tsx?|\.js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.wasm', '.mjs'],
    // modules: [join(baseDir, 'node_modules'), join(baseDir, '../', '../', 'node_modules')],
  },
  plugins: [
    // We check the NODE_ENV for the "development" value to include the plugin
    ...(process.env.NODE_ENV === 'development'
      ? [
          new WebpackChromeReloaderPlugin({
            port: 9090, // Which port use to create the server
            // reloadPage: true, // Force the reload of the page also
            entries: {
              // The entries used for the content/background scripts

              contentScript: ['content', 'popup', 'options'], // Use the entry names, not the file name or the path
              background: 'background',
            },
          }),
        ]
      : []),
    new CopyWebpackPlugin([
      {
        from: '*',
        context: 'src',
        ignore: ['*.ts', '*.tsx'],
      },
      { from: 'src/assets/', toType: 'dir', to: 'assets' },
      { from: 'src/styles/', toType: 'dir', to: 'styles' },
      // { from: 'src/templates/', toType: 'dir', to: 'templates' },
      {
        from: '../../node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
      },
      {
        from: '../../node_modules/webext-inject-on-install/index.js',
        to: 'inject-on-install.js',
      },
      // node_modules/webext-inject-on-install/index.js
    ]),
    new ExtractTextPlugin({ filename: 'styles/style.css' }),
    // Make sure this is after ExtractTextPlugin!
    new PurifyCSSWebpackPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: [...sync(join(__dirname, 'src/**'))],
    }),
    new HotModuleReplacementPlugin(),
    ...generateHtmlPlugins(['popup', 'background', 'injected', 'options']),
    new HtmlWebpackExcludeEmptyAssetsPlugin(),
  ],

  optimization: {
    // Without this, function names will be garbled and enableFeature won't work
    minimize: false,
  },
};

export default webpackConfig;
