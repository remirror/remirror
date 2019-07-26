export interface RootLayoutProps {
  path: string;
  location: Location;
  pageResources: PageResources;
  uri: string;
  pageContext: PageContext;
  pathContext: PageContext;
}

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
