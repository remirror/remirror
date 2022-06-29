import { usePluginData } from '@docusaurus/useGlobalData';
import { BaseProps, ExamplesPluginData } from 'docusaurus-plugin-examples/types';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import { Tab, TabList, TabPanel, useTabState } from 'reakit/Tab';

import { useExample } from './example-provider';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markup', markup);

/**
 * This is the language map
 */
const languageMap = {
  '.jsx': 'jsx',
  '.js': 'jsx',
  '.ts': 'tsx',
  '.tsx': 'tsx',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.json': 'json',
};

export const ExampleSource = (props: SourceProps) => {
  const { name } = props;
  const files = useExamplesPluginData({ name });
  const tabState = useTabState();

  return (
    <div>
      <TabList {...tabState} aria-label={`Example Source Code: ${name}`}>
        {files.map((file) => (
          <Tab {...tabState} key={file.name}>
            {file.name}
          </Tab>
        ))}
      </TabList>
      {files.map((file) => (
        <TabPanel {...tabState} key={file.name}>
          <SyntaxHighlighter language={languageMap[file.extension]} showLineNumbers>
            {file.content}
          </SyntaxHighlighter>
        </TabPanel>
      ))}
    </div>
  );
};

function useExamplesPluginData(props: BaseProps) {
  const { name } = props;
  const { language } = useExample();
  const pluginData = usePluginData('docusaurus-plugin-examples') as ExamplesPluginData;

  return pluginData[name]?.[language] ?? [];
}

interface SourceProps extends BaseProps {}
