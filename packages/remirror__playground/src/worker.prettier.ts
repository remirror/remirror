/**
 * @worker
 *
 * A worker for prettifying the provided file.
 */

/// <reference lib="webworker" />

import type { Options } from 'prettier';
import registerPromiseWorker from 'promise-worker/register';

import type { PrettierWorkerOutput, PrettierWorkerPayload, WorkerData } from './playground-types';
import { getFileLanguage } from './playground-utils';

/**
 * Prettify the code via a worker.
 */
async function prettifyCode({ path, source }: PrettierWorkerPayload): Promise<string> {
  const language = getFileLanguage(path);

  let parser: Options['parser'];
  let plugins: Options['plugins'];

  switch (language) {
    case 'javascript':
      parser = 'babel';
      plugins = [await import('prettier/parser-babel')];
      break;

    case 'css':
      parser = 'css';
      plugins = [await import('prettier/parser-postcss')];
      break;

    case 'typescript':
      parser = 'babel-ts';
      plugins = [await import('prettier/parser-babel')];
      break;

    case 'markdown':
      parser = 'markdown';
      plugins = await Promise.all([
        import('prettier/parser-babel'),
        import('prettier/parser-markdown'),
      ]);
      break;

    default:
      break;
  }

  if (parser && plugins) {
    const prettier = await import('prettier/standalone');

    return prettier.format(source, {
      parser,
      plugins,
      bracketSpacing: true,
      endOfLine: 'lf',
      jsxBracketSameLine: false,
      jsxSingleQuote: true,
      printWidth: 80,
      proseWrap: 'never',
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
      useTabs: false,
    });
  }

  return source;
}

// Register the worker so it can resolve a value using `promise-worker`.
registerPromiseWorker(async (data: WorkerData): Promise<PrettierWorkerOutput | null> => {
  if (data.type === 'prettier') {
    const payload = await prettifyCode(data);

    return { type: 'prettier-success', code: payload };
  }

  return null;
});
