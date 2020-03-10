/** @jsx jsx */

import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { FC, ReactNode } from 'react';
import { jsx } from 'theme-ui';

import { Layout } from '../components/layout';
import { TemplateProps } from '../typings';

export interface MainLayoutProps extends TemplateProps {
  data: GatsbyTypes.EntryQuery;
  pageContext: {
    id: string;
    relativePath: string;
  };
  children?: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ data, pageContext, children }) => {
  if (!data?.mdx) {
    return (
      <Layout fullWidth={true} relativePath='' title=''>
        {children}
      </Layout>
    );
  }

  const { frontmatter, body } = data.mdx;
  const { fullWidth = false, title = '' } = frontmatter ? frontmatter : {};
  const { relativePath } = pageContext;

  return (
    <Layout fullWidth={fullWidth} title={title} relativePath={relativePath}>
      <MDXRenderer>{body}</MDXRenderer>
    </Layout>
  );
};

export const query = graphql`
  query Entry($id: String!) {
    mdx(id: { eq: $id }) {
      id
      frontmatter {
        fullWidth
        title
      }
      body
      timeToRead
      wordCount {
        paragraphs
        words
        sentences
      }
    }
  }
`;

export default MainLayout;
