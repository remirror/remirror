import { NextPage } from 'next';
import Link from 'next/link';
import * as React from 'react';

import Layout from '../components/layout';

const IndexPage: NextPage = () => {
  return (
    <Layout title='Home | Next.js + TypeScript Example'>
      <h1>Next.js Remirror examples 👋</h1>
      <p>Choose the example you wish to see:</p>
      <ul>
        <li>
          SocialUI: <Link href='/editor/social'>blank</Link> /{' '}
          <Link href='/editor/social/content'>with content</Link> /{' '}
          <Link href='/editor/rich-social'>rich text</Link> /{' '}
          <Link href='/editor/rich-social/content'>rich text with content</Link>
        </li>

        <li>
          <abbr title='What you see is what you get'>WYSIWYG</abbr>: <Link href='/editor/wysiwyg'>blank</Link>{' '}
          / <Link href='/editor/wysiwyg/content'>with content</Link>
        </li>
      </ul>
    </Layout>
  );
};

export default IndexPage;
