/**
 * @module
 *
 * A formatter for code which can be consumed via
 * `@remirror/extension-code-block/formatter`.
 */

import type { BuiltInParserName, CursorOptions, CursorResult } from 'prettier';
import babelPlugin from 'prettier/parser-babel';
import graphqlPlugin from 'prettier/parser-graphql';
import htmlPlugin from 'prettier/parser-html';
import markdownPlugin from 'prettier/parser-markdown';
import cssPlugin from 'prettier/parser-postcss';
import typescriptPlugin from 'prettier/parser-typescript';
import yamlPlugin from 'prettier/parser-yaml';
import { formatWithCursor } from 'prettier/standalone';

import type { FormattedContent, FormatterProps } from './code-block-types';

// TODO load this asynchronously
const plugins = [
  babelPlugin,
  htmlPlugin,
  typescriptPlugin,
  markdownPlugin,
  graphqlPlugin,
  cssPlugin,
  yamlPlugin,
];
const options: Partial<CursorOptions> = {
  bracketSpacing: true,
  arrowParens: 'always',
  jsxSingleQuote: true,
  singleQuote: true,
  semi: true,
};

interface FormatCodeProps {
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
function formatCode({ parser, source, cursorOffset }: FormatCodeProps) {
  return formatWithCursor(source, {
    ...options,
    cursorOffset,
    plugins,
    parser,
  });
}

/**
 * A hacky workaround the jumping cursorOffset when text is replaced.
 */
function offsetIncrement(
  source: string,
  initialCursor: number,
  formatted: string,
  endCursor: number,
  replacementPairs: Array<[string, string]>,
): 0 | 1 {
  const beforeCursorSource = source.slice(initialCursor - 1, initialCursor);
  const afterCursorFormatted = formatted.slice(endCursor, endCursor + 1);

  for (const [invalid, replacement] of replacementPairs) {
    if (beforeCursorSource === invalid && afterCursorFormatted === replacement) {
      return 1;
    }
  }

  return 0;
}

/**
 * A prettier based code formatter which can be dropped in for use within the
 * `CodeBlockExtension`.
 */
export function formatter(props: FormatterProps): FormattedContent | undefined {
  const { cursorOffset, language, source } = props;

  const fn = (
    result: CursorResult,
    pairs: Array<[string, string]> = [
      ['"', "'"],
      ["'", '"'],
    ],
  ) => {
    const increment = offsetIncrement(
      source,
      cursorOffset,
      result.formatted,
      result.cursorOffset,
      pairs,
    );
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
      case 'js':
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
}
