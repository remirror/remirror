/**
 * THIS FILE IS AUTO GENERATED
 *
 * Run `pnpm -w generate:website-examples` to regenerate this file.
 */

// @ts-nocheck

import CodeBlock from '@theme/CodeBlock';
import ComponentSource from '!!raw-loader!../../../packages/storybook-react/stories/extension-code-block/with-incorrect-language.tsx';

import ComponentStory from '../../../packages/storybook-react/stories/extension-code-block/with-incorrect-language';
import { ExampleRoot } from '../../components/example-root';

const ExampleComponent = (): JSX.Element => {
  const story = <ComponentStory />;
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <ExampleRoot story={story} source={source} />;
};

export default ExampleComponent;
  