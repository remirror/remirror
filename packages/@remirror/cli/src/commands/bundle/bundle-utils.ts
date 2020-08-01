import fs from 'fs';
import escape from 'jsesc';
import os from 'os';
import Bundler, { ParcelOptions } from 'parcel-bundler';
import path from 'path';
import rimraf from 'rimraf';
import util from 'util';

import { bool, uniqueId } from '@remirror/core-helpers';

import type { BundleCommandShape, BundleMethodReturn } from './bundle-types';

const REMIRROR_ID = '__remirror';

/**
 * Create the file which exports a function to be injected into the webview.
 */
const createFile = (withAnnotation = false) => (script: string) => `export const createHTML = ${
  withAnnotation ? '(html: string)' : 'html'
} => \`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>This is the webview</title>
  </head>
  <body>
    <div id="${REMIRROR_ID}">\${html}</div>
  </body>
<script>
  ${escape(script, { quotes: 'backtick', isScriptContext: true })}
</script>
</html>\`;
`;

const createTSFile = createFile(true);

const createJSFile = createFile();

/**
 * Remove all files in the provided path or glob pattern.
 */
function clearPath(glob: string) {
  return new Promise((resolve) => rimraf(glob, () => resolve()));
}

/**
 * Uses parcel-bundler to bundle the target file.
 */
export function bundleEntryPoint({ source, cwd }: BundleCommandShape): BundleMethodReturn {
  const readFile = util.promisify(fs.readFile);
  const writeFile = util.promisify(fs.writeFile);

  // Paths
  const entryFile = path.join(cwd, source);
  const tempDir = path.join(os.tmpdir(), uniqueId());
  const tempFileName = 'remirror-webview.js';
  const tempFilePath = path.join(tempDir, tempFileName);
  const outDir = cwd;
  const isTs = bool(source.match(/\.tsx?$/));
  const outFilePath = path.join(outDir, isTs ? 'file.ts' : 'file.js');

  // Parcel config
  const options: ParcelOptions = {
    outDir: tempDir,
    outFile: tempFileName,
    sourceMaps: false,
    minify: true,
    watch: false,
    logLevel: 1,
  };

  const parcel = new Bundler(entryFile, options);

  return {
    bundle: async () => {
      // Create the bundle
      await parcel.bundle();
    },
    write: async () => {
      // Read the bundle and insert it into script template
      const script = await readFile(tempFilePath, 'utf-8');
      const finalOutput = isTs ? createTSFile(script) : createJSFile(script);
      await writeFile(outFilePath, finalOutput, 'utf-8');
    },
    clean: async () => {
      // Remove junk
      await clearPath(`${tempDir}/*`);
    },
  };
}
