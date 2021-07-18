/// <reference types="@docusaurus/theme-classic" />

import useBaseUrl from '@docusaurus/useBaseUrl';
import { usePluginData } from '@docusaurus/useGlobalData';
import useTheme from '@theme/hooks/useTheme';
import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import gh from 'react-syntax-highlighter/dist/esm/styles/prism/ghcolors';
import { Tab, TabList, TabPanel, useTabState } from 'reakit/Tab';

import { BaseProps, ExamplesPluginData } from './types';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markup', markup);

export interface ExampleProps extends BaseProps {
  /**
   * Set to true to hide the source code.
   *
   * @default false
   */
  hideSource?: boolean;

  /**
   * Set to false to hide the code sandbox edit link.
   *
   * @default true
   */
  hideSandbox?: boolean;

  /**
   * Set to `false` to hide the code in the playground.
   *
   * @default false
   */
  hidePlayground?: boolean;
}

export const Example = (props: ExampleProps) => {
  const { name, hideSource, language } = props;

  return (
    <div>
      <strong>HELLO</strong> Example
      <br />
      {name}
      <IFrame name={name} />
      {!hideSource && <Source name={name} language={language} />}
    </div>
  );
};

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

const Source = (props: SourceProps) => {
  const { name, language = 'ts' } = props;
  const { isDarkTheme } = useTheme();
  const files = useExamplesPluginData({ name, language });
  const tabState = useTabState();

  return (
    <div>
      <TabList {...tabState} aria-label={`Example Source Code: ${name}`}>
        {files.map((file) => (
          <Tab {...tabState}>{file.name}</Tab>
        ))}
      </TabList>
      {files.map((file) => (
        <TabPanel {...tabState}>
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
  const { name, language = 'ts' } = props;
  const pluginData = usePluginData<ExamplesPluginData>('docusaurus-plugin-examples');

  return pluginData[name]?.[language] ?? [];
}

interface SourceProps extends BaseProps {}

interface IFrameProps extends Pick<BaseProps, 'name'> {}

const IFrame = (props: IFrameProps) => {
  const { name } = props;
  const { loading, onLoad } = useIFrameLoading();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const src = useBaseUrl(`/examples/${name}`);

  return (
    <div ref={ref}>
      {loading && <p>Loading...</p>}
      {inView && <iframe src={src} width='100%' height='0' frameBorder='0' onLoad={onLoad} />}
    </div>
  );
};

function useIFrameLoading() {
  const [loading, setLoading] = useState(true);

  return useMemo(() => ({ loading, onLoad: () => setLoading(false) }), [loading]);
}

export default Example;
