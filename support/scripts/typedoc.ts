/**
 * @script
 *
 * Run typedoc for building the api docs.
 */

import { getPackages } from '@manypkg/get-packages';
import { join } from 'path';
import { PackageJson } from 'type-fest';
import { Application } from 'typedoc';

import { baseDir, log } from './helpers';

/**
 * Get the input files.
 */
async function getEntryPoints() {
  const inputFiles = await getPackages(baseDir());
  return inputFiles.packages
    .filter((pkg) => !!(pkg.packageJson as PackageJson).types && !pkg.packageJson.private)
    .map((pkg) => join(pkg.dir, 'src'));
}

async function createApplication() {
  const entryPoints = await getEntryPoints();

  const app = new Application();
  app.bootstrap({
    tsconfig: baseDir('tsconfig.json'),
    plugin: ['typedoc-plugin-markdown'],
    theme: require.resolve('docusaurus-plugin-typedoc/dist/theme'),
    entryPoints,

    // output directory relative to docs directory - use '' for docs root
    // (defaults to 'api').
    out: 'api',

    // Skip updating of sidebars.json (defaults to false).
    readme: baseDir('docs/api.md'),
    name: 'remirror',
    excludePrivate: true,
    excludeExternals: true,
    logger: 'console',

    // moduleResolution: ts.ModuleResolutionKind.NodeJs,
    exclude: [
      '**/__tests__',
      '**/__dts__',
      '**/__mocks__',
      '**/__fixtures__',
      '*.{test,spec}.{ts,tsx}',
      '**/*.d.ts',
      '*.d.ts',
    ],
  });

  const project = app.convert();

  if (project) {
    app.generateDocs(project, baseDir('docs', 'api'));
  }

  return app;
}

async function main() {
  await createApplication();
}

main().catch((error) => {
  log.fatal(`Something went wrong:`, error);
});
