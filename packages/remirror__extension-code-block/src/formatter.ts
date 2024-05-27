/**
 * @module
 *
 * A formatter for code which can be consumed via
 * `@remirror/extension-code-block/formatter`.
 */

import type { BuiltInParserName, CursorOptions, CursorResult } from 'prettier';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import graphqlPlugin from 'prettier/plugins/graphql';
import htmlPlugin from 'prettier/plugins/html';
import markdownPlugin from 'prettier/plugins/markdown';
import postcssPlugin from 'prettier/plugins/postcss';
import typescriptPlugin from 'prettier/plugins/typescript';
import yamlPlugin from 'prettier/plugins/yaml';
import { formatWithCursor } from 'prettier/standalone';

import type { FormattedContent, FormatterProps } from './code-block-types';

// TODO load this asynchronously
const plugins = [
  babelPlugin,
  estreePlugin,
  htmlPlugin,
  typescriptPlugin,
  markdownPlugin,
  graphqlPlugin,
  postcssPlugin,
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
export async function formatter(props: FormatterProps): Promise<FormattedContent | undefined> {
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

  let parser: BuiltInParserName;

  switch (language) {
    case 'typescript':
    case 'ts':
    case 'tsx':
      parser = 'typescript';
      break;
    case 'javascript':
    case 'jsx':
    case 'js':
      parser = 'babel-flow';
      break;
    case 'markdown':
    case 'md':
      parser = 'markdown';
      break;
    case 'mdx':
      parser = 'mdx';
      break;
    case 'yml':
    case 'yaml':
      parser = 'yaml';
      break;
    case 'html':
      parser = 'html';
      break;
    case 'css':
      parser = 'css';
      break;
    case 'less':
      parser = 'less';
      break;
    case 'json':
      parser = 'json';
      break;
    case 'json5':
      parser = 'json5';
      break;
    default:
      return;
  }

  try {
    const formatResult = await formatCode({ source, cursorOffset, parser });
    return fn(formatResult);
  } catch {
    return;
  }
}
