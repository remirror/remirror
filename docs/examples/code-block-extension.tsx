import CodeBlock from '@theme/CodeBlock';

import MyComponentSource from '!!raw-loader!../../packages/storybook-react/stories/extension-code-block/code-block.stories';

import { Basic } from '../../packages/storybook-react/stories/extension-code-block/code-block.stories';

const ExampleComponent = (): JSX.Element => {
  return (
    <div>
      <div> EXAMPLE </div>
      <Basic />
      <div> hello 3 </div>

      <CodeBlock className='language-jsx' title='/src/myComponent'>
        {MyComponentSource}
      </CodeBlock>
    </div>
  );
};

export default ExampleComponent;
