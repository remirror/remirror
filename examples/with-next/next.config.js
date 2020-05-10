const withPreconstruct = require('@preconstruct/next');

module.exports = withPreconstruct({
  devIndicators: {
    autoPrerender: false,
  },
  experimental: {
    reactRefresh: false,
  },
});
