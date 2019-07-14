import React, { FC } from 'react';

import { SSRComponentProps } from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/react-utils';
// @ts-ignore
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';
import { CodeBlockAttrs, CodeBlockExtensionOptions } from './code-block-types';
import { getLanguage } from './code-block-utils';

export interface CodeBlockComponentProps extends NodeViewComponentProps<CodeBlockAttrs> {}

export const CodeBlockComponent: FC<SSRComponentProps<CodeBlockAttrs, CodeBlockExtensionOptions>> = ({
  language: lang,
  children,
  options,
}) => {
  const language = getLanguage({
    language: lang,
    fallback: options.defaultLanguage,
    supportedLanguages: options.supportedLanguages,
  });

  return (
    <SyntaxHighlighter
      language={language}
      // Needed to remove inline styles
      customStyle={{ backgroundColor: null }}
      className={`language-${language}`}
    >
      {children}
    </SyntaxHighlighter>
  );
};
