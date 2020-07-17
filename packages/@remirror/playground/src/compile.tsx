import type * as BabelType from '@babel/standalone';
import * as t from '@babel/types'; // DO NOT IMPORT FROM @babel/core!

// DO NOT import @babel/core except in type positions
type NodePath<T = t.Node> = import('@babel/core').NodePath<T>;
type BabelFileResult = import('@babel/core').BabelFileResult;

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

          // For debugging:
          t.addComment(args[0], 'trailing', 'Importing');
        }
      },
    },
  };
}

Babel.registerPlugin('playgroundImports', playgroundImports);

export function compile(
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
    result = Babel.transform(code, {
      filename: 'usercode.tsx',

      /*
       * These presets and plugins are named inside @babel/standalone, they
       * **MUST NOT** have their `@babel/preset-` or `@babel/plugin-` prefixes
       * otherwise they WILL NOT WORK.
       */
      presets: ['react', ['env', { useBuiltIns: false, targets: 'since 2017' }], 'typescript'],
      plugins: [
        ['transform-runtime'],
        ['proposal-object-rest-spread'],
        // 'syntax-dynamic-import',
        'proposal-nullish-coalescing-operator',
        'proposal-optional-chaining',
        'playgroundImports',
        'proposal-class-properties',
        'proposal-private-methods',
      ],
    });
  } catch (error_) {
    error = error_;
  }
  return {
    requires: [...requires],
    code: result?.code ? String(result.code) : null,
    error,
  };
}

declare global {
  const Babel: typeof BabelType;
}
