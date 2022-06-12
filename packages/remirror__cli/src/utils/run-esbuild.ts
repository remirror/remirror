import { Package } from '@manypkg/get-packages';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import path from 'node:path';

import { logger } from '../logger';
import { removeFileExt } from './remove-file-ext';

export async function runEsbuild(pkg: Package, options: { inFile: string; outFile: string }) {
  logger.debug(
    `running esbuild for package ${pkg.packageJson.name}: ${options.inFile} => ${options.outFile}`,
  );

  const { base: outFileName, dir: outDir } = path.parse(options.outFile);
  const outFileNameWithoutExt = removeFileExt(outFileName);

  const externals = Object.keys({
    ...pkg.packageJson.dependencies,
    ...pkg.packageJson.devDependencies,
    ...pkg.packageJson.peerDependencies,
    ...pkg.packageJson.optionalDependencies,
  });

  const result = await build({
    plugins: [nodeExternalsPlugin()],
    splitting: true,
    entryPoints: { [outFileNameWithoutExt]: options.inFile },
    outdir: outDir,
    bundle: true,
    format: 'esm',
    sourcemap: true,
    platform: nodePackages.has(pkg.packageJson.name) ? 'node' : 'browser',
    keepNames: true,
    external: externals,
  });

  if (result.errors && result.errors.length > 0) {
    logger.error('failed to build package with esbuild:', result.errors);
  }
}

// TODO: don't use an array like this.
const nodePackages = new Set(['jest-remirror']);
