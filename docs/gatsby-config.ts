import pkg from './package.json';

const remarkPlugins = [require('remark-slug'), require('remark-emoji'), require('remark-unwrap-images')];

const gatsbyRemarkPlugins = [
  'gatsby-remark-relative-images',
  {
    resolve: `gatsby-remark-images`,
    options: {
      maxWidth: 960,
      withWebp: true,
    },
  },
  {
    resolve: 'gatsby-remark-external-links',
    options: {
      target: '_blank',
      rel: 'nofollow noopener noreferrer',
    },
  },
  {
    resolve: 'gatsby-remark-responsive-iframe',
    options: { wrapperStyle: 'margin-bottom: 1.0725rem' },
  },
  'gatsby-remark-copy-linked-files',
  'gatsby-remark-smartypants',
];

export default {
  siteMetadata: {
    siteUrl: `https://docs.remirror.org`,
    description: pkg.description,
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'docs',
        path: __dirname,
        ignore: ['**/public/**/*', '**/.cache/**/*', '**/api/**/*', '**/generated/**/*.ts'],
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-theme-ui',
    'gatsby-plugin-emotion',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-typescript',
    'gatsby-plugin-netlify',
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.mdx', '.md'],
        remarkPlugins,
        gatsbyRemarkPlugins,
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
    {
      resolve: 'gatsby-plugin-typegen',
      options: {
        typeDefsOutputPath: `${__dirname}/generated/gatsby.ts`,
      },
    },
  ],
};
