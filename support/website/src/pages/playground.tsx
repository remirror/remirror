import Layout from '@theme/Layout';
import React from 'react';
import Head from '@docusaurus/Head';

import { Playground } from '@remirror/playground';

const PlaygroundPage = () => {
  return (
    <Layout>
      <Head>
        <script src='https://unpkg.com/@babel/standalone/babel.min.js'></script>
      </Head>
      <Playground />
    </Layout>
  );
};

export default PlaygroundPage;
