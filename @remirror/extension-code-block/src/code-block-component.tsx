import React from 'react';

import { NodeViewComponentProps } from '@remirror/react';
import SyntaxHighlighter from 'react-syntax-highlighter/prism-light';
import { CodeBlockAttrs } from './code-block-types';

export const CodeBlockComponent = ({ language, node }: NodeViewComponentProps<CodeBlockAttrs>) => {
  return <SyntaxHighlighter language={language}>{node.content}</SyntaxHighlighter>;
};
