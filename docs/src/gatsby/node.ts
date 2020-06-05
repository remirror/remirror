import { GatsbyNode } from 'gatsby';
import { createFilePath } from 'gatsby-source-filesystem';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import { relative, resolve } from 'path';

export const allMdxQuery = gql`
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

export const onCreateNode: GatsbyNode['onCreateNode'] = ({ node, actions, getNode }) => {
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

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions }) => {
  const result = await graphql<Pick<GatsbyTypes.Query, 'allMdx'>>(print(allMdxQuery));
  if (result.errors) {
    console.log(result.errors);
    return;
  }

  const pages = result.data?.allMdx.edges.map((edge) => edge.node) ?? [];

  pages.forEach((page) => {
    const relativePath = relative(baseDir, page.fileAbsolutePath);

    actions.createPage({
      path: page.fields?.slug ?? '',
      component: require.resolve('../layouts/index.tsx'),
      context: {
        id: page.id,
        relativePath,
      },
    });
  });
};

export const onCreateBabelConfig: GatsbyNode['onCreateBabelConfig'] = (parameter, options) => {
  const { actions } = parameter;
  actions.setBabelPreset({
    name: require.resolve(`linaria/babel`),
    options: options ?? {},
  });
};

/**
 * Add monaco editor support to the webpack plugin.
 */
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = (parameter, _options) => {
  const { actions, getConfig, loaders } = parameter;
  const config = getConfig();

  // console.log(loaders.js());

  config.plugins.push(new MonacoEditorWebpackPlugin({ languages: ['typescript', 'javascript'] }));

  config.module.rules = [
    ...config.module.rules.filter((rule: any) => String(rule.test) !== String(/\.tsx?$/)),
    {
      ...loaders.js(),
      test: /\.[jt]sx?$/,
      exclude: (modulePath: string) =>
        /node_modules/.test(modulePath) && !/node_modules\/(@?remirror)/.test(modulePath),
    },
  ];

  actions.replaceWebpackConfig(config);
};
