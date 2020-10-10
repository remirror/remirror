/**
 * @packageDocumentation
 *
 * This script uses `linaria` to generate css from all the project files and
 * place the css inside `@remirror/styles` package.
 */

/// <reference types="node" />

const fs = require('fs').promises;
const globby = require('globby');
const transform = require('linaria/lib/transform').default;
const path = require('path');
const groupBy = require('lodash.groupby');
const chalk = require('chalk');
const { baseDir, rm } = require('./helpers');
const prettier = require('prettier');
const postcssNested = require('postcss-nested');
const postcssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const { camelCase, pascalCase } = require('case-anything');
const cpy = require('cpy');

/**
 * The files to check when searching for linaria based css strings.
 *
 * @param {string[]} paths
 */
const files = globby.sync(['packages/@remirror/*/src/**/*.{ts,tsx}'], {
  cwd: baseDir(),
  ignore: [
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
const outputDirectory = baseDir('packages/@remirror/styles');

/**
 * This regex groups the generated css files from the same package together.
 */
const groupingRegex = /^packages\/@remirror\/([\w-]+)\/.*/;

/**
 * @typedef {string} File
 * @typedef {string} CssContent
 */

/**
 * A dictionary mapping of files grouped together by their scoped identifier.
 * Where the package `@remirror/core` would have a scoped identifier of `core`.
 *
 * ```json
 * {
 *   "core": ["packages/@remirror/core/src/styles.ts"],
 *   "react-social": ["packages/@remirror/react-social/src/components/social-mentions.tsx"],
 * }
 * ```
 *
 * @type {{ [scopedPackageIdentifier: string]: File[] }}
 */
const groupedFiles = groupBy(files, (file) => {
  const match = file.match(groupingRegex);

  if (!match || !match[1]) {
    throw new Error(`Invalid file ${file}`);
  }

  return match[1];
});

/**
 * Cache the prettier config to reuse when prettifying a file.
 *
 * @type {import('prettier').Options | null | undefined}
 */
let prettierConfig;

/**
 * Format the contents with prettier.
 *
 * @param {CssContent} contents - the content to format
 * @param {'css' | 'typescript'} [parser] - the parser to use for the formatting
 *
 * @returns {Promise<string>} formatted value of the provided content
 */
async function formatContents(contents, parser = 'css') {
  // Check if the prettier config has been retrieved. If not, retrieve it.
  if (prettierConfig === undefined) {
    prettierConfig = await prettier.resolveConfig(baseDir());
  }

  return prettier.format(contents, { ...prettierConfig, parser });
}

/**
 * Process the css with `postcss` for prefixing, variables and other features.
 *
 * @param {string} css - the untransformed css text
 * @param {string?} [from] - the path being transformed
 * @param {string?} [to] - the output path for the transformation
 */
async function processCss(css, from, to) {
  const result = await postcss([postcssImport, postcssNested, autoprefixer]).process(css, {
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
async function extractCssFromPackage(name, relativeFilePaths) {
  /**
   * A container for the css extracted from each filePath
   * @type { CssContent[] }
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
function resolveCssOutputFilename(name) {
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
    imports: `${autoGenerated}import { css } from '@emotion/core';\nimport styled from '@emotion/styled';\n\n`,
  },
  styledComponents: {
    file: path.join(outputDirectory, 'src', 'styled-components.tsx'),
    imports: `${autoGenerated}import styled, { css } from 'styled-components';\n\n`,
  },
  dom: {
    file: path.join(outputDirectory, 'src', 'dom.tsx'),
    imports: `${autoGenerated}import { css } from 'emotion';\n\n export * from './utils';\n\n`,
  },
};

/**
 * This is used to generate the camel case name variant from the absolute path.
 *
 * @param {File} absolutePath
 * @returns {string} the camel cased name.
 */
function getCamelCaseName(absolutePath) {
  return camelCase(path.basename(absolutePath).replace('css', ''));
}

/**
 * This is used to generate the pascal case name variant from the absolute path.
 *
 * @param {File} absolutePath
 * @returns {string} the camel cased name.
 */
function getPascalCaseName(absolutePath) {
  return pascalCase(path.basename(absolutePath).replace('css', ''));
}

/**
 * Generate the styled css format of imports.
 *
 * @param {string} absolutePath - the absolute file path
 * @param {CssContent} contents - the css for this package
 * @param {string[]} [allPaths] - an array of the path names
 */
function generateStyledCss(absolutePath, contents, allPaths) {
  const css = allPaths
    ? allPaths.map((path) => `\${${getCamelCaseName(path)}StyledCss}`).join('\n  ')
    : contents;

  return `export const ${getCamelCaseName(
    absolutePath,
  )}StyledCss: ReturnType<typeof css> = css\`${css}\`;\n\n`;
}

/**
 * Generate the styled component format of imports.
 *
 * @param {string} absolutePath - the absolute file path
 * @param {string[]} [allPaths] - an array of the path names
 */
function generateStyledComponent(absolutePath, allPaths) {
  const paths = allPaths ? allPaths : [absolutePath];
  const content = paths.map((path) => `\${${getCamelCaseName(path)}StyledCss}`).join('\n  ');

  return `export const ${getPascalCaseName(
    absolutePath,
  )}StyledComponent: ReturnType<typeof styled.div> = styled.div\`${content}\`;\n\n`;
}

/**
 * Clean the css and style files.
 */
async function removeGeneratedFiles() {
  // The files that need to be deleted.
  const files = [
    'packages/@remirror/styles/*.css',
    'packages/remirror/styles/*.css',
    ...Object.values(importData).map(({ file }) => file),
  ].join(' ');

  // Delete it all 🤭
  await rm(files);
}

/**
 * Copy files from `@remirror/styles` to `remirror/styles`.
 */
async function copyFilesToRemirror() {
  await cpy(['packages/@remirror/styles/*.css'], 'packages/remirror/styles/');
}

/**
 * Transform the css output to TS files.
 *
 * - From the output, get the filenames and css.
 * - Capitalize the filename and join it with the css.
 *
 * @param {Record<string, CssContent>} css - the css object
 */
async function getTsOutput(css) {
  const { dom, emotion, styledComponents } = importData;

  /** @type {Record<string, string>} */
  const ts = {
    [dom.file]: dom.imports,
    [emotion.file]: emotion.imports,
    [styledComponents.file]: styledComponents.imports,
  };

  let allPath = resolveCssOutputFilename('all');

  const { [resolveCssOutputFilename('all')]: all, ...rest } = css;

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

  ts[dom.file] = await formatContents(ts[dom.file], 'typescript');
  ts[emotion.file] = await formatContents(ts[emotion.file], 'typescript');
  ts[styledComponents.file] = await formatContents(ts[styledComponents.file], 'typescript');

  return ts;
}

/**
 * Get the output files and css.
 */
async function getOutput() {
  /**
   * A container for all the css output gathered so far.
   *
   * @type {Record<string, CssContent>}
   */
  const css = {};

  /**
   * A list of all the styles gathered together so far. This is tracked so that
   * after running through the full list of packages a new entry can be made
   * which includes the entire css bundle.
   *
   * @type {CssContent[]}
   */
  const all = [];

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
 * @param {Record<string, CssContent>} output - container for all the output
 * gathered so far.
 */
async function writeOutput(output) {
  const entries = Object.entries(output);

  /** @type {Array<Promise<void>>} */
  const promisesToRun = [];

  for (const [filename, contents] of entries) {
    promisesToRun.push(fs.writeFile(filename, contents));
  }

  // Write all the files at the same time, rather than sequentially.
  await Promise.all(promisesToRun);

  // We made it 🎉
  console.log(chalk`{green Successfully extracted {bold ${entries.length}} CSS files.}`);
}

exports.removeGeneratedFiles = removeGeneratedFiles;
exports.copyFilesToRemirror = copyFilesToRemirror;
exports.getOutput = getOutput;
exports.writeOutput = writeOutput;
