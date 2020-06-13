const { createFilePath } = require('gatsby-source-filesystem');
const gql = require('graphql-tag').default;
const { print } = require('graphql/language/printer');
const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');
const { relative, resolve } = require('path');

const allMdxQuery = gql`
  query loadAllMdx {
    allMdx {
      edges {
        node {
          id
          fileAbsolutePath
          fields {
            slug
          }
        }
      }
    }
  }
`;

/** @type import('gatsby').GatsbyNode['onCreateNode'] */
const onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type !== 'Mdx') {
    return;
  }

  const value = createFilePath({ node, getNode }).toLowerCase();

  actions.createNodeField({
    name: 'slug',
    node,
    value,
  });
};

const baseDir = resolve(__dirname, '../../../');

/**
 * Create the gatsby pages.
 *
 * @type import('gatsby').GatsbyNode['createPages']
 */
const createPages = async ({ graphql, actions }) => {
  /**
   * @typedef {Object} ResultType - creates a new type named 'SpecialType'
   * @property {object} [errors] - The errors if they exist
   * @property {Pick<GatsbyTypes.Query, 'allMdx'> | undefined} [data] - the data
   */

  /** @type ResultType */
  const result = await graphql(print(allMdxQuery));
  if (result.errors) {
    return;
  }

  const pages = (result.data && result.data.allMdx.edges.map((edge) => edge.node)) || [];

  pages.forEach((page) => {
    const relativePath = relative(baseDir, page.fileAbsolutePath);

    actions.createPage({
      path: (page.fields && page.fields.slug) || '',
      component: require.resolve('./src/layouts/index.tsx'),
      context: {
        id: page.id,
        relativePath,
      },
    });
  });
};

/**
 * Extend the babel config.
 *
 * @type import('gatsby').GatsbyNode['onCreateBabelConfig']
 */
const onCreateBabelConfig = (parameter, options) => {
  const { actions } = parameter;
  actions.setBabelPreset({
    name: require.resolve(`linaria/babel`),
    options: options || {},
  });
};

/**
 * Add monaco editor support to the webpack plugin.
 *
 * @type import('gatsby').GatsbyNode['onCreateWebpackConfig']
 */
const onCreateWebpackConfig = (parameter) => {
  const { actions, getConfig, loaders } = parameter;
  /** @type Required<import('webpack').Configuration> */
  const config = getConfig();

  config.plugins.push(new MonacoEditorWebpackPlugin({ languages: ['typescript', 'javascript'] }));

  config.module.rules = [
    ...config.module.rules.filter((rule) => String(rule.test) !== String(/\.tsx?$/)),
    {
      ...loaders.js(),
      test: /\.[jt]sx?$/,
      exclude: (modulePath) =>
        /node_modules/.test(modulePath) && !/node_modules\/(@?remirror)/.test(modulePath),
    },
    {
      test: /\.tsx?$/,
      loader: require.resolve('linaria/loader'),
      options: {
        sourceMap: process.env.NODE_ENV !== 'production',
      },
    },
  ];

  actions.replaceWebpackConfig(config);
};

module.exports = {
  createPages,
  onCreateNode,
  onCreateWebpackConfig,
  onCreateBabelConfig,
};
