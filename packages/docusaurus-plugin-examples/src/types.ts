export const validExtension = ['.ts', '.tsx', '.js', '.jsx', '.json', '.mdx', '.md'] as const;
export type ValidExtension = typeof validExtension[number];

/**
 * The content for the named folder in examples.
 */
export interface ExampleFolderContent {
  name: string;
  content: string;
  extension: ValidExtension;
}

export interface ExampleContent extends ExampleContentSource {
  /** The name of the folder being used for the example */
  id: string;
  permalink: string;
  source: string;
}

export type LoadedContent = ExampleContent[];

export interface PagesContentPaths {
  contentPath: string;
  contentPathLocalized: string;
}
export interface PluginOptions {
  id?: string;
  path: string;
  routeBasePath: string;
  include: string[];
  exclude: string[];
}

interface ExampleContentSource {
  ts: ExampleFolderContent[];
  js: ExampleFolderContent[];
}

export type ExamplesPluginData = Record<string, ExampleContentSource>;

export interface BaseProps {
  /**
   * The name of the examples iframe to render.
   */
  name: string;

  /**
   * The source language to use.
   *
   * @default `ts`
   */
  language?: keyof ExampleContentSource;
}
