import RawOriginalRoot from '@theme-original/Root';
import { ExampleProvider } from 'docusaurus-plugin-examples/components';
import { FC, memo } from 'react';

const Root: FC = (props) => {
  const { children } = props;

  return <ExampleProvider defaultLanguage='ts'>{children}</ExampleProvider>;
};

export default Root;
