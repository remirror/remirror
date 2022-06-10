import { build, BuildOptions } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

import { logger } from '../logger';

export async function runEsbuild(options: Pick<BuildOptions, 'entryPoints' | 'outdir'>) {
  const result = await build({
    plugins: [nodeExternalsPlugin()],
    splitting: true,
    entryPoints: options.entryPoints,
    outdir: options.outdir,
    bundle: true,
    format: 'esm',
    sourcemap: true,
    keepNames: true,
  });

  if (result.errors && result.errors.length > 0) {
    logger.error('failed to build package with esbuild:', result.errors);
  }
}
