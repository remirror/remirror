import CodeBlock from '@theme/CodeBlock';

import MyComponentSource from '!!raw-loader!../../packages/storybook-react/stories/extension-code-block/code-block.stories.tsx';

import { Basic } from '../../packages/storybook-react/stories/extension-code-block/code-block.stories.tsx';

const CodeBlockExample = (): JSX.Element => {
  return (
    <div>
      <div> DEMO </div>
      <Basic />
      <div> hello 3 </div>

      <CodeBlock className='language-jsx' title='/src/myComponent'>
        {MyComponentSource}
      </CodeBlock>
    </div>
  );
};

export default CodeBlockExample;
