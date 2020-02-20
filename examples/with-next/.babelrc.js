module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          targets: {
            browsers: '>2%',
          },
        },
      },
    ],
    '@emotion/babel-preset-css-prop',
  ],
};
