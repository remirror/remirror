import CodeBlock from '@theme/CodeBlock';

import ComponentSource from '!!raw-loader!../../packages/storybook-react/stories/extension-code-block/basic.tsx';

import ComponentStory from '../../packages/storybook-react/stories/extension-code-block/basic';
import { ExampleRoot } from '../components/example-root';

const ExampleComponent = (): JSX.Element => {
  const story = <ComponentStory />;
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <ExampleRoot story={story} source={source} />;
};

export default ExampleComponent;
