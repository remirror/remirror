import { GatsbyNode } from 'gatsby';
import { createFilePath } from 'gatsby-source-filesystem';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
import { relative, resolve } from 'path';

import { Query } from '../../generated/gatsby';

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
  const result = await graphql<Pick<Query, 'allMdx'>>(print(allMdxQuery));
  if (result.errors) {
    console.log(result.errors);
    return;
  }

  const pages = result.data?.allMdx.edges.map(edge => edge.node) ?? [];

  pages.forEach(page => {
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
