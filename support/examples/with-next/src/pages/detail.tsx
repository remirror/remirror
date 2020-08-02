import type { NextPageContext } from 'next';
import React, { Component } from 'react';

import Layout from '../components/layout';
import ListDetail from '../components/list-detail';
import type { User } from '../interfaces';
import { findData } from '../utils/sample-api';

interface Props {
  item?: User;
  errors?: string;
}

class InitialPropsDetail extends Component<Props> {
  static getInitialProps = async ({ query }: NextPageContext) => {
    try {
      const { id } = query;
      const item = await findData(Array.isArray(id) ? id[0] : id ?? '');
      return { item };
    } catch (error) {
      return { errors: error.message };
    }
  };

  render() {
    const { item, errors } = this.props;

    if (errors) {
      return (
        <Layout title={`Error | Next.js + TypeScript Example`}>
          <p>
            <span style={{ color: 'red' }}>Error:</span> {errors}
          </p>
        </Layout>
      );
    }

    return (
      <Layout title={`${item ? item.name : 'Detail'} | Next.js + TypeScript Example`}>
        {item && <ListDetail item={item} />}
      </Layout>
    );
  }
}

export default InitialPropsDetail;
