/**
 * @module
 *
 * A formatter for code which can be used with `@remirror/extension-code-block`
 */

import { CodeBlockFormatter } from '@remirror/extension-code-block';
import { BuiltInParserName, CursorOptions, CursorResult } from 'prettier';
import babelPlugin from 'prettier/parser-babylon';
import htmlPlugin from 'prettier/parser-html';
import markdownPlugin from 'prettier/parser-markdown';
import typescriptPlugin from 'prettier/parser-typescript';
import { formatWithCursor } from 'prettier/standalone';

const plugins = [babelPlugin, htmlPlugin, typescriptPlugin, markdownPlugin];
const options: Partial<CursorOptions> = {
  bracketSpacing: true,
  arrowParens: 'always',
  jsxSingleQuote: true,
  singleQuote: true,
  semi: true,
};

interface FormatCodeParams {
  /**
   * The initial code.
   */
  source: string;

  /**
   * Where the cursor is within the text content.
   */
  cursorOffset: number;

  /**
   * The prettier parser to use
   */
  parser: BuiltInParserName;
}

/**
 * Wrapper around the prettier formatWithCursor.
 */
const formatCode = ({ parser, source, cursorOffset }: FormatCodeParams) => {
  return formatWithCursor(source, {
    ...options,
    cursorOffset,
    plugins,
    parser,
  });
};

/**
 * A hacky workaround the jumping cursorOffset when text is replaced.
 */
const offsetIncrement = (
  source: string,
  initialCursor: number,
  formatted: string,
  endCursor: number,
  replacementPairs: [string, string][],
): 0 | 1 => {
  const beforeCursorSource = source.substr(initialCursor - 1, 1);
  const afterCursorFormatted = formatted.substr(endCursor, 1);

  for (const [invalid, replacement] of replacementPairs) {
    if (beforeCursorSource === invalid && afterCursorFormatted === replacement) {
      return 1;
    }
  }
  return 0;
};

/**
 * A prettier based code formatter which can be dropped in for use within the CodeBlockExtension
 */
export const formatter: CodeBlockFormatter = ({ cursorOffset, language, source }) => {
  const fn = (result: CursorResult, pairs: [string, string][] = [['"', "'"], ["'", '"']]) => {
    const increment = offsetIncrement(source, cursorOffset, result.formatted, result.cursorOffset, pairs);
    return { ...result, cursorOffset: result.cursorOffset + increment };
  };

  try {
    switch (language) {
      case 'typescript':
      case 'ts':
      case 'tsx':
        return fn(formatCode({ source, cursorOffset, parser: 'typescript' }));
      case 'javascript':
      case 'jsx':
        return fn(formatCode({ source, cursorOffset, parser: 'babel-flow' }));
      case 'markdown':
      case 'md':
        return fn(formatCode({ source, cursorOffset, parser: 'markdown' }));
      case 'mdx':
        return fn(formatCode({ source, cursorOffset, parser: 'mdx' }));
      case 'yml':
      case 'yaml':
        return fn(formatCode({ source, cursorOffset, parser: 'yaml' }));
      case 'html':
        return fn(formatCode({ source, cursorOffset, parser: 'html' }));
      case 'css':
        return fn(formatCode({ source, cursorOffset, parser: 'css' }));
      case 'less':
        return fn(formatCode({ source, cursorOffset, parser: 'less' }));
      case 'json':
        return fn(formatCode({ source, cursorOffset, parser: 'json' }));
      case 'json5':
        return fn(formatCode({ source, cursorOffset, parser: 'json5' }));
      default:
        return;
    }
  } catch {
    return;
  }
};
