import { ExampleProps } from './Example';

declare module '@theme/Example' {
  import { FC } from 'react';

  const Example: FC<ExampleProps>;
  export default Example;
}
