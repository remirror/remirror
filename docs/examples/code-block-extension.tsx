import CodeBlock from '@theme/CodeBlock';

import ComponentSource from '!!raw-loader!../../packages/storybook-react/stories/extension-code-block/basic.stories';

import ComponentStory from '../../packages/storybook-react/stories/extension-code-block/basic.stories';

const ExampleComponent = (): JSX.Element => {
  return (
    <div>
      <div> EXAMPLE </div>
      <ComponentStory.component />
      <div> hello 3 </div>

      <CodeBlock className='language-jsx' title='/src/myComponent'>
        {ComponentSource}
      </CodeBlock>
    </div>
  );
};

export default ExampleComponent;
