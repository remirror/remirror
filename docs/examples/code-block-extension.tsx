import CodeBlock from '@theme/CodeBlock';

import ComponentSource from '!!raw-loader!../../packages/storybook-react/stories/extension-code-block/basic.tsx';

import ComponentStory from '../../packages/storybook-react/stories/extension-code-block/basic';
import { Example } from '../components/example';

const ExampleComponent = (): JSX.Element => {
  const story = <ComponentStory />;
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <Example url='aaa' story={story} source={source} />;
};

export default ExampleComponent;
