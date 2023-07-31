/**
 * THIS FILE IS AUTO GENERATED!
 *
 * Run `pnpm -w generate:website-examples` to regenerate this file.
 */

// @ts-nocheck

import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ComponentSource from '!!raw-loader!../../../packages/storybook-react/stories/i18n/format-js-imperative.tsx';

import { StoryExample } from '../../src/components/story-example-component';

const ExampleComponent = (): JSX.Element => {
  const story = (
    <BrowserOnly>
      {() => {
        const ComponentStory = require('../../../packages/storybook-react/stories/i18n/format-js-imperative').default
        return <ComponentStory/>
      }}
    </BrowserOnly>
  );
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <StoryExample story={story} source={source} />;
};

export default ExampleComponent;
