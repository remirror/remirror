// import * as babel from '@babel/core';
import { Package } from '@manypkg/get-packages';
import glob from 'fast-glob';
import { findUp } from 'find-up';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sortKeys from 'sort-keys';
import { build as tsupBuild } from 'tsup';

import { logger } from '../logger';
import { colors } from './colors';
import { ensureCjsFilename, ensureDtsFilename } from './ensure-cjs-filename';
import { EntryPoint } from './entry-point';
import { fileExists } from './file-exists';
import { getRoot } from './get-root';
import { removeFileExt } from './remove-file-ext';
import { runCustomScript } from './run-custom-script';
import { slugify } from './slugify';
import { writePackageJson } from './write-package-json';

/**
 * Bundle a package using esbuild and update `package.json` if necessary.
 */
export async function buildPackage(
  pkg: Package,
  {
    writePackageJson = true,
    types = true,
  }: {
    writePackageJson?: boolean;
    types?: boolean;
  } = {},
) {
  logger.info(`${colors.blue(pkg.packageJson.name)} building...`);

  const entryPoints = await parseEntryPoints(pkg);

  if (writePackageJson) {
    await writeMainPackageJson(pkg, entryPoints);
  }

  const promises: Array<Promise<unknown>> = [];

  for (const entryPoint of entryPoints) {
    const { format, outFile, inFile } = entryPoint;
    const outFileEntry = path.basename(outFile).split('.').slice(0, -1).join('.');
    const tsconfigPath = await findUp('tsconfig.json', { cwd: inFile });

    promises.push(
      tsupBuild({
        target: ['es2020', 'chrome60', 'firefox60', 'safari11', 'edge18', 'node12'],
        outDir: path.dirname(outFile),
        entry: {
          [outFileEntry]: inFile,
        },
        format: format === 'dual' ? ['cjs', 'esm'] : format,
        outExtension: ({ format }) => ({ js: format === 'esm' ? '.js' : '.cjs' }),
        skipNodeModulesBundle: true,
        // tsconfig: path.join(getRoot(), 'support', 'tsconfig.base.json'),
        tsconfig: tsconfigPath,
        experimentalDts: types
          ? {
              entry: {
                [outFileEntry]: inFile,
              },
            }
          : undefined,
        // plugins: [
        //   {
        //     name: 'remirror-es-decorator-state-3',
        //     renderChunk: async (code) => {
        //       if (!code.includes('@')) {
        //         return;
        //       }
        //
        //       const transformed = await babel.transformAsync(code, {
        //         plugins: [['@babel/plugin-proposal-decorators', { version: '2023-05' }]],
        //
        //         // We need to set the ESBuild target to esnext so that it can
        //         // pass through the decorators syntax. So we need another layer
        //         // to do the transpilation. This is inefficient but it works.
        //         presets: [
        //           [
        //             '@babel/preset-env',
        //             {
        //               targets: {
        //                 node: '14',
        //                 // See https://remirror.io/docs/advanced/browser-support
        //                 browsers: 'since 2017',
        //               },
        //               modules: false,
        //             },
        //           ],
        //         ],
        //
        //         // Don't look for babel.config.js
        //         configFile: false,
        //       });
        //
        //       const transformedCode = transformed?.code;
        //       return { code: transformedCode || code };
        //     },
        //   },
        // ],
        // dts: {
        //   entry: {
        //     [outFileEntry]: inDtsFile,
        //   },
        //   compilerOptions: {
        //     allowJs: true,
        //     module: 'ESNext',
        //     target: 'ESNext',
        //     lib: ['DOM', 'DOM.Iterable', 'ESNext'],
        //     jsx: 'react',
        //     types: ['node', '@jest/globals'],
        //     moduleResolution: 'node',
        //     useDefineForClassFields: true,
        //     sourceMap: true,
        //     declaration: true,
        //     pretty: true,
        //     noEmit: true,
        //     strict: true,
        //     resolveJsonModule: true,
        //     preserveWatchOutput: true,
        //     skipLibCheck: true,
        //     experimentalDecorators: false,
        //     isolatedModules: true,
        //     allowSyntheticDefaultImports: true,
        //     esModuleInterop: true,
        //     importsNotUsedAsValues: 'remove',
        //     noUnusedLocals: true,
        //     noUnusedParameters: true,
        //     allowUnreachableCode: false,
        //     forceConsistentCasingInFileNames: true,
        //     noImplicitReturns: true,
        //   },
        // },
      }),
    );
  }

  const generateScript = (pkg.packageJson as any)?.scripts?.generate;

  if (generateScript) {
    logger.info(
      `${colors.blue(pkg.packageJson.name)} building with its custom generation script...`,
    );
    promises.push(runCustomScript(pkg, 'generate'));
  }

  if (writePackageJson) {
    for (const entryPoint of entryPoints.filter((entryPoint) => !entryPoint.isMain)) {
      promises.push(writeSubpathPackageJson(pkg, entryPoint));
    }
  }

  await Promise.all(promises);

  await copyDeclare(pkg);

  logger.info(`${colors.blue(pkg.packageJson.name)} done`);
}

/**
 * Parse a package.json file and return all entry points in this packages.
 */
async function parseEntryPoints(pkg: Package): Promise<EntryPoint[]> {
  const entryPointFiles = await findEntryPoints(pkg);

  logger.assert(
    entryPointFiles.length > 0,
    `failed to find any entry point for package ${pkg.packageJson.name} at ${pkg.dir}`,
  );

  for (const entryPointFile of entryPointFiles) {
    await validEntryPoint(pkg, entryPointFile);
  }

  const entryPoints: EntryPoint[] = [];

  for (const file of entryPointFiles) {
    const inFile = path.join(pkg.dir, 'src', file);

    let subpath = `./${removeFileExt(file)}`;

    if (subpath.endsWith('/index')) {
      subpath = subpath.slice(0, -6);
    }

    const isMain = subpath === '.';

    const entryPointName = slugify(`${pkg.packageJson.name}-${isMain ? '' : subpath}`);

    const outFile = path.resolve(pkg.dir, subpath, 'dist', `${entryPointName}.js`);

    const isPureCjs = /\.c[jt]sx?$/.test(inFile);
    const isPureMjs = /\.m[jt]sx?$/.test(inFile);
    const isDual = !isPureMjs && !isPureCjs;
    const format = isDual ? 'dual' : isPureCjs ? 'cjs' : 'esm';

    entryPoints.push({ isMain, inFile, outFile, subpath, format });
  }

  return entryPoints;
}

/**
 * Returns an array of all entry points in the given package.
 * A entry point is a relative path to the `src/` directory.
 */
async function findEntryPoints(pkg: Package): Promise<string[]> {
  const entryPoints: string[] = (pkg.packageJson as any)?.preconstruct?.entrypoints;

  if (entryPoints) {
    return entryPoints;
  }

  return await glob(['index.ts', 'index.tsx', 'index.mjs', 'index.cjs', 'index.js'], {
    cwd: path.join(pkg.dir, 'src'),
  });
}

async function validEntryPoint(pkg: Package, entryPoint: string) {
  const absFilePath = path.resolve(pkg.dir, 'src', entryPoint);
  logger.assert(
    await fileExists(absFilePath),
    "entry point file doesn't exist: ${absFilePath}. Please check your package.json",
  );
}

async function writeMainPackageJson(pkg: Package, entryPoints: EntryPoint[]) {
  const packageJson = buildPackageJson(pkg.dir, pkg.dir, entryPoints, pkg.packageJson);

  // Update `files`
  const files: string[] = packageJson.files ?? [];

  for (const dir of ['dist', 'dist-types']) {
    if (!files.includes(dir)) {
      files.push(dir);
    }
  }

  files.sort();
  packageJson.files = files;

  // Update `homepage` and `repository`
  const root = getRoot();
  const relativeDir = path.relative(root, pkg.dir);
  packageJson.homepage = `https://github.com/remirror/remirror/tree/HEAD/${relativeDir}`;
  packageJson.repository = {
    type: 'git',
    url: 'https://github.com/remirror/remirror.git',
    directory: relativeDir,
  };

  await writePackageJson(pkg.dir, packageJson);
}

async function writeSubpathPackageJson(pkg: Package, entryPoint: EntryPoint) {
  logger.assert(!entryPoint.isMain);

  const subPathDir = path.resolve(pkg.dir, entryPoint.subpath);
  const packageJson = buildPackageJson(pkg.dir, subPathDir, [entryPoint], {}, true);
  await writePackageJson(subPathDir, packageJson);
}

function buildPackageJson(
  /**
   * The absolute path to the NPM package directory.
   */
  packageDir: string,
  /**
   * The absolute path to the directory that include the package.json file. This directory may be the same as the packageDir or it may be a subdirectory of the packageDir.
   */
  packageJsonDir: string,

  entryPoints: EntryPoint[],
  packageJson: any = {},

  publishConfig = false,
) {
  let exports: Record<string, any> = { ...packageJson.exports };

  for (const entryPoint of entryPoints) {
    exports = {
      ...exports,
      ...buildCondictionalExports(packageDir, packageJsonDir, entryPoint, publishConfig),
    };
  }

  exports = sortKeys(exports);
  exports['./package.json'] = './package.json';

  packageJson.type = entryPoints.every((entryPoint) => entryPoint.format === 'cjs')
    ? 'commonjs'
    : 'module';
  const mainExport = exports['.'];

  if (mainExport) {
    packageJson.main = mainExport.require || mainExport.import;

    if (mainExport.import) {
      packageJson.module = mainExport.import;
    }

    packageJson.types = mainExport.types;
  }

  delete packageJson.browser;
  packageJson.exports = exports;

  const isMainPackage = packageDir === packageJsonDir;

  packageJson.publishConfig =
    isMainPackage && !publishConfig
      ? buildPackageJson(
          packageDir,
          packageJsonDir,
          entryPoints,
          { exports: packageJson.exports, access: 'public' },
          true,
        )
      : undefined;

  return packageJson;
}

function buildCondictionalExports(
  /**
   * The absolute path to the NPM package directory.
   */
  packageDir: string,
  /**
   * The absolute path to the directory that include the package.json file. This directory may be the same as the packageDir or it may be a subdirectory of the packageDir.
   */
  packageJsonDir: string,
  entryPoint: EntryPoint,
  publishConfig: boolean,
): Record<string, any> {
  const inFileRelativeToSrc = path.relative(path.join(packageDir, 'src'), entryPoint.inFile);
  const dtsFile = `${path.join(
    packageDir,
    'dist-types',
    `${removeFileExt(inFileRelativeToSrc)}.d.ts`,
  )}`;

  const dtsFileRelativePath = `./${path.relative(packageJsonDir, dtsFile)}`;
  const outEsmFileRelativePath = `./${path.relative(packageJsonDir, entryPoint.outFile)}`;
  const outCjsFileRelativePath = ensureCjsFilename(outEsmFileRelativePath);
  const outDtsFileRelativePath = ensureDtsFilename(outEsmFileRelativePath);

  let subPathRelativePath = `./${path.relative(
    packageJsonDir,
    path.join(packageDir, entryPoint.subpath),
  )}`;

  if (subPathRelativePath === './') {
    subPathRelativePath = '.';
  }

  const supportCjs = entryPoint.format === 'dual' || entryPoint.format === 'cjs';
  const supportEsm = entryPoint.format === 'dual' || entryPoint.format === 'esm';
  logger.assert(supportCjs || supportEsm);

  return {
    [subPathRelativePath]: {
      types: publishConfig ? outDtsFileRelativePath : dtsFileRelativePath,
      ...(supportEsm
        ? {
            import: outEsmFileRelativePath,
          }
        : {}),
      ...(supportCjs
        ? {
            require: outCjsFileRelativePath,
          }
        : {}),
    },
  };
}

// api-extractor doesn't support `declare global`. This function is a workaround for it.
// See also https://github.com/microsoft/rushstack/issues/1709
async function copyDeclare(pkg: Package) {
  const sourceFiles = await glob(['**/*.ts', '**/*.tsx'], {
    cwd: path.join(pkg.dir, 'src'),
    absolute: true,
  });

  const chunks: string[] = [];

  for (const filePath of sourceFiles) {
    const content = await readFile(filePath, { encoding: 'utf-8' });
    const lines = content.split('\n');
    const startIndex = lines.indexOf('declare global {');

    if (startIndex === -1) {
      continue;
    }

    chunks.push(lines.slice(startIndex).join('\n'));
  }

  if (chunks.length === 0) {
    return;
  }

  const code = `\n${chunks.join('\n\n')}`;

  const destFiles = await glob(['_tsup-dts-rollup*'], {
    cwd: path.join(pkg.dir, 'dist'),
    absolute: true,
  });

  for (const filePath of destFiles) {
    const content = await readFile(filePath, { encoding: 'utf-8' });
    await writeFile(filePath, content + code);
  }
}
