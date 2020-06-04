module.exports = {
  // ...baseBabel,
  // presets: [...baseBabel.presets, 'babel-preset-gatsby'],
  overrides: [
    { test: /\.ts$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: false }]] },
    { test: /\.tsx$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: true }]] },
    {
      test: /\.[jt]sx?$/,
      plugins: [
        ['@babel/plugin-proposal-class-properties'],
        ['@babel/plugin-proposal-private-methods'],
      ],
    },
  ],
};
