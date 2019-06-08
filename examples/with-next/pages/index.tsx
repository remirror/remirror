import { NextPage } from 'next';
import Link from 'next/link';
import * as React from 'react';
import Layout from '../components/layout';

const IndexPage: NextPage = () => {
  return (
    <Layout title='Home | Next.js + TypeScript Example'>
      <h1>Hello Next.js 👋</h1>
      <p>
        <Link href='/about'>
          <a>About</a>
        </Link>
      </p>
    </Layout>
  );
};

export default IndexPage;
