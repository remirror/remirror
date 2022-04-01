/**
 * THIS FILE IS AUTO GENERATED!
 *
 * Run `pnpm -w generate:website-examples` to regenerate this file.
 */

// @ts-nocheck

import CodeBlock from '@theme/CodeBlock';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ComponentSource from '!!raw-loader!../../../packages/storybook-react/stories/extension-count/character-limit.tsx';

import { StoryExample } from '../../src/components/story-example-component';

const ExampleComponent = (): JSX.Element => {
  const story = (
    <BrowserOnly>
      {() => {
        const ComponentStory = require('../../../packages/storybook-react/stories/extension-count/character-limit').default
        return <ComponentStory/>
      }}
    </BrowserOnly>
  );
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <StoryExample story={story} source={source} />;
};

export default ExampleComponent;
  