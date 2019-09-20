import { SSRComponentProps } from '@remirror/core';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';
import { CodeBlockAttrs, CodeBlockExtensionOptions } from './code-block-types';
import { getLanguage } from './code-block-utils';

/**
 * Renders the codeBlock for use in an SSR Environment
 */
export const CodeBlockComponent = ({
  options,
  node,
}: SSRComponentProps<Required<CodeBlockExtensionOptions>, CodeBlockAttrs>) => {
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
