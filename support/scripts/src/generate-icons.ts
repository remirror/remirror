/**
 * @script
 *
 * The contents for this file are adapted from
 * https://github.com/react-icons/react-icons/blob/10199cca7abeb3efbc647090714daa279da45779/packages/react-icons/src/icons/index.js#L259-L274
 */

import chalk from 'chalk';
import cheerio, { Cheerio } from 'cheerio';
import { promises as fs } from 'fs';
import globby from 'globby';
import loadJson from 'load-json-file';
import path from 'path';
import {
  camelCase,
  capitalCase,
  isEmptyObject,
  kebabCase,
  object,
  pascalCase,
} from '@remirror/core-helpers';
import type { IconTree } from '@remirror/icons';

import { baseDir, formatFiles, log } from './helpers';

const data: { icons: string[] } = loadJson.sync(
  baseDir('support', 'scripts', 'data', 'icons.json'),
);

// The icons which will are used within the `remirror` code base and included in
// the default bundle.
const coreIcons = new Set(data.icons);
const remixIconNodeModules = path.resolve(__dirname, '../node_modules/remixicon/icons');
const remixIconContents = path.join(remixIconNodeModules, './*/*.svg');

const coreIconsPath = baseDir('packages/remirror__icons/src/core-icons.ts');
const coreComponentsPath = baseDir('packages/remirror__react-components/src/icons/core.ts');
const allIconsPath = baseDir('packages/remirror__icons/src/all-icons.ts');
const allComponentsPath = baseDir('packages/remirror__react-components/src/icons/all.ts');

/**
 * Get all the icon files from the provided glob
 */
async function getIconFiles(glob: string) {
  const files = await globby(glob, { absolute: true, onlyFiles: true });
  files.sort((a, z) => path.basename(a).localeCompare(path.basename(z)));

  const core: string[] = [];
  const all: string[] = [];

  for (const file of files) {
    if (coreIcons.has(path.basename(file))) {
      core.push(file);
    } else {
      all.push(file);
    }
  }

  return { core, all };
}

/**
 * These are the ignored names for the svg content.
 */
function getInvalidNames(tagName: string): Set<string> {
  const invalidNames = ['class'];

  if (tagName === 'svg') {
    invalidNames.push(...['xmlns', 'xmlns:xlink', 'xml:space', 'width', 'height']);
  }

  return new Set(invalidNames);
}

async function convertIconData(svg: string) {
  const $svg = cheerio.load(svg, { xmlMode: true })('svg');

  // filter/convert attributes
  // 1. remove class attr
  // 2. convert to camelcase ex: fill-opacity => fillOpacity
  function attributeConverter(attrs: NamedNodeMap, tagName: string) {
    const attributes: Record<string, string> = object();
    const convertedAttributes: Record<string, string> = object();
    const invalidNames = getInvalidNames(tagName);

    for (const attr of attrs) {
      attributes[attr.name] = attr?.value;
    }

    for (const [name, value] of Object.entries(attributes)) {
      if (invalidNames.has(name)) {
        continue;
      }

      const newName = camelCase(name);
      const shouldRenameAttribute =
        (newName === 'fill' && (value === 'none' || value === 'currentColor')) ||
        newName !== 'fill';

      if (shouldRenameAttribute) {
        convertedAttributes[newName] = value;
      }
    }

    return convertedAttributes;
  }

  function elementToTree($element: Cheerio<Element>): IconTree[] {
    const iconTrees: any[] = [];

    for (const $child of $element.get() ?? []) {
      if (!($child.tagName && !['style'].includes($child.tagName))) {
        continue;
      }

      const tag = $child.tagName;
      const attr = attributeConverter($child.attributes, $child.tagName);
      const child = $child.children?.length
        ? elementToTree(cheerio($child.children as any))
        : undefined;

      if (tag === 'g' && isEmptyObject(attr) && child?.length) {
        iconTrees.push(...child);
      } else {
        iconTrees.push({ tag, attr, child });
      }
    }

    return iconTrees;
  }

  const tree = elementToTree($svg as any);

  // Get the first child to avoid the top level `svg` tag which is not needed.
  return tree[0]?.child;
}

/**
 * Create the import statement for the component files, which pulls in the icons
 * from `@remirror/icons`.
 */
function generateComponentIconImports(iconNames: string[], type: IconCollection) {
  const importSource = 'core' === type ? '@remirror/icons' : '@remirror/icons/all';
  return `import {\n  ${iconNames.join(',\n  ')}\n} from '${importSource}';`;
}

/**
 * The first lines for the generate file.
 */
function generateFileHeader(type: 'component' | 'icon') {
  const importString =
    'icon' === type
      ? `import type { IconTree } from './icon-types';`
      : `import { GenIcon, IconType } from './icons-base';`;

  return `/** THIS FILE IS AUTO GENERATED */\n\n${importString}`;
}

/**
 * Generate the export statement for the icon array.
 */
function generateIconExport(iconName: string, iconData: IconTree[] | undefined, cdnPath: string) {
  const description = `The icon for \`${kebabCase(
    iconName,
  )}.svg\` created by [RemixIcons](https://remixicons.com).\n *`;

  return `\
/**
 * ${description} ![${capitalCase(
    iconName,
  )}](https://cdn.jsdelivr.net/npm/remixicon@2.5.0/icons/${cdnPath})
 */
export const ${iconName}: IconTree[] = ${JSON.stringify(iconData ?? [])};`;
}

/**
 * Create the export statement for the icon component.
 */
function generateComponentExport(componentName: string, iconName: string, cdnPath: string) {
  const description = `The react component for the \`${kebabCase(
    iconName,
  )}.svg\` icon created by [RemixIcons](https://remixicons.com).\n *`;

  return `\
/**
 * ${description} ![${capitalCase(
    componentName,
  )}](https://cdn.jsdelivr.net/npm/remixicon@2.5.0/icons/${cdnPath})
 */
export const ${componentName}: IconType = (props) => {
  return GenIcon(${iconName})(props);
};`;
}

/**
 * Generate all exports.
 */
function generateAllExports(type: 'component' | 'icon') {
  return 'component' === type ? `export * from './core';` : `export * from './core-icons';`;
}

type IconCollection = 'core' | 'all';

interface GenerateOptions {
  names: Set<string>;
  iconContent: string[];
  componentContent: string[];
}

/**
 * Update the content arrays.
 */
async function updateContent(files: string[], _: IconCollection, options: GenerateOptions) {
  const { names, iconContent, componentContent } = options;

  for (const file of files) {
    const pathForCdn = path.relative(remixIconNodeModules, file);
    const svgString = await fs.readFile(file, 'utf8');
    const iconData = await convertIconData(svgString);

    const originalName = path.basename(file, path.extname(file));
    const componentName = `${pascalCase(originalName)
      .replace(/^4/, 'Four')
      .replace(/^24/, 'TwentyFour')}Icon`;
    const iconName = camelCase(componentName).replace(/Icon$/, '');

    if (names.has(iconName)) {
      continue;
    }

    names.add(iconName);
    iconContent.push(generateIconExport(iconName, iconData, pathForCdn), '');
    componentContent.push(generateComponentExport(componentName, iconName, pathForCdn), '');
  }
}

/**
 * Write the files for the created icons.
 */
async function writeIconModule() {
  const coreNames: Set<string> = new Set();
  const allNames: Set<string> = new Set();

  const iconHeader = [generateFileHeader('icon'), ''];
  const componentHeader = [generateFileHeader('component'), ''];
  const iconExports = ['', generateAllExports('icon')];
  const componentExports = ['', generateAllExports('component')];

  const coreIconContent: string[] = [];
  const allIconContent: string[] = [];
  const coreComponentContent: string[] = [];
  const allComponentContent: string[] = [];

  const allOptions: GenerateOptions = {
    names: allNames,
    iconContent: allIconContent,
    componentContent: allComponentContent,
  };

  const coreOptions: GenerateOptions = {
    names: coreNames,
    iconContent: coreIconContent,
    componentContent: coreComponentContent,
  };
  // Sort alphabetically.

  const { core, all } = await getIconFiles(remixIconContents);

  await Promise.all([
    updateContent(core, 'core', coreOptions),
    updateContent(all, 'all', allOptions),
  ]);

  const coreIconString = [...iconHeader, ...coreIconContent].join('\n');
  const allIconString = [...iconHeader, ...allIconContent, ...iconExports].join('\n');
  const coreComponentString = [
    ...componentHeader,
    generateComponentIconImports([...coreNames], 'core'),
    '',
    ...coreComponentContent,
  ].join('\n');
  const allComponentString = [
    ...componentHeader,
    generateComponentIconImports([...allNames], 'all'),
    '',
    ...allComponentContent,
    ...componentExports,
  ].join('\n');

  await Promise.all([
    fs.writeFile(coreIconsPath, coreIconString),
    fs.writeFile(allIconsPath, allIconString),
    fs.writeFile(coreComponentsPath, coreComponentString),
    fs.writeFile(allComponentsPath, allComponentString),
  ]);
}

/**
 * Run the script and generate icons.
 */
async function run() {
  log.debug(chalk`Generating icons for {grey \`@remirror/react-components\`}`);
  const formatPath = [coreIconsPath, coreComponentsPath, allIconsPath, allComponentsPath].join(' ');

  await writeIconModule();
  await formatFiles(formatPath, { silent: true });

  log.debug(chalk`{green Icons generated} 🙌`);
}

run();
