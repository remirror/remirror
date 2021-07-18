/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs/promises';
import path from 'path';
import {
  encodePath,
  fileToPath,
  aliasedSitePath,
  getPluginI18nPath,
  getFolderContainingFile,
} from '@docusaurus/utils';
import { LoadContext, Plugin } from '@docusaurus/types';
import { DEFAULT_PLUGIN_ID } from '@docusaurus/core/lib/constants';
import globby from 'globby';

import { flattenArray } from '@remirror/core-helpers';

export interface ExampleFolderContent {
  name: string;
  content: string;
}

interface ExampleContent {
  /** The name of the folder being used for the example */
  id: string;
  permalink: string;
  source: string;
  contents: ExampleFolderContent[];
}

type LoadedContent = ExampleContent[];

type PagesContentPaths = {
  contentPath: string;
  contentPathLocalized: string;
};

interface PluginOptions {
  id?: string;
  path: string;
  routeBasePath: string;
  include: string[];
  exclude: string[];
}

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
    generatedFilesDir,
    i18n: { currentLocale },
  } = context;

  const contentPaths: PagesContentPaths = {
    contentPath: path.resolve(siteDir, options.path),
    contentPathLocalized: getPluginI18nPath({
      siteDir,
      locale: currentLocale,
      pluginName: 'docusaurus-plugin-content-examples',
      pluginId: options.id,
    }),
  };

  const pluginDataDirRoot = path.join(generatedFilesDir, 'docusaurus-plugin-content-examples');
  const dataDir = path.join(pluginDataDirRoot, options.id ?? DEFAULT_PLUGIN_ID);

  return {
    name: 'docusaurus-plugin-content-examples',

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
      const data: Record<string, ExampleFolderContent[]> = {};

      await Promise.all(
        content.map(async (metadata) => {
          const { permalink, source, contents, id } = metadata;
          data[id] = contents;
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
  };
}

interface CreateExampleContentTransformer {
  contentPaths: PagesContentPaths;
  baseUrl: string;
  siteDir: string;
  include: string[];
  ignore: string[];
}

function createExampleContentTransformer(props: CreateExampleContentTransformer) {
  const { contentPaths, siteDir, include, ignore, baseUrl } = props;

  return async (folderPath: string): Promise<ExampleContent> => {
    const files = await globby(include, { cwd: folderPath, ignore });
    const contents: ExampleFolderContent[] = [];
    let entryPointName = 'index.tsx';

    for (const name of files) {
      const content = await fs.readFile(path.join(folderPath, name), { encoding: 'utf-8' });
      contents.push({ name, content });

      if (name.startsWith('index.')) {
        entryPointName = name;
      }
    }

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

    return { contents, id, permalink, source };
  };
}
