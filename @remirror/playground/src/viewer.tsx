import { BabelFileResult } from '@babel/core';
import { registerPlugin, transform } from '@babel/standalone';
import * as t from '@babel/types'; // DO NOT IMPORT FROM @babel/core!
import React, { FC, useMemo } from 'react';

import { CodeOptions } from './interfaces';

// DO NOT import @babel/core except in type positions
type NodePath<T = t.Node> = import('@babel/core').NodePath<T>;

export interface ViewerProps {
  options: CodeOptions;
  code: string;
}

let requires: string[] = [];
function playgroundImports() {
  return {
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        const { callee, arguments: args } = path.node;
        if (
          callee.type === 'Identifier' &&
          callee.name === 'require' &&
          args.length === 1 &&
          args[0].type === 'StringLiteral'
        ) {
          requires.push(args[0].value);
          t.addComment(args[0], 'trailing', 'Importing');
        }
      },
    },
  };
}

registerPlugin('playgroundImports', playgroundImports);

function compile(
  code: string,
): {
  requires: string[];
  code: string | null;
  error: Error | null;
} {
  // reset requires
  requires = [];
  let error: Error | null = null;
  let result: BabelFileResult | null = null;
  try {
    result = transform(code, {
      /*
       * These presets and plugins are named inside @babel/standalone, they
       * **MUST NOT** have their `@babel/preset-` or `@babel/plugin-` prefixes
       * otherwise they WILL NOT WORK.
       */
      presets: ['react', 'env'],
      plugins: [
        ['transform-runtime'],
        ['proposal-object-rest-spread'],
        'syntax-dynamic-import',
        'proposal-nullish-coalescing-operator',
        'proposal-optional-chaining',
        'playgroundImports',
      ],
    });
  } catch (e) {
    error = e;
  }
  return {
    requires: [...requires],
    code: result?.code ? String(result.code) : null,
    error,
  };
}

export const Viewer: FC<ViewerProps> = props => {
  const { code } = props;
  const result = useMemo(() => compile(code), [code]);

  const { code: compiledCode, error, requires } = result;

  return (
    <div style={{ flex: '1 0 0', overflow: 'auto' }}>
      {typeof compiledCode === 'string' ? (
        <pre>
          <code>
            {requires.join('\n')}
            {'\n\n\n'}
            {compiledCode}
          </code>
        </pre>
      ) : (
        <div>
          <h1>Error occurred compiling code</h1>
          <pre>
            <code>{String(error ?? 'Unknown error')}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
