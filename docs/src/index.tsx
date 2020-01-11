import React, { ReactChild } from 'react';

import { MainLayout, MainLayoutProps } from './layouts';

interface WrapPageElementParams {
  element: ReactChild;
  props: MainLayoutProps;
}

export const wrapPageElement = ({ element, props }: WrapPageElementParams) => {
  return <MainLayout {...props}>{element}</MainLayout>;
};
