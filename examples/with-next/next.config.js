const withPreconstruct = require('@preconstruct/next');

module.exports = withPreconstruct({
  devIndicators: {
    autoPrerender: false,
  },
  webpack: (config) => {
    const alias = ((config.resolve ??= {}).alias ??= {});

    // Use emotion as an alias for linaria.
    alias['@linaria/core'] = '@emotion/css';

    return config;
  },
});
