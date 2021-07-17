const path = require('path');

/**
 * @param {import('@babel/core').ConfigAPI} api
 * @returns {import('@babel/core').TransformOptions}
 */
function babelConfig(api) {
  const caller = api.caller((caller) =>
    caller === null || caller === void 0 ? void 0 : caller.name,
  );
  const isServer = caller === 'server';
  const absoluteRuntimePath = path.dirname(require.resolve('@babel/runtime/package.json'));

  return {
    overrides: [
      {
        test: /\.ts$/,
        plugins: [[require.resolve('@babel/plugin-transform-typescript'), { isTSX: false }]],
      },
      {
        test: /\.tsx$/,
        plugins: [[require.resolve('@babel/plugin-transform-typescript'), { isTSX: true }]],
      },
      {
        test: /\.[jt]sx?$/,
        plugins: [
          require.resolve('babel-plugin-macros'),

          // Polyfills the runtime needed for async/await, generators, and friends
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime
          [
            require.resolve('@babel/plugin-transform-runtime'),
            {
              corejs: false,
              helpers: true,
              // By default, it assumes @babel/runtime@7.0.0. Since we use >7.0.0, better to
              // explicitly specify the version so that it can reuse the helper better
              // See https://github.com/babel/babel/issues/10261
              version: require('@babel/runtime/package.json').version,
              regenerator: true,
              useESModules: true,
              // Undocumented option that lets us encapsulate our runtime, ensuring
              // the correct version is used
              // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
              absoluteRuntime: absoluteRuntimePath,
            },
          ],

          // Adds syntax support for import()
          isServer
            ? require.resolve('babel-plugin-dynamic-import-node')
            : require.resolve('@babel/plugin-syntax-dynamic-import'),

          require.resolve('@babel/plugin-transform-template-literals'),
          require.resolve('@babel/plugin-proposal-object-rest-spread'),
          require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
          require.resolve('@babel/plugin-proposal-optional-chaining'),
          require.resolve('@babel/plugin-proposal-numeric-separator'),
          [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
          [require.resolve('@babel/plugin-proposal-class-properties')],
          [require.resolve('@babel/plugin-proposal-private-methods')],
        ],
      },
    ],
    presets: [
      isServer
        ? [
            require.resolve('@babel/preset-env'),
            {
              targets: {
                node: 'current',
              },
            },
          ]
        : [
            require.resolve('@babel/preset-env'),
            {
              useBuiltIns: 'entry',
              loose: true,
              corejs: { version: '3.6', proposals: true },
              // Do not transform modules to CJS
              modules: false,
              // Exclude transforms that make all code slower
              exclude: ['transform-typeof-symbol'],
            },
          ],
      [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
      require.resolve('@linaria/babel-preset'),
    ],
    plugins: [],
  };
}

module.exports = babelConfig;
