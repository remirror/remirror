import { ExampleProvider } from '@components';
import { FC } from 'react';

const Root: FC = (props) => {
  const { children } = props;

  return <ExampleProvider defaultLanguage='ts'>{children}</ExampleProvider>;
};

export default Root;
