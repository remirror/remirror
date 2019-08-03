/* eslint-disable @typescript-eslint/no-var-requires */
const pkg = require('./package.json');
const remarkPlugins = [require('remark-slug'), require('remark-emoji')];

module.exports = {
  siteMetadata: {
    siteUrl: `https://docs.remirror.org`,
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-theme-ui',
    'gatsby-plugin-emotion',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-sitemap',
    `gatsby-plugin-layout`,
    'gatsby-plugin-remove-trailing-slashes',
    'gatsby-plugin-typescript',
    'gatsby-plugin-netlify',
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.mdx', '.md'],
        remarkPlugins,
      },
    },
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: 'pages',
      },
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-135738542-1',
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Remirror`,
        short_name: `Remirror`,
        start_url: `/`,
        lang: `en`,
        description: pkg.description,
        // background_color: `#f7f0eb`,
        // theme_color: `#a2466c`,
        // display: `standalone`,
        icon: `static/icon.svg`,
      },
    },
  ],
};
