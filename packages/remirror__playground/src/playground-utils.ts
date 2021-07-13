import { parse, ParserPlugin } from '@babel/parser';
import babelTraverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import PromiseWorker from 'promise-worker';
import type { PackageJson } from '@remirror/core';
import { findMatches } from '@remirror/core-helpers';

import { DATA_ROOT_URL, GLOBAL_INTERNAL_MODULES, NPM_ROOT_URL } from './playground-constants';
import type { EntryFile, Language } from './playground-types';

/**
 * Grab any import/requires from inside the code and make a list of its
 * dependencies.
 *
 * @param sourceCode - the source of the definition file.
 *
 * @returns all unique matches found.
 */
export function parseFileForModuleReferences(sourceCode: string): string[] {
  // Track all the unique modules found so far.
  const foundModules = new Set<string>();

  // Regex used to test for a `require` module reference -
  // https://regex101.com/r/Jxa3KX/4
  const requirePattern = /(const|let|var)(.|\n)*? require\(('|")(.*)('|")\);?$/gm;

  // Regex used to test for `imports` module reference -
  // https://regex101.com/r/hdEpzO/4
  const es6Pattern =
    /(import|export)((?!from)(?!require)(.|\n))*?(from|require\()\s?('|")(.*)('|")\)?;?$/gm;

  // Regex used to test for only es6 imports - https://regex101.com/r/hdEpzO/6
  const es6ImportOnly = /import\s?('|")(.*)('|")\)?;?/gm;

  // Find all matches and add to the set.
  findMatches(sourceCode, es6Pattern).forEach((match) => match[6] && foundModules.add(match[6]));
  findMatches(sourceCode, requirePattern).forEach(
    (match) => match[5] && foundModules.add(match[5]),
  );
  findMatches(sourceCode, es6ImportOnly).forEach((match) => match[2] && foundModules.add(match[2]));

  return [...foundModules];
}

/**
 * Returns true if the name provided is an `Extension`.
 */
export function isExtensionName(exportName: string): boolean {
  return exportName.endsWith('Extension') && /^[A-Z]/.test(exportName);
}

/**
 * Returns true if the name provided is a `Preset`
 */
export function isPresetName(exportName: string): boolean {
  return exportName.endsWith('Preset') && /^[A-Z]/.test(exportName);
}

/**
 * Use https://skypack.dev to load the type definitions for a package.
 */
export async function loadTypeDefinition(packageName: string): Promise<string | undefined> {
  const response = await fetch(`https://cdn.skypack.dev/${packageName}/mode=types/src/index.d.ts`);
  return response.text();
}

/**
 * Get the package json of a given npm package.
 */
export async function getPackageJson(packageName: string, version?: string): Promise<PackageJson> {
  const response = await fetch(
    `${NPM_ROOT_URL}${packageName}${version ? `@${version}` : ''}/package.json`,
  );

  return response.json();
}

/**
 * Resolve the version of the provided package based.
 */
export async function resolveVersion(
  packageName: string,
  version?: string,
): Promise<string | undefined> {
  const response = await fetch(
    `${DATA_ROOT_URL}resolve/npm/${packageName}${version ? `@${version}` : ''}`,
  );
  const json = await response.json();

  return json.version ?? undefined;
}

/**
 * Get the language from a provided file.
 */
export function getFileLanguage(path: string): Language | undefined {
  if (path.includes('.')) {
    switch (path.split('.').pop()) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return;
    }
  }

  return;
}

/**
 * Download the playground files as a zip file.
 */
export async function downloadZipBundle(
  files: EntryFile[],
  bundleName = 'remirror-playground.zip',
) {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import('jszip'),
    import('file-saver'),
  ]);
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, bundleName);
}

export class TypedPromiseWorker<Output, Input> extends PromiseWorker {
  /**
   * Send the data to the worker and receive the response back.
   */
  async send(input: Input): Promise<Output> {
    return super.postMessage<Output, Input>(input);
  }
}

const parserPlugins: ParserPlugin[] = [
  'asyncGenerators',
  'bigInt',
  'classPrivateMethods',
  'classPrivateProperties',
  'classProperties',
  'classStaticBlock',
  'decimal',
  'decorators-legacy',
  'doExpressions',
  'dynamicImport',
  'exportDefaultFrom',
  'functionBind',
  'functionSent',
  'importMeta',
  'jsx',
  'logicalAssignment',
  'importAssertions',
  'moduleStringNames',
  'nullishCoalescingOperator',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'optionalChaining',
  'partialApplication',
  'placeholders',
  'privateIn',
  'throwExpressions',
  'topLevelAwait',
  'typescript',
];
/**
 * Get `import` and `require` statements from the code.
 */
export function getImportStatements(title: string, code: string) {
  const importStatements: string[] = [];
  const ast = parse(code, {
    sourceFilename: title,
    sourceType: 'module',
    plugins: parserPlugins,
  });

  babelTraverse(ast, {
    CallExpression(path) {
      // Handle `require` statements.
      if (
        t.isIdentifier(path.node.callee) &&
        path.node.callee.name === 'require' &&
        path.node.arguments.length === 1 &&
        t.isStringLiteral(path.node.arguments)
      ) {
        importStatements.push(path.node.arguments.value);
      }

      // Handle dynamic `import()` statements.
      if (t.isImport(path.node.callee)) {
        const [source] = path.get('arguments');

        if (source?.isStringLiteral()) {
          importStatements.push(source.node.value);
        }
      }
    },
    ['ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration' as 'ImportDeclaration'](
      path: NodePath<t.ImportDeclaration>,
    ) {
      const source = path.get('source');

      if (source?.isStringLiteral()) {
        importStatements.push(source.node.value);
      }
    },
  });

  return importStatements;
}

declare global {
  interface Window {
    [GLOBAL_INTERNAL_MODULES]: Record<string, any>;
  }
}
