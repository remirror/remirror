/**
 * @worker
 *
 * A worker for compiling code to use when rendering the component.
 *
 * **Note**: avoid importing anything that imports from `@remirror/theme` since this
 * requires the document and breaks the current worker implementation in webpack.
 */

/// <reference lib="webworker" />

import type { BabelFileResult, NodePath, PluginObj, PluginPass } from '@babel/core';
import * as Babel from '@babel/standalone';
import * as t from '@babel/types';
import registerPromiseWorker from 'promise-worker/register';
import { assert } from '@remirror/core-helpers';

import { EXTERNAL_MODULE_META, INTERNAL_MODULE_META } from './generated/meta';
import { ESM_ROOT_URL } from './playground-constants';
import type { CompileWorkerDataPayload, CompileWorkerOutput, WorkerData } from './playground-types';

/** All internal modules which should not be transformed. */
const internalModules: Set<string> = new Set([
  ...Object.keys(INTERNAL_MODULE_META),
  ...EXTERNAL_MODULE_META,
]);

interface PluginState extends Omit<PluginPass, 'opts'> {
  opts: JspmPluginOptions;
}

interface JspmPluginOptions {
  versions: Record<string, string>;
}

/**
 * Convert imports to use `https://jspm.dev/<PACKAGE>`.
 */
function jspmImportsPlugin(): PluginObj<PluginState> {
  return {
    visitor: {
      CallExpression(path, state) {
        // Only proceed when this is the built in `import` call expression.
        if (!t.isImport(path.node.callee)) {
          return;
        }

        const [source] = path.get('arguments');

        if (!isExternalSource(source)) {
          return;
        }

        const url = extractJspmUrl(source.node.value, state.opts.versions);
        source.replaceWith(t.stringLiteral(url));
      },
      ['ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration' as 'ImportDeclaration'](
        path: NodePath<t.ImportDeclaration>,
        state: PluginState,
      ) {
        const source = path.get('source');

        if (!isExternalSource(source)) {
          return;
        }

        const url = extractJspmUrl(source.node.value, state.opts.versions);
        source.replaceWith(t.stringLiteral(url));
      },
    },
  };
}

Babel.registerPlugin('jspm-imports', jspmImportsPlugin);

/**
 * Compiles the code with babel. Takes the code string from the monaco editor
 * and returns an object
 */
export function compileWithBabel(payload: CompileWorkerDataPayload): CompileWorkerOutput {
  const { code, filename, versions } = payload;
  let result: BabelFileResult | null = null;

  try {
    result = Babel.transform(code, {
      filename,

      // These presets and plugins are named inside @babel/standalone, they
      // **MUST NOT** have their `@babel/preset-` or `@babel/plugin-` prefixes
      // otherwise they WILL NOT WORK.
      presets: [
        ['react', { runtime: 'automatic' }],
        ['env', { useBuiltIns: false, targets: 'since 2017', modules: false }],
        'typescript',
      ],
      plugins: [
        // Don't transform the runtime. ['transform-runtime'],
        ['proposal-object-rest-spread'],
        // 'syntax-dynamic-import',
        'proposal-nullish-coalescing-operator',
        'proposal-optional-chaining',
        'proposal-class-properties',
        'proposal-private-methods',
        ['jspm-imports', { versions }],
      ],
    });

    if (result == null || result.code == null) {
      return {
        type: 'compile-failure',
        error: new Error('Failed to compile provided code.'),
      };
    }

    return {
      type: 'compile-success',
      code: result.code,
    };
  } catch (error) {
    return { type: 'compile-failure', error };
  }
}

/**
 * Strings which denote that this should retrieve the latest version.
 */
const latestVersion = new Set(['*', '', 'latest']);

/**
 * Extract the jspmUrl from the package name and the versions. package name from
 * a string.
 */
function extractJspmUrl(packagePath: string, versions: Record<string, string>) {
  // The first part and second part are needed to combine for a url.
  const [firstPart, ...rest] = packagePath.split('/');
  // Capture the package name for scoped and unscoped packages.
  let packageName: string;

  // Capture the subdirectory from the package path.
  let subDirectory: string;

  assert(firstPart);

  // This tests for scoped urls.
  if (firstPart.startsWith('@')) {
    const [secondPart, ...other] = rest;
    assert(secondPart);
    packageName = [firstPart, secondPart].join('/');
    subDirectory = other.join('/');
  } else {
    packageName = firstPart;
    subDirectory = rest.join('/');
  }

  const version = versions[packageName];

  if (!version || latestVersion.has(version)) {
    return `${ESM_ROOT_URL}${packagePath}`;
  }

  return `${ESM_ROOT_URL}${packageName}@${getValidVersion(version)}/${subDirectory}`;
}

/**
 * Get a valid version string for the url as defined
 * [here](https://jspm.org/#url-patterns).
 *
 * - `^1.2.1` => `1`
 * - `~1.2.1` => `1.2`
 * - `next` => `next`
 */
function getValidVersion(version: string): string {
  const [major, minor] = version.includes('.') ? version.split('.') : [];

  if (!major) {
    // Assume that this is a tag and just return as it is.
    return version;
  }

  if (version.startsWith('^')) {
    version = major;
  } else if (version.startsWith('~')) {
    version = [major, minor ?? '0'].join('.');
  }

  return version;
}

/**
 * Check that the provided source points to an external import / export (source)
 * which needs to be replaced by the `jspm.dev` url.
 */
function isExternalSource(
  source: NodePath<any> | null | undefined,
): source is NodePath<t.StringLiteral> {
  return (
    // Ensure that this is a string literal.
    !!source?.isStringLiteral() &&
    // Ignore relative or absolute paths
    !/^(\.\/|\/|https?:\/\/|file:\/\/)/.test(source.node.value) &&
    // Check that the module is is not one of the internal packages.
    !internalModules.has(source.node.value) &&
    // Check that it is not a subpath of the provided internal modules
    ![...internalModules].some((mod) => source.node.value.startsWith(`${mod}/`))
  );
}

registerPromiseWorker((data: WorkerData) => {
  if (data.type === 'compile') {
    return compileWithBabel(data);
  }

  return null;
});
