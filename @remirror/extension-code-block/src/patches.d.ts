declare module 'react-syntax-highlighter/dist/cjs/prism-light' {
  import * as React from 'react';
  import { SyntaxHighlighterProps } from 'react-syntax-highlighter';

  export default class SyntaxHighlighter extends React.Component<SyntaxHighlighterProps> {
    public static registerLanguage(name: string, func: any): void;
  }
}
