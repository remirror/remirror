import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import gh from 'react-syntax-highlighter/dist/esm/styles/prism/ghcolors';
import { Tab, TabList, TabPanel, useTabState } from 'reakit/Tab';
import { usePluginData } from '@docusaurus/useGlobalData';
import useTheme from '@theme/hooks/useTheme';
import { useExample } from './example-provider';
import { BaseProps, ExamplesPluginData } from '../types';

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
  const { isDarkTheme } = useTheme();
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
          <SyntaxHighlighter
            language={languageMap[file.extension]}
            style={isDarkTheme ? dracula : gh}
          >
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
  const pluginData = usePluginData<ExamplesPluginData>('docusaurus-plugin-examples');

  return pluginData[name]?.[language] ?? [];
}

interface SourceProps extends BaseProps {}
