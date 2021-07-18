import { FC, memo } from 'react';
import RawOriginalRoot from '@theme-original/Root';
import { ExampleProvider } from 'docusaurus-plugin-examples/components';

const OriginalRoot = memo(RawOriginalRoot);

const Root: FC = (props) => {
  const { children } = props;

  return (
    <ExampleProvider defaultLanguage='ts'>
      <OriginalRoot>{children}</OriginalRoot>
    </ExampleProvider>
  );
};

export default Root;
