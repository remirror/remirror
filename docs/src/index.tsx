import React, { ReactChild } from 'react';

import { MainLayout, MainLayoutProps } from './layouts';

interface WrapPageElementParameter {
  element: ReactChild;
  props: MainLayoutProps;
}

export const wrapPageElement = ({ element, props }: WrapPageElementParameter) => {
  return <MainLayout {...props}>{element}</MainLayout>;
};
