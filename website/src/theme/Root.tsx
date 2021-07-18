import { FC } from 'react';
import { ExampleProvider } from 'docusaurus-plugin-examples/components';

const Root: FC = (props) => {
  const { children } = props;

  return <ExampleProvider defaultLanguage='ts'>{children}</ExampleProvider>;
};

export default Root;
