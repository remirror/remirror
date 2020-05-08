/** @jsx jsx */

import { jsx } from '@emotion/core';
// @ts-expect-error
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';

import {} from '@remirror/core';

import { CodeBlockAttributes, CodeBlockExtensionSettings } from './code-block-types';
import { getLanguage } from './code-block-utils';

/**
 * Renders the codeBlock for use in an SSR Environment
 */
export const CodeBlockComponent = ({
  settings: options,
  node,
}: SSRComponentProps<Required<CodeBlockExtensionSettings>, CodeBlockAttributes>) => {
  const { language: lang } = node.attrs;
  const language = getLanguage({
    language: lang,
    fallback: options.defaultLanguage,
    supportedLanguages: options.supportedLanguages,
  });

  return (
    <SyntaxHighlighter
      language={language}
      // The following is the only way to remove inline styles
      customStyle={{ backgroundColor: null }}
      className={`language-${language}`}
    >
      {node.textContent}
    </SyntaxHighlighter>
  );
};
