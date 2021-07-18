/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LoadContext, Plugin } from '@docusaurus/types';
import {
  aliasedSitePath,
  encodePath,
  fileToPath,
  getFolderContainingFile,
  getPluginI18nPath,
} from '@docusaurus/utils';
import fs from 'fs/promises';
import globby from 'globby';
import path from 'path';
import { flattenArray, includes, sort } from '@remirror/core-helpers';

import { transformTypeScriptOnly } from './transform-typescript-only';
import {
  ExampleContent,
  ExampleFolderContent,
  ExamplesPluginData,
  LoadedContent,
  PagesContentPaths,
  PluginOptions,
  ValidExtension,
  validExtension,
} from './types';

function getContentPathList(contentPaths: PagesContentPaths): string[] {
  return [contentPaths.contentPathLocalized, contentPaths.contentPath];
}

/**
 * Safely get the stats for a file.
 */
async function getFileStat(target: string) {
  try {
    return fs.lstat(target);
  } catch {
    return;
  }
}

export default function pluginContentExamples(
  context: LoadContext,
  options: PluginOptions,
): Plugin<LoadedContent | null> {
  const {
    siteConfig,
    siteDir,
    i18n: { currentLocale },
  } = context;

  const contentPaths: PagesContentPaths = {
    contentPath: path.resolve(siteDir, options.path),
    contentPathLocalized: getPluginI18nPath({
      siteDir,
      locale: currentLocale,
      pluginName: 'docusaurus-plugin-examples',
      pluginId: options.id,
    }),
  };

  return {
    name: 'docusaurus-plugin-examples',

    getPathsToWatch() {
      const { include = [] } = options;
      return flattenArray(
        getContentPathList(contentPaths).map((contentPath) => {
          return include.map((pattern: string) => `${contentPath}/${pattern}`);
        }),
      );
    },

    async loadContent() {
      const { include, exclude } = options;
      const { baseUrl } = siteConfig;
      const pathStat = await getFileStat(contentPaths.contentPath);

      if (!pathStat) {
        return null;
      }

      const folderPaths: string[] = [];

      for (const folderName of await fs.readdir(contentPaths.contentPath)) {
        const folderPath = path.join(contentPaths.contentPath, folderName);
        const folderStat = await getFileStat(folderPath);

        // Only show directories.
        if (!folderStat?.isDirectory()) {
          continue;
        }

        const files = await fs.readdir(folderPath);

        // No empty directories without an index file.
        if (!files.find((file) => file.startsWith('index.'))) {
          continue;
        }

        folderPaths.push(folderPath);
      }

      const transformer = createExampleContentTransformer({
        contentPaths,
        baseUrl,
        ignore: exclude,
        include,
        siteDir,
      });

      return Promise.all(folderPaths.map(transformer));
    },

    async contentLoaded({ content, actions }) {
      if (!content) {
        return;
      }

      const { addRoute, setGlobalData } = actions;
      const data: ExamplesPluginData = {};

      await Promise.all(
        content.map(async (metadata) => {
          const { permalink, source, ts, js, id } = metadata;
          data[id] = { ts, js };
          addRoute({
            path: permalink,
            component: source,
            exact: true,
          });
        }),
      );

      // Store the data in a global json object.
      setGlobalData(data);
    },

    getThemePath() {
      // Where compiled JavaScript output lives
      return path.join(__dirname, '..', 'theme');
    },

    getTypeScriptThemePath() {
      // Where TypeScript source code lives
      return path.resolve(__dirname, '../src/theme');
    },
  };
}

interface CreateExampleContentTransformer {
  contentPaths: PagesContentPaths;
  baseUrl: string;
  siteDir: string;
  include: string[];
  ignore: string[];
}

function isValidExtension(value: string): value is ValidExtension {
  return includes(validExtension, value);
}

/**
 * Sort the files in alphabetical order with the index file as the first file.
 */
function sortFiles(files: ExampleFolderContent[]): ExampleFolderContent[] {
  return sort(files, (a, z) =>
    a.name.startsWith('index.')
      ? -1
      : z.name.startsWith('index.')
      ? 1
      : a.name.toLowerCase().localeCompare(z.name.toLowerCase()),
  );
}

function createExampleContentTransformer(props: CreateExampleContentTransformer) {
  const { contentPaths, siteDir, include, ignore, baseUrl } = props;

  return async (folderPath: string): Promise<ExampleContent> => {
    const files = await globby(include, { cwd: folderPath, ignore });
    const ts: ExampleFolderContent[] = [];
    const js: ExampleFolderContent[] = [];
    let entryPointName = 'index.tsx';

    for (const name of files) {
      const extension = path.extname(name);

      if (!isValidExtension(extension)) {
        continue;
      }

      const content = await fs.readFile(path.join(folderPath, name), { encoding: 'utf-8' });
      const jsConfig = {
        content,
        name,
        extension,
      };

      if (['.ts', '.tsx'].includes(extension)) {
        jsConfig.content = transformTypeScriptOnly(content);
        jsConfig.name = name.replace(/.tsx?$/, '.js');
        jsConfig.extension = '.js';
      }

      ts.push({ name, content, extension });
      js.push(jsConfig);

      if (name.startsWith('index.')) {
        entryPointName = name;
      }
    }

    sortFiles(ts);
    sortFiles(js);

    // The folder name in the examples folder.
    const id = path.basename(folderPath);

    // Lookup in localized folder in priority
    const contentPath = await getFolderContainingFile(
      getContentPathList(contentPaths),
      path.join(id, entryPointName),
    );

    const source = aliasedSitePath(path.join(contentPath, id, entryPointName), siteDir);
    const pathName = encodePath(fileToPath(`examples/${path.join(id, entryPointName)}`));
    const permalink = pathName.replace(/^\//, baseUrl || '');

    return { ts, js, id, permalink, source };
  };
}
