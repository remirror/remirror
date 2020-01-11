import { MdxFrontmatter } from 'docs/generated/gatsby.js';
import { ReplaceComponentRendererArgs } from 'gatsby';
import { Except } from 'type-fest';

export interface RootLayoutProps {
  path: string;
  location: Location;
  pageResources: PageResources;
  uri: string;
  pageContext: PageContext;
  pathContext: PageContext;
}

export type TemplateProps = Except<ReplaceComponentRendererArgs['props'], 'children'>;

interface PageResources {
  json: Json;
  page: Page;
}

interface Page {
  componentChunkName: string;
  path: string;
  webpackCompilationHash: string;
}

interface Json {
  pageContext: PageContext;
}

export interface BaseFrontMatter {
  title: string;
  fullWidth?: boolean;
}

interface PageContext<GFrontMatter extends BaseFrontMatter = BaseFrontMatter> {
  isCreatedByStatefulCreatePages: boolean;
  frontmatter?: GFrontMatter;
}

interface Location {
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  state?: any;
  key: string;
}

export type FrontMatterProps = Pick<MdxFrontmatter, 'fullWidth' | 'title'>;
