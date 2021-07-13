import { NextPage } from 'next';
import Link from 'next/link';

import Layout from '../components/layout';

const IndexPage: NextPage = () => {
  return (
    <Layout title='Home | Next.js + TypeScript Example'>
      <h1>Next.js Remirror examples 👋</h1>
      <p>Choose the example you wish to see:</p>
      <ul>
        <li>
          SocialUI:{' '}
          <Link href='/editor/social'>
            <a>blank</a>
          </Link>{' '}
          /{' '}
          <Link href='/editor/social/content'>
            <a>with content</a>
          </Link>{' '}
          /{' '}
          <Link href='/editor/rich-social'>
            <a>rich text</a>
          </Link>{' '}
          /{' '}
          <Link href='/editor/rich-social/content'>
            <a>rich text with content</a>
          </Link>
        </li>

        <li>
          <abbr title='What you see is what you get'>WYSIWYG</abbr>:{' '}
          <Link href='/editor/wysiwyg'>
            <a>blank</a>
          </Link>{' '}
          /{' '}
          <Link href='/editor/wysiwyg/content'>
            <a>with content</a>
          </Link>
        </li>
      </ul>
    </Layout>
  );
};

export default IndexPage;
