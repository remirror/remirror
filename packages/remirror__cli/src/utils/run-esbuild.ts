import { Package } from '@manypkg/get-packages';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import path from 'node:path';

import { logger } from '../logger';
import { removeFileExt } from './remove-file-ext';

// These packages are not (valid) ESM packages, and Node.js can't import them
// with ESM import syntax.
// As a workaround, we need to bundle the code from them into our own packages,
// They can be removed from this list once their maintainers fix these issues:
// https://github.com/svgmoji/svgmoji/issues/24
// https://github.com/streamich/react-use/issues/2353
const dependenciesToBundle = /(emojibase|svgmoji|react-use)/;

export async function runEsbuild(
  pkg: Package,
  { inFile, outFile, format }: { inFile: string; outFile: string; format: 'esm' | 'cjs' },
) {
  logger.debug(`running esbuild for package ${pkg.packageJson.name}: ${inFile} => ${outFile}`);

  const { base: outFileName, dir: outDir } = path.parse(outFile);
  const outFileNameWithoutExt = removeFileExt(outFileName);

  const externals = Object.keys({
    ...pkg.packageJson.dependencies,
    ...pkg.packageJson.devDependencies,
    ...pkg.packageJson.peerDependencies,
    ...pkg.packageJson.optionalDependencies,
  }).filter((name) => !dependenciesToBundle.test(name));

  const result = await build({
    plugins: [nodeExternalsPlugin()],
    splitting: format === 'cjs' ? false : true,
    entryPoints: { [outFileNameWithoutExt]: inFile },
    outdir: outDir,
    bundle: true,
    target: 'es2019',
    format: format,
    sourcemap: true,
    platform: nodePackages.has(pkg.packageJson.name) ? 'node' : 'browser',
    external: externals,
    outExtension: format === 'cjs' ? { '.js': '.cjs' } : undefined,
  });

  if (result.errors && result.errors.length > 0) {
    logger.error('failed to build package with esbuild:', result.errors);
  }
}

// TODO: don't use an array like this.
const nodePackages = new Set([
  'jest-remirror',
  'testing',

  // Runtime `process.env.NODE_ENV` is needed in the following two packages.
  '@remirror/core-utils',
  '@remirror/core-helpers',
]);
