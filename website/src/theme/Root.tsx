import { ExampleProvider } from '@components';
import React from 'react';
import { FC, PropsWithChildren } from 'react';

const Root: FC<PropsWithChildren<object>> = (props) => {
  const { children } = props;

  return <ExampleProvider defaultLanguage='ts'>{children}</ExampleProvider>;
};

export default Root;
