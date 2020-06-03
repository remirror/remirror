import { GatsbyNode } from 'gatsby';
import { createFilePath } from 'gatsby-source-filesystem';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
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

export const onCreateBabelConfig: GatsbyNode['onCreateBabelConfig'] = () => {
  // actions.setBabelOptions({ options: { rootMode: 'upward-optional', ...options } });
  // actions.setBabelPreset({ name: require.resolve('babel-preset-gatsby'), options: options ?? {} });
};

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = (
  _parameter,
  _options,
) => {
  // const { getConfig } = _parameter;
  // const hasFoundRule = false;
  // const config = getConfig();
  // console.log(config);
  // const babelLoader = loaders.js();
  // console.log(babelLoader);
  // babelLoader.options.rootMode = 'upward-optional';
  // for (const rule of config.module.rules) {
  //   console.log(rule.include);
  //   if (rule.use === babelLoader || (Array.isArray(rule.use) && rule.use.includes(babelLoader))) {
  //     console.log('BABEL LoADER Found');
  //     hasFoundRule = true;
  //     delete rule.include;
  //   }
  // }
  // actions.setWebpackConfig({
  //   module: {
  //     rules: [
  //       {
  //         test: /\.(jsx?|tsx?)$/,
  //         use: babelLoader,
  //         // Exclude the untransformed packages from the exclude rule here
  //         exclude: /node_modules\/(?!(@remirror\/.*|remirror)\/).*/,
  //       },
  //     ],
  //   },
  // });
  // console.log(loaders.js() === loaders.js(), loaders.js());
  // console.log(getConfig().module.rules);
  // console.log(getConfig() === getConfig(), 'THERE IS THE ANSWER');
  // console.log('ABBBBB', rules.use);
  // console.log(getConfig());
};
