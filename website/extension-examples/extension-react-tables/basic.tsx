/**
 * THIS FILE IS AUTO GENERATED!
 *
 * Run `pnpm -w generate:website-examples` to regenerate this file.
 */

// @ts-nocheck

import CodeBlock from '@theme/CodeBlock';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ComponentSource from '!!raw-loader!../../../packages/storybook-react/stories/extension-react-tables/basic.tsx';

import { ExampleRoot } from '../../components/example-root';

const ExampleComponent = (): JSX.Element => {
  const story = (
    <BrowserOnly>
      {() => {
        const ComponentStory = require('../../../packages/storybook-react/stories/extension-react-tables/basic').default
        return <ComponentStory/>
      }}
    </BrowserOnly>
  );
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <ExampleRoot story={story} source={source} />;
};

export default ExampleComponent;
  