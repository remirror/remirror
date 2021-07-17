/**
 * @script
 *
 * This script uses `linaria` to generate css from all the project files and
 * place the css inside `@remirror/styles` package.
 */

/// <reference types="node" />

import { transform } from '@linaria/babel-preset';
import autoprefixer from 'autoprefixer';
import chalk from 'chalk';
import cpy from 'cpy';
import fs from 'fs-extra';
import globby from 'globby';
import groupBy from 'lodash.groupby';
import path from 'path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import prettier from 'prettier';
import { camelCase, pascalCase } from '@remirror/core-helpers';

import { baseDir, rm } from './helpers';

/**
 * The files to check when searching for linaria based css strings.
 *
 * @param {string[]} paths
 */
const files = globby.sync(['packages/remirror__theme/src/*.{ts,tsx}'], {
  cwd: baseDir(),
  ignore: [
    '**/@remirror/styles',
    '**/website',
    '**/playground',
    '**/__tests__',
    '**/__dts__',
    '**/__mocks__',
    '**/__fixtures__',
    '**/__stories__',
    '*.{test,spec}.{ts,tsx}',
    '**/*.d.ts',
    '*.d.ts',
  ],
});

/**
 * The destination of the outputted css, where styles are eventually published
 * from.
 */
const outputDirectory = baseDir('packages/remirror__styles');

/**
 * This regex groups the generated css files from the same package together.
 */
const groupingRegex = /([\w-]+)\.ts$/;

/**
 * A dictionary mapping of files grouped together by their scoped identifier.
 * Where the package `@remirror/core` would have a scoped identifier of `core`.
 *
 * ```json
 * {
 *   "core": ["packages/remirror__core/src/styles.ts"],
 *   "react-social": ["packages/remirror__react-social/src/components/social-mentions.tsx"],
 * }
 * ```
 */
const groupedFiles = groupBy(files, (file) => {
  const match = file.match(groupingRegex);
  const captured = match?.[1];

  if (!captured) {
    throw new Error(`Invalid file ${file}`);
  }

  return captured.replace('-theme', '');
});

/**
 * Cache the prettier config to reuse when prettifying a file.
 *
 * @type {import('prettier').Options | null | undefined}
 */
let prettierConfig: prettier.Options;

/**
 * Format the contents with prettier.
 *
 * @param contents - the content to format
 * @param parser - the parser to use for the formatting
 *
 * @returns formatted value of the provided content
 */
async function formatContents(
  contents: string,
  parser: 'css' | 'typescript' = 'css',
): Promise<string> {
  // Check if the prettier config has been retrieved. If not, retrieve it.
  prettierConfig ??= (await prettier.resolveConfig(baseDir())) ?? {};

  return prettier.format(contents, { ...prettierConfig, parser });
}

/**
 * Process the css with `postcss` for prefixing, variables and other features.
 *
 * @param css - the untransformed css text
 * @param from - the path being transformed
 * @param to - the output path for the transformation
 */
async function processCss(css: string, from?: string, to?: string) {
  const result = await postcss([postcssImport(), postcssNested, autoprefixer]).process(css, {
    from,
    to,
  });
  return result.css;
}

/** @typedef {{ outputFilename: string; content: string; }} ExtractedCss */

/**
 * Extract the css from the provided identifier and relative file path and
 * updates the `output` object in the outer scope.
 *
 * @param {string} name - refers to the scoped package identifier.
 * `@remirror/core` would be `core`.
 * @param {File[]} relativeFilePaths - the relative paths for the package which
 * should be checked for css.
 *
 * @returns {Promise<ExtractedCss | undefined>} the output css and the filename
 * to which it should be written
 */
async function extractCssFromPackage(name: string, relativeFilePaths: string[]) {
  /**
   * A container for the css extracted from each filePath
   * @type { string[] }
   */
  const css = [];

  // The absolute path for outputting the css file.
  const outputFilename = resolveCssOutputFilename(name);

  for (const filename of relativeFilePaths) {
    // Read the file contents of the TypeScript file.
    const fileContents = await fs.readFile(baseDir(filename));

    // Transform the `css` linaria imports into css text.
    const { cssText: rawCssText } = transform(fileContents.toString(), {
      filename,
      outputFilename,
      preprocessor: 'none',
    });

    // Skip this if no css was found in the file.
    if (!rawCssText) {
      continue;
    }

    // Process the content since the css used supports variables and requires
    // auto-prefixing for cross browser support.
    const cssText = await processCss(rawCssText);

    // Add a comment header to the files, purely for aesthetics.
    css.push(`/**\n * Styles extracted from: ${filename}\n */\n${cssText}`);
  }

  // No css was found in this package therefore we return undefined.
  if (css.length === 0) {
    return;
  }

  const content = css.join('\n');

  return { outputFilename, content };
}

/**
 * Get the absolute path for the location of where the CSS file should be
 * placed.
 *
 * @param {string} name - the scoped package identifier. `@remirror/core`
 * becomes `core`.
 */
function resolveCssOutputFilename(name: string) {
  return path.join(outputDirectory, `${name}.css`);
}

// An autogenerated notice which is added to the top of every ts file.
const autoGenerated = `\
/**
 * AUTO GENERATED FILE - TO UPDATE RUN: \`pnpm run fix:css\`
 */\n\n`;

// The file names for the code style imports.
const importData = {
  emotion: {
    file: path.join(outputDirectory, 'src', 'emotion.tsx'),
    imports: `${autoGenerated}import { css } from '@emotion/react';\nimport styled from '@emotion/styled';\n\n`,
  },
  styledComponents: {
    file: path.join(outputDirectory, 'src', 'styled-components.tsx'),
    imports: `${autoGenerated}import styled, { css } from 'styled-components';\n\n`,
  },
  dom: {
    file: path.join(outputDirectory, 'src', 'dom.tsx'),
    imports: `${autoGenerated}import { css } from '@emotion/css';\n\n export * from './utils';\n\n`,
  },
};

/**
 * This is used to generate the camel case name variant from the absolute path.
 *
 * @param {File} absolutePath
 * @returns {string} the camel cased name.
 */
function getCamelCaseName(absolutePath: string) {
  return camelCase(path.basename(absolutePath).replace('css', ''));
}

/**
 * This is used to generate the pascal case name variant from the absolute path.
 *
 * @param {File} absolutePath
 * @returns {string} the camel cased name.
 */
function getPascalCaseName(absolutePath: string) {
  return pascalCase(path.basename(absolutePath).replace('css', ''));
}

/**
 * Generate the styled css format of imports.
 *
 * @param {string} absolutePath - the absolute file path
 * @param {string} contents - the css for this package
 * @param {string[]} [allPaths] - an array of the path names
 */
function generateStyledCss(absolutePath: string, contents: string, allPaths?: string[]) {
  const css = allPaths
    ? allPaths.map((path: any) => `\${${getCamelCaseName(path)}StyledCss}`).join('\n  ')
    : contents;

  return `export const ${getCamelCaseName(
    absolutePath,
  )}StyledCss: ReturnType<typeof css> = css\`${css}\`;\n\n`;
}

/**
 * Generate the styled component format of imports.
 *
 * @param absolutePath - the absolute file path
 * @param allPaths - an array of the path names
 */
function generateStyledComponent(absolutePath: string, allPaths?: string[]) {
  const paths = allPaths ? allPaths : [absolutePath];
  const content = paths.map((path: any) => `\${${getCamelCaseName(path)}StyledCss}`).join('\n  ');

  return `export const ${getPascalCaseName(
    absolutePath,
  )}StyledComponent: ReturnType<typeof styled.div> = styled.div\`${content}\`;\n\n`;
}

/**
 * Clean the css and style files.
 */
export async function removeGeneratedFiles(): Promise<void> {
  // The files that need to be deleted.
  const tsFiles = [...Object.values(importData).map(({ file }) => file)].join(' ');

  // Delete css files 🤭
  await Promise.all([rm('packages/{@,}remirror/styles/*.css'), rm(tsFiles)]);
}

/**
 * Copy files from `@remirror/styles` to `remirror/styles`.
 */
export async function copyFilesToRemirror(): Promise<void> {
  await cpy(['packages/remirror__styles/*.css'], 'packages/remirror/styles/');
}

/**
 * Transform the css output to TS files.
 *
 * - From the output, get the filenames and css.
 * - Capitalize the filename and join it with the css.
 *
 * @param css - the css object
 */
async function getTsOutput(css: Record<string, string>): Promise<Record<string, string>> {
  const { dom, emotion, styledComponents } = importData;

  const ts: Record<string, string> = {
    [dom.file]: dom.imports,
    [emotion.file]: emotion.imports,
    [styledComponents.file]: styledComponents.imports,
  };

  const allPath = resolveCssOutputFilename('all');

  const { [allPath]: all, ...rest } = css;

  /** @type {string[]} */
  const allPaths = [];

  for (const [absolutePath, cssContents] of Object.entries(rest)) {
    allPaths.push(absolutePath);
    const exportedCss = generateStyledCss(absolutePath, cssContents);
    const exportedComponent = generateStyledComponent(absolutePath);

    // Add the styled css exports
    ts[dom.file] += exportedCss;
    ts[emotion.file] += exportedCss;
    ts[styledComponents.file] += exportedCss;

    // Add the style component exports
    ts[emotion.file] += exportedComponent;
    ts[styledComponents.file] += exportedComponent;
  }

  const allExportedCss = generateStyledCss(allPath, '', allPaths);
  const allExportedComponent = generateStyledComponent(allPath, allPaths);

  // Add the styled css exports for the `all` css.
  ts[dom.file] += allExportedCss;
  ts[emotion.file] += allExportedCss;
  ts[styledComponents.file] += allExportedCss;

  // Add the `all` styled component exports
  ts[emotion.file] += allExportedComponent;
  ts[styledComponents.file] += allExportedComponent;

  ts[dom.file] = await formatContents(ts[dom.file] ?? '', 'typescript');
  ts[emotion.file] = await formatContents(ts[emotion.file] ?? '', 'typescript');
  ts[styledComponents.file] = await formatContents(ts[styledComponents.file] ?? '', 'typescript');

  return ts;
}

interface Output {
  css: Record<string, string>;
  ts: Record<string, string>;
}

/**
 * Get the output files and css.
 */
export async function getOutput(): Promise<Output> {
  // A container for all the css output gathered so far.
  const css: Record<string, string> = {};

  // A list of all the styles gathered together so far. This is tracked so that
  // after running through the full list of packages a new entry can be made
  // which includes the entire css bundle.
  const all: string[] = [];

  for (const [name, relativeFilePaths] of Object.entries(groupedFiles)) {
    // Run through each package and extract the css from the package files. The
    // fileName and cssContent generated is automatically added to the outer
    // scoped `output` object.
    const extracted = await extractCssFromPackage(name, relativeFilePaths);

    // Nothing was extracted
    if (!extracted) {
      continue;
    }

    const { content, outputFilename } = extracted;

    // Add the content to the `all` outer scope holder. After all packages are
    // run this array will hold all css and be added to the output.
    all.push(content);

    // Prettify the file and store the result in the `output` object.
    css[outputFilename] = await formatContents(content, 'css');
  }

  // Prettify and store all the generated css in the `output` object.
  css[resolveCssOutputFilename('all')] = await formatContents(all.join('\n'), 'css');

  return { css, ts: await getTsOutput(css) };
}

/**
 * Write the output to the required locations.
 *
 * @param output - container for all the output gathered so far.
 */
export async function writeOutput(output: Record<string, string>): Promise<void> {
  const entries = Object.entries(output);

  const promisesToRun: Array<Promise<void>> = [];

  for (const [filename, contents] of entries) {
    promisesToRun.push(fs.writeFile(filename, contents));
  }

  // Write all the files at the same time, rather than sequentially.
  await Promise.all(promisesToRun);

  // We made it 🎉
  console.log(chalk`{green Successfully extracted {bold ${entries.length}} CSS files.}`);
}
