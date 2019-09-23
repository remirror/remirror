import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import pkg from '../../package.json';
import { RootLayoutProps } from '../typings';

export const Head: FC<RootLayoutProps> = ({ pageContext: { frontmatter } }) => {
  const title = [frontmatter ? frontmatter.title : false, 'Remirror'].filter(Boolean).join(' — ');

  return (
    <Helmet htmlAttributes={{ lang: 'en-GB' }}>
      <title>{title}</title>
      <meta name='description' content={pkg.description} />
      <link rel='icon' type='image/png' href='/icon.png' />
      <link rel='apple-touch-icon' type='image/png' href='/icon.png' />
      <meta name='social:card' content='summary' />
      <meta name='social:site' content='@ifiokjr' />
      <meta
        name='social:image'
        content='https://repository-images.githubusercontent.com/166780923/9e00f600-7721-11e9-848b-eb31a5db5b89'
      />
      <meta name='social:title' content={title} />
      <meta name='social:description' content={pkg.description} />
    </Helmet>
  );
};

export default Head;
