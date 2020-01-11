export type Maybe<T> = T;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  /** 
 * A date string, such as 2007-12-03, compliant with the ISO 8601 standard for
   * representation of dates and times using the Gregorian calendar.
 */
  Date: any,
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any,
};











export type BooleanQueryOperatorInput = {
  eq: Maybe<Scalars['Boolean']>,
  ne: Maybe<Scalars['Boolean']>,
  in: Maybe<Array<Maybe<Scalars['Boolean']>>>,
  nin: Maybe<Array<Maybe<Scalars['Boolean']>>>,
};


export type DateQueryOperatorInput = {
  eq: Maybe<Scalars['Date']>,
  ne: Maybe<Scalars['Date']>,
  gt: Maybe<Scalars['Date']>,
  gte: Maybe<Scalars['Date']>,
  lt: Maybe<Scalars['Date']>,
  lte: Maybe<Scalars['Date']>,
  in: Maybe<Array<Maybe<Scalars['Date']>>>,
  nin: Maybe<Array<Maybe<Scalars['Date']>>>,
};

export type Directory = Node & {
   __typename?: 'Directory',
  sourceInstanceName: Scalars['String'],
  absolutePath: Scalars['String'],
  relativePath: Scalars['String'],
  extension: Scalars['String'],
  size: Scalars['Int'],
  prettySize: Scalars['String'],
  modifiedTime: Scalars['Date'],
  accessTime: Scalars['Date'],
  changeTime: Scalars['Date'],
  birthTime: Scalars['Date'],
  root: Scalars['String'],
  dir: Scalars['String'],
  base: Scalars['String'],
  ext: Scalars['String'],
  name: Scalars['String'],
  relativeDirectory: Scalars['String'],
  dev: Scalars['Int'],
  mode: Scalars['Int'],
  nlink: Scalars['Int'],
  uid: Scalars['Int'],
  gid: Scalars['Int'],
  rdev: Scalars['Int'],
  ino: Scalars['Float'],
  atimeMs: Scalars['Float'],
  mtimeMs: Scalars['Float'],
  ctimeMs: Scalars['Float'],
  atime: Scalars['Date'],
  mtime: Scalars['Date'],
  ctime: Scalars['Date'],
  birthtime: Maybe<Scalars['Date']>,
  birthtimeMs: Maybe<Scalars['Float']>,
  blksize: Maybe<Scalars['Int']>,
  blocks: Maybe<Scalars['Int']>,
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
};


export type DirectoryModifiedTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type DirectoryAccessTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type DirectoryChangeTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type DirectoryBirthTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type DirectoryAtimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type DirectoryMtimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type DirectoryCtimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};

export type DirectoryConnection = {
   __typename?: 'DirectoryConnection',
  totalCount: Scalars['Int'],
  edges: Array<DirectoryEdge>,
  nodes: Array<Directory>,
  pageInfo: PageInfo,
  distinct: Array<Scalars['String']>,
  group: Array<DirectoryGroupConnection>,
};


export type DirectoryConnectionDistinctArgs = {
  field: DirectoryFieldsEnum
};


export type DirectoryConnectionGroupArgs = {
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>,
  field: DirectoryFieldsEnum
};

export type DirectoryEdge = {
   __typename?: 'DirectoryEdge',
  next: Maybe<Directory>,
  node: Directory,
  previous: Maybe<Directory>,
};

export enum DirectoryFieldsEnum {
  sourceInstanceName = 'sourceInstanceName',
  absolutePath = 'absolutePath',
  relativePath = 'relativePath',
  extension = 'extension',
  size = 'size',
  prettySize = 'prettySize',
  modifiedTime = 'modifiedTime',
  accessTime = 'accessTime',
  changeTime = 'changeTime',
  birthTime = 'birthTime',
  root = 'root',
  dir = 'dir',
  base = 'base',
  ext = 'ext',
  name = 'name',
  relativeDirectory = 'relativeDirectory',
  dev = 'dev',
  mode = 'mode',
  nlink = 'nlink',
  uid = 'uid',
  gid = 'gid',
  rdev = 'rdev',
  ino = 'ino',
  atimeMs = 'atimeMs',
  mtimeMs = 'mtimeMs',
  ctimeMs = 'ctimeMs',
  atime = 'atime',
  mtime = 'mtime',
  ctime = 'ctime',
  birthtime = 'birthtime',
  birthtimeMs = 'birthtimeMs',
  blksize = 'blksize',
  blocks = 'blocks',
  id = 'id',
  parent___id = 'parent___id',
  parent___parent___id = 'parent___parent___id',
  parent___parent___parent___id = 'parent___parent___parent___id',
  parent___parent___parent___children = 'parent___parent___parent___children',
  parent___parent___children = 'parent___parent___children',
  parent___parent___children___id = 'parent___parent___children___id',
  parent___parent___children___children = 'parent___parent___children___children',
  parent___parent___internal___content = 'parent___parent___internal___content',
  parent___parent___internal___contentDigest = 'parent___parent___internal___contentDigest',
  parent___parent___internal___description = 'parent___parent___internal___description',
  parent___parent___internal___fieldOwners = 'parent___parent___internal___fieldOwners',
  parent___parent___internal___ignoreType = 'parent___parent___internal___ignoreType',
  parent___parent___internal___mediaType = 'parent___parent___internal___mediaType',
  parent___parent___internal___owner = 'parent___parent___internal___owner',
  parent___parent___internal___type = 'parent___parent___internal___type',
  parent___children = 'parent___children',
  parent___children___id = 'parent___children___id',
  parent___children___parent___id = 'parent___children___parent___id',
  parent___children___parent___children = 'parent___children___parent___children',
  parent___children___children = 'parent___children___children',
  parent___children___children___id = 'parent___children___children___id',
  parent___children___children___children = 'parent___children___children___children',
  parent___children___internal___content = 'parent___children___internal___content',
  parent___children___internal___contentDigest = 'parent___children___internal___contentDigest',
  parent___children___internal___description = 'parent___children___internal___description',
  parent___children___internal___fieldOwners = 'parent___children___internal___fieldOwners',
  parent___children___internal___ignoreType = 'parent___children___internal___ignoreType',
  parent___children___internal___mediaType = 'parent___children___internal___mediaType',
  parent___children___internal___owner = 'parent___children___internal___owner',
  parent___children___internal___type = 'parent___children___internal___type',
  parent___internal___content = 'parent___internal___content',
  parent___internal___contentDigest = 'parent___internal___contentDigest',
  parent___internal___description = 'parent___internal___description',
  parent___internal___fieldOwners = 'parent___internal___fieldOwners',
  parent___internal___ignoreType = 'parent___internal___ignoreType',
  parent___internal___mediaType = 'parent___internal___mediaType',
  parent___internal___owner = 'parent___internal___owner',
  parent___internal___type = 'parent___internal___type',
  children = 'children',
  children___id = 'children___id',
  children___parent___id = 'children___parent___id',
  children___parent___parent___id = 'children___parent___parent___id',
  children___parent___parent___children = 'children___parent___parent___children',
  children___parent___children = 'children___parent___children',
  children___parent___children___id = 'children___parent___children___id',
  children___parent___children___children = 'children___parent___children___children',
  children___parent___internal___content = 'children___parent___internal___content',
  children___parent___internal___contentDigest = 'children___parent___internal___contentDigest',
  children___parent___internal___description = 'children___parent___internal___description',
  children___parent___internal___fieldOwners = 'children___parent___internal___fieldOwners',
  children___parent___internal___ignoreType = 'children___parent___internal___ignoreType',
  children___parent___internal___mediaType = 'children___parent___internal___mediaType',
  children___parent___internal___owner = 'children___parent___internal___owner',
  children___parent___internal___type = 'children___parent___internal___type',
  children___children = 'children___children',
  children___children___id = 'children___children___id',
  children___children___parent___id = 'children___children___parent___id',
  children___children___parent___children = 'children___children___parent___children',
  children___children___children = 'children___children___children',
  children___children___children___id = 'children___children___children___id',
  children___children___children___children = 'children___children___children___children',
  children___children___internal___content = 'children___children___internal___content',
  children___children___internal___contentDigest = 'children___children___internal___contentDigest',
  children___children___internal___description = 'children___children___internal___description',
  children___children___internal___fieldOwners = 'children___children___internal___fieldOwners',
  children___children___internal___ignoreType = 'children___children___internal___ignoreType',
  children___children___internal___mediaType = 'children___children___internal___mediaType',
  children___children___internal___owner = 'children___children___internal___owner',
  children___children___internal___type = 'children___children___internal___type',
  children___internal___content = 'children___internal___content',
  children___internal___contentDigest = 'children___internal___contentDigest',
  children___internal___description = 'children___internal___description',
  children___internal___fieldOwners = 'children___internal___fieldOwners',
  children___internal___ignoreType = 'children___internal___ignoreType',
  children___internal___mediaType = 'children___internal___mediaType',
  children___internal___owner = 'children___internal___owner',
  children___internal___type = 'children___internal___type',
  internal___content = 'internal___content',
  internal___contentDigest = 'internal___contentDigest',
  internal___description = 'internal___description',
  internal___fieldOwners = 'internal___fieldOwners',
  internal___ignoreType = 'internal___ignoreType',
  internal___mediaType = 'internal___mediaType',
  internal___owner = 'internal___owner',
  internal___type = 'internal___type'
}

export type DirectoryFilterInput = {
  sourceInstanceName: Maybe<StringQueryOperatorInput>,
  absolutePath: Maybe<StringQueryOperatorInput>,
  relativePath: Maybe<StringQueryOperatorInput>,
  extension: Maybe<StringQueryOperatorInput>,
  size: Maybe<IntQueryOperatorInput>,
  prettySize: Maybe<StringQueryOperatorInput>,
  modifiedTime: Maybe<DateQueryOperatorInput>,
  accessTime: Maybe<DateQueryOperatorInput>,
  changeTime: Maybe<DateQueryOperatorInput>,
  birthTime: Maybe<DateQueryOperatorInput>,
  root: Maybe<StringQueryOperatorInput>,
  dir: Maybe<StringQueryOperatorInput>,
  base: Maybe<StringQueryOperatorInput>,
  ext: Maybe<StringQueryOperatorInput>,
  name: Maybe<StringQueryOperatorInput>,
  relativeDirectory: Maybe<StringQueryOperatorInput>,
  dev: Maybe<IntQueryOperatorInput>,
  mode: Maybe<IntQueryOperatorInput>,
  nlink: Maybe<IntQueryOperatorInput>,
  uid: Maybe<IntQueryOperatorInput>,
  gid: Maybe<IntQueryOperatorInput>,
  rdev: Maybe<IntQueryOperatorInput>,
  ino: Maybe<FloatQueryOperatorInput>,
  atimeMs: Maybe<FloatQueryOperatorInput>,
  mtimeMs: Maybe<FloatQueryOperatorInput>,
  ctimeMs: Maybe<FloatQueryOperatorInput>,
  atime: Maybe<DateQueryOperatorInput>,
  mtime: Maybe<DateQueryOperatorInput>,
  ctime: Maybe<DateQueryOperatorInput>,
  birthtime: Maybe<DateQueryOperatorInput>,
  birthtimeMs: Maybe<FloatQueryOperatorInput>,
  blksize: Maybe<IntQueryOperatorInput>,
  blocks: Maybe<IntQueryOperatorInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
};

export type DirectoryGroupConnection = {
   __typename?: 'DirectoryGroupConnection',
  totalCount: Scalars['Int'],
  edges: Array<DirectoryEdge>,
  nodes: Array<Directory>,
  pageInfo: PageInfo,
  field: Scalars['String'],
  fieldValue: Maybe<Scalars['String']>,
};

export type DirectorySortInput = {
  fields: Maybe<Array<Maybe<DirectoryFieldsEnum>>>,
  order: Maybe<Array<Maybe<SortOrderEnum>>>,
};

export type DuotoneGradient = {
  highlight: Scalars['String'],
  shadow: Scalars['String'],
  opacity: Maybe<Scalars['Int']>,
};

export type File = Node & {
   __typename?: 'File',
  sourceInstanceName: Scalars['String'],
  absolutePath: Scalars['String'],
  relativePath: Scalars['String'],
  extension: Scalars['String'],
  size: Scalars['Int'],
  prettySize: Scalars['String'],
  modifiedTime: Scalars['Date'],
  accessTime: Scalars['Date'],
  changeTime: Scalars['Date'],
  birthTime: Scalars['Date'],
  root: Scalars['String'],
  dir: Scalars['String'],
  base: Scalars['String'],
  ext: Scalars['String'],
  name: Scalars['String'],
  relativeDirectory: Scalars['String'],
  dev: Scalars['Int'],
  mode: Scalars['Int'],
  nlink: Scalars['Int'],
  uid: Scalars['Int'],
  gid: Scalars['Int'],
  rdev: Scalars['Int'],
  ino: Scalars['Float'],
  atimeMs: Scalars['Float'],
  mtimeMs: Scalars['Float'],
  ctimeMs: Scalars['Float'],
  atime: Scalars['Date'],
  mtime: Scalars['Date'],
  ctime: Scalars['Date'],
  birthtime: Maybe<Scalars['Date']>,
  birthtimeMs: Maybe<Scalars['Float']>,
  blksize: Maybe<Scalars['Int']>,
  blocks: Maybe<Scalars['Int']>,
  /** Copy file to static directory and return public url to it */
  publicURL: Maybe<Scalars['String']>,
  childImageSharp: Maybe<ImageSharp>,
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
  childMdx: Maybe<Mdx>,
};


export type FileModifiedTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type FileAccessTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type FileChangeTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type FileBirthTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type FileAtimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type FileMtimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};


export type FileCtimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};

export type FileConnection = {
   __typename?: 'FileConnection',
  totalCount: Scalars['Int'],
  edges: Array<FileEdge>,
  nodes: Array<File>,
  pageInfo: PageInfo,
  distinct: Array<Scalars['String']>,
  group: Array<FileGroupConnection>,
};


export type FileConnectionDistinctArgs = {
  field: FileFieldsEnum
};


export type FileConnectionGroupArgs = {
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>,
  field: FileFieldsEnum
};

export type FileEdge = {
   __typename?: 'FileEdge',
  next: Maybe<File>,
  node: File,
  previous: Maybe<File>,
};

export enum FileFieldsEnum {
  sourceInstanceName = 'sourceInstanceName',
  absolutePath = 'absolutePath',
  relativePath = 'relativePath',
  extension = 'extension',
  size = 'size',
  prettySize = 'prettySize',
  modifiedTime = 'modifiedTime',
  accessTime = 'accessTime',
  changeTime = 'changeTime',
  birthTime = 'birthTime',
  root = 'root',
  dir = 'dir',
  base = 'base',
  ext = 'ext',
  name = 'name',
  relativeDirectory = 'relativeDirectory',
  dev = 'dev',
  mode = 'mode',
  nlink = 'nlink',
  uid = 'uid',
  gid = 'gid',
  rdev = 'rdev',
  ino = 'ino',
  atimeMs = 'atimeMs',
  mtimeMs = 'mtimeMs',
  ctimeMs = 'ctimeMs',
  atime = 'atime',
  mtime = 'mtime',
  ctime = 'ctime',
  birthtime = 'birthtime',
  birthtimeMs = 'birthtimeMs',
  blksize = 'blksize',
  blocks = 'blocks',
  publicURL = 'publicURL',
  childImageSharp___fixed___base64 = 'childImageSharp___fixed___base64',
  childImageSharp___fixed___tracedSVG = 'childImageSharp___fixed___tracedSVG',
  childImageSharp___fixed___aspectRatio = 'childImageSharp___fixed___aspectRatio',
  childImageSharp___fixed___width = 'childImageSharp___fixed___width',
  childImageSharp___fixed___height = 'childImageSharp___fixed___height',
  childImageSharp___fixed___src = 'childImageSharp___fixed___src',
  childImageSharp___fixed___srcSet = 'childImageSharp___fixed___srcSet',
  childImageSharp___fixed___srcWebp = 'childImageSharp___fixed___srcWebp',
  childImageSharp___fixed___srcSetWebp = 'childImageSharp___fixed___srcSetWebp',
  childImageSharp___fixed___originalName = 'childImageSharp___fixed___originalName',
  childImageSharp___resolutions___base64 = 'childImageSharp___resolutions___base64',
  childImageSharp___resolutions___tracedSVG = 'childImageSharp___resolutions___tracedSVG',
  childImageSharp___resolutions___aspectRatio = 'childImageSharp___resolutions___aspectRatio',
  childImageSharp___resolutions___width = 'childImageSharp___resolutions___width',
  childImageSharp___resolutions___height = 'childImageSharp___resolutions___height',
  childImageSharp___resolutions___src = 'childImageSharp___resolutions___src',
  childImageSharp___resolutions___srcSet = 'childImageSharp___resolutions___srcSet',
  childImageSharp___resolutions___srcWebp = 'childImageSharp___resolutions___srcWebp',
  childImageSharp___resolutions___srcSetWebp = 'childImageSharp___resolutions___srcSetWebp',
  childImageSharp___resolutions___originalName = 'childImageSharp___resolutions___originalName',
  childImageSharp___fluid___base64 = 'childImageSharp___fluid___base64',
  childImageSharp___fluid___tracedSVG = 'childImageSharp___fluid___tracedSVG',
  childImageSharp___fluid___aspectRatio = 'childImageSharp___fluid___aspectRatio',
  childImageSharp___fluid___src = 'childImageSharp___fluid___src',
  childImageSharp___fluid___srcSet = 'childImageSharp___fluid___srcSet',
  childImageSharp___fluid___srcWebp = 'childImageSharp___fluid___srcWebp',
  childImageSharp___fluid___srcSetWebp = 'childImageSharp___fluid___srcSetWebp',
  childImageSharp___fluid___sizes = 'childImageSharp___fluid___sizes',
  childImageSharp___fluid___originalImg = 'childImageSharp___fluid___originalImg',
  childImageSharp___fluid___originalName = 'childImageSharp___fluid___originalName',
  childImageSharp___fluid___presentationWidth = 'childImageSharp___fluid___presentationWidth',
  childImageSharp___fluid___presentationHeight = 'childImageSharp___fluid___presentationHeight',
  childImageSharp___sizes___base64 = 'childImageSharp___sizes___base64',
  childImageSharp___sizes___tracedSVG = 'childImageSharp___sizes___tracedSVG',
  childImageSharp___sizes___aspectRatio = 'childImageSharp___sizes___aspectRatio',
  childImageSharp___sizes___src = 'childImageSharp___sizes___src',
  childImageSharp___sizes___srcSet = 'childImageSharp___sizes___srcSet',
  childImageSharp___sizes___srcWebp = 'childImageSharp___sizes___srcWebp',
  childImageSharp___sizes___srcSetWebp = 'childImageSharp___sizes___srcSetWebp',
  childImageSharp___sizes___sizes = 'childImageSharp___sizes___sizes',
  childImageSharp___sizes___originalImg = 'childImageSharp___sizes___originalImg',
  childImageSharp___sizes___originalName = 'childImageSharp___sizes___originalName',
  childImageSharp___sizes___presentationWidth = 'childImageSharp___sizes___presentationWidth',
  childImageSharp___sizes___presentationHeight = 'childImageSharp___sizes___presentationHeight',
  childImageSharp___original___width = 'childImageSharp___original___width',
  childImageSharp___original___height = 'childImageSharp___original___height',
  childImageSharp___original___src = 'childImageSharp___original___src',
  childImageSharp___resize___src = 'childImageSharp___resize___src',
  childImageSharp___resize___tracedSVG = 'childImageSharp___resize___tracedSVG',
  childImageSharp___resize___width = 'childImageSharp___resize___width',
  childImageSharp___resize___height = 'childImageSharp___resize___height',
  childImageSharp___resize___aspectRatio = 'childImageSharp___resize___aspectRatio',
  childImageSharp___resize___originalName = 'childImageSharp___resize___originalName',
  childImageSharp___id = 'childImageSharp___id',
  childImageSharp___parent___id = 'childImageSharp___parent___id',
  childImageSharp___parent___parent___id = 'childImageSharp___parent___parent___id',
  childImageSharp___parent___parent___children = 'childImageSharp___parent___parent___children',
  childImageSharp___parent___children = 'childImageSharp___parent___children',
  childImageSharp___parent___children___id = 'childImageSharp___parent___children___id',
  childImageSharp___parent___children___children = 'childImageSharp___parent___children___children',
  childImageSharp___parent___internal___content = 'childImageSharp___parent___internal___content',
  childImageSharp___parent___internal___contentDigest = 'childImageSharp___parent___internal___contentDigest',
  childImageSharp___parent___internal___description = 'childImageSharp___parent___internal___description',
  childImageSharp___parent___internal___fieldOwners = 'childImageSharp___parent___internal___fieldOwners',
  childImageSharp___parent___internal___ignoreType = 'childImageSharp___parent___internal___ignoreType',
  childImageSharp___parent___internal___mediaType = 'childImageSharp___parent___internal___mediaType',
  childImageSharp___parent___internal___owner = 'childImageSharp___parent___internal___owner',
  childImageSharp___parent___internal___type = 'childImageSharp___parent___internal___type',
  childImageSharp___children = 'childImageSharp___children',
  childImageSharp___children___id = 'childImageSharp___children___id',
  childImageSharp___children___parent___id = 'childImageSharp___children___parent___id',
  childImageSharp___children___parent___children = 'childImageSharp___children___parent___children',
  childImageSharp___children___children = 'childImageSharp___children___children',
  childImageSharp___children___children___id = 'childImageSharp___children___children___id',
  childImageSharp___children___children___children = 'childImageSharp___children___children___children',
  childImageSharp___children___internal___content = 'childImageSharp___children___internal___content',
  childImageSharp___children___internal___contentDigest = 'childImageSharp___children___internal___contentDigest',
  childImageSharp___children___internal___description = 'childImageSharp___children___internal___description',
  childImageSharp___children___internal___fieldOwners = 'childImageSharp___children___internal___fieldOwners',
  childImageSharp___children___internal___ignoreType = 'childImageSharp___children___internal___ignoreType',
  childImageSharp___children___internal___mediaType = 'childImageSharp___children___internal___mediaType',
  childImageSharp___children___internal___owner = 'childImageSharp___children___internal___owner',
  childImageSharp___children___internal___type = 'childImageSharp___children___internal___type',
  childImageSharp___internal___content = 'childImageSharp___internal___content',
  childImageSharp___internal___contentDigest = 'childImageSharp___internal___contentDigest',
  childImageSharp___internal___description = 'childImageSharp___internal___description',
  childImageSharp___internal___fieldOwners = 'childImageSharp___internal___fieldOwners',
  childImageSharp___internal___ignoreType = 'childImageSharp___internal___ignoreType',
  childImageSharp___internal___mediaType = 'childImageSharp___internal___mediaType',
  childImageSharp___internal___owner = 'childImageSharp___internal___owner',
  childImageSharp___internal___type = 'childImageSharp___internal___type',
  id = 'id',
  parent___id = 'parent___id',
  parent___parent___id = 'parent___parent___id',
  parent___parent___parent___id = 'parent___parent___parent___id',
  parent___parent___parent___children = 'parent___parent___parent___children',
  parent___parent___children = 'parent___parent___children',
  parent___parent___children___id = 'parent___parent___children___id',
  parent___parent___children___children = 'parent___parent___children___children',
  parent___parent___internal___content = 'parent___parent___internal___content',
  parent___parent___internal___contentDigest = 'parent___parent___internal___contentDigest',
  parent___parent___internal___description = 'parent___parent___internal___description',
  parent___parent___internal___fieldOwners = 'parent___parent___internal___fieldOwners',
  parent___parent___internal___ignoreType = 'parent___parent___internal___ignoreType',
  parent___parent___internal___mediaType = 'parent___parent___internal___mediaType',
  parent___parent___internal___owner = 'parent___parent___internal___owner',
  parent___parent___internal___type = 'parent___parent___internal___type',
  parent___children = 'parent___children',
  parent___children___id = 'parent___children___id',
  parent___children___parent___id = 'parent___children___parent___id',
  parent___children___parent___children = 'parent___children___parent___children',
  parent___children___children = 'parent___children___children',
  parent___children___children___id = 'parent___children___children___id',
  parent___children___children___children = 'parent___children___children___children',
  parent___children___internal___content = 'parent___children___internal___content',
  parent___children___internal___contentDigest = 'parent___children___internal___contentDigest',
  parent___children___internal___description = 'parent___children___internal___description',
  parent___children___internal___fieldOwners = 'parent___children___internal___fieldOwners',
  parent___children___internal___ignoreType = 'parent___children___internal___ignoreType',
  parent___children___internal___mediaType = 'parent___children___internal___mediaType',
  parent___children___internal___owner = 'parent___children___internal___owner',
  parent___children___internal___type = 'parent___children___internal___type',
  parent___internal___content = 'parent___internal___content',
  parent___internal___contentDigest = 'parent___internal___contentDigest',
  parent___internal___description = 'parent___internal___description',
  parent___internal___fieldOwners = 'parent___internal___fieldOwners',
  parent___internal___ignoreType = 'parent___internal___ignoreType',
  parent___internal___mediaType = 'parent___internal___mediaType',
  parent___internal___owner = 'parent___internal___owner',
  parent___internal___type = 'parent___internal___type',
  children = 'children',
  children___id = 'children___id',
  children___parent___id = 'children___parent___id',
  children___parent___parent___id = 'children___parent___parent___id',
  children___parent___parent___children = 'children___parent___parent___children',
  children___parent___children = 'children___parent___children',
  children___parent___children___id = 'children___parent___children___id',
  children___parent___children___children = 'children___parent___children___children',
  children___parent___internal___content = 'children___parent___internal___content',
  children___parent___internal___contentDigest = 'children___parent___internal___contentDigest',
  children___parent___internal___description = 'children___parent___internal___description',
  children___parent___internal___fieldOwners = 'children___parent___internal___fieldOwners',
  children___parent___internal___ignoreType = 'children___parent___internal___ignoreType',
  children___parent___internal___mediaType = 'children___parent___internal___mediaType',
  children___parent___internal___owner = 'children___parent___internal___owner',
  children___parent___internal___type = 'children___parent___internal___type',
  children___children = 'children___children',
  children___children___id = 'children___children___id',
  children___children___parent___id = 'children___children___parent___id',
  children___children___parent___children = 'children___children___parent___children',
  children___children___children = 'children___children___children',
  children___children___children___id = 'children___children___children___id',
  children___children___children___children = 'children___children___children___children',
  children___children___internal___content = 'children___children___internal___content',
  children___children___internal___contentDigest = 'children___children___internal___contentDigest',
  children___children___internal___description = 'children___children___internal___description',
  children___children___internal___fieldOwners = 'children___children___internal___fieldOwners',
  children___children___internal___ignoreType = 'children___children___internal___ignoreType',
  children___children___internal___mediaType = 'children___children___internal___mediaType',
  children___children___internal___owner = 'children___children___internal___owner',
  children___children___internal___type = 'children___children___internal___type',
  children___internal___content = 'children___internal___content',
  children___internal___contentDigest = 'children___internal___contentDigest',
  children___internal___description = 'children___internal___description',
  children___internal___fieldOwners = 'children___internal___fieldOwners',
  children___internal___ignoreType = 'children___internal___ignoreType',
  children___internal___mediaType = 'children___internal___mediaType',
  children___internal___owner = 'children___internal___owner',
  children___internal___type = 'children___internal___type',
  internal___content = 'internal___content',
  internal___contentDigest = 'internal___contentDigest',
  internal___description = 'internal___description',
  internal___fieldOwners = 'internal___fieldOwners',
  internal___ignoreType = 'internal___ignoreType',
  internal___mediaType = 'internal___mediaType',
  internal___owner = 'internal___owner',
  internal___type = 'internal___type',
  childMdx___rawBody = 'childMdx___rawBody',
  childMdx___fileAbsolutePath = 'childMdx___fileAbsolutePath',
  childMdx___frontmatter___title = 'childMdx___frontmatter___title',
  childMdx___frontmatter___fullWidth = 'childMdx___frontmatter___fullWidth',
  childMdx___body = 'childMdx___body',
  childMdx___excerpt = 'childMdx___excerpt',
  childMdx___headings = 'childMdx___headings',
  childMdx___headings___value = 'childMdx___headings___value',
  childMdx___headings___depth = 'childMdx___headings___depth',
  childMdx___html = 'childMdx___html',
  childMdx___mdxAST = 'childMdx___mdxAST',
  childMdx___tableOfContents = 'childMdx___tableOfContents',
  childMdx___timeToRead = 'childMdx___timeToRead',
  childMdx___wordCount___paragraphs = 'childMdx___wordCount___paragraphs',
  childMdx___wordCount___sentences = 'childMdx___wordCount___sentences',
  childMdx___wordCount___words = 'childMdx___wordCount___words',
  childMdx___fields___slug = 'childMdx___fields___slug',
  childMdx___id = 'childMdx___id',
  childMdx___parent___id = 'childMdx___parent___id',
  childMdx___parent___parent___id = 'childMdx___parent___parent___id',
  childMdx___parent___parent___children = 'childMdx___parent___parent___children',
  childMdx___parent___children = 'childMdx___parent___children',
  childMdx___parent___children___id = 'childMdx___parent___children___id',
  childMdx___parent___children___children = 'childMdx___parent___children___children',
  childMdx___parent___internal___content = 'childMdx___parent___internal___content',
  childMdx___parent___internal___contentDigest = 'childMdx___parent___internal___contentDigest',
  childMdx___parent___internal___description = 'childMdx___parent___internal___description',
  childMdx___parent___internal___fieldOwners = 'childMdx___parent___internal___fieldOwners',
  childMdx___parent___internal___ignoreType = 'childMdx___parent___internal___ignoreType',
  childMdx___parent___internal___mediaType = 'childMdx___parent___internal___mediaType',
  childMdx___parent___internal___owner = 'childMdx___parent___internal___owner',
  childMdx___parent___internal___type = 'childMdx___parent___internal___type',
  childMdx___children = 'childMdx___children',
  childMdx___children___id = 'childMdx___children___id',
  childMdx___children___parent___id = 'childMdx___children___parent___id',
  childMdx___children___parent___children = 'childMdx___children___parent___children',
  childMdx___children___children = 'childMdx___children___children',
  childMdx___children___children___id = 'childMdx___children___children___id',
  childMdx___children___children___children = 'childMdx___children___children___children',
  childMdx___children___internal___content = 'childMdx___children___internal___content',
  childMdx___children___internal___contentDigest = 'childMdx___children___internal___contentDigest',
  childMdx___children___internal___description = 'childMdx___children___internal___description',
  childMdx___children___internal___fieldOwners = 'childMdx___children___internal___fieldOwners',
  childMdx___children___internal___ignoreType = 'childMdx___children___internal___ignoreType',
  childMdx___children___internal___mediaType = 'childMdx___children___internal___mediaType',
  childMdx___children___internal___owner = 'childMdx___children___internal___owner',
  childMdx___children___internal___type = 'childMdx___children___internal___type',
  childMdx___internal___content = 'childMdx___internal___content',
  childMdx___internal___contentDigest = 'childMdx___internal___contentDigest',
  childMdx___internal___description = 'childMdx___internal___description',
  childMdx___internal___fieldOwners = 'childMdx___internal___fieldOwners',
  childMdx___internal___ignoreType = 'childMdx___internal___ignoreType',
  childMdx___internal___mediaType = 'childMdx___internal___mediaType',
  childMdx___internal___owner = 'childMdx___internal___owner',
  childMdx___internal___type = 'childMdx___internal___type'
}

export type FileFilterInput = {
  sourceInstanceName: Maybe<StringQueryOperatorInput>,
  absolutePath: Maybe<StringQueryOperatorInput>,
  relativePath: Maybe<StringQueryOperatorInput>,
  extension: Maybe<StringQueryOperatorInput>,
  size: Maybe<IntQueryOperatorInput>,
  prettySize: Maybe<StringQueryOperatorInput>,
  modifiedTime: Maybe<DateQueryOperatorInput>,
  accessTime: Maybe<DateQueryOperatorInput>,
  changeTime: Maybe<DateQueryOperatorInput>,
  birthTime: Maybe<DateQueryOperatorInput>,
  root: Maybe<StringQueryOperatorInput>,
  dir: Maybe<StringQueryOperatorInput>,
  base: Maybe<StringQueryOperatorInput>,
  ext: Maybe<StringQueryOperatorInput>,
  name: Maybe<StringQueryOperatorInput>,
  relativeDirectory: Maybe<StringQueryOperatorInput>,
  dev: Maybe<IntQueryOperatorInput>,
  mode: Maybe<IntQueryOperatorInput>,
  nlink: Maybe<IntQueryOperatorInput>,
  uid: Maybe<IntQueryOperatorInput>,
  gid: Maybe<IntQueryOperatorInput>,
  rdev: Maybe<IntQueryOperatorInput>,
  ino: Maybe<FloatQueryOperatorInput>,
  atimeMs: Maybe<FloatQueryOperatorInput>,
  mtimeMs: Maybe<FloatQueryOperatorInput>,
  ctimeMs: Maybe<FloatQueryOperatorInput>,
  atime: Maybe<DateQueryOperatorInput>,
  mtime: Maybe<DateQueryOperatorInput>,
  ctime: Maybe<DateQueryOperatorInput>,
  birthtime: Maybe<DateQueryOperatorInput>,
  birthtimeMs: Maybe<FloatQueryOperatorInput>,
  blksize: Maybe<IntQueryOperatorInput>,
  blocks: Maybe<IntQueryOperatorInput>,
  publicURL: Maybe<StringQueryOperatorInput>,
  childImageSharp: Maybe<ImageSharpFilterInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  childMdx: Maybe<MdxFilterInput>,
};

export type FileGroupConnection = {
   __typename?: 'FileGroupConnection',
  totalCount: Scalars['Int'],
  edges: Array<FileEdge>,
  nodes: Array<File>,
  pageInfo: PageInfo,
  field: Scalars['String'],
  fieldValue: Maybe<Scalars['String']>,
};

export type FileSortInput = {
  fields: Maybe<Array<Maybe<FileFieldsEnum>>>,
  order: Maybe<Array<Maybe<SortOrderEnum>>>,
};

export type FloatQueryOperatorInput = {
  eq: Maybe<Scalars['Float']>,
  ne: Maybe<Scalars['Float']>,
  gt: Maybe<Scalars['Float']>,
  gte: Maybe<Scalars['Float']>,
  lt: Maybe<Scalars['Float']>,
  lte: Maybe<Scalars['Float']>,
  in: Maybe<Array<Maybe<Scalars['Float']>>>,
  nin: Maybe<Array<Maybe<Scalars['Float']>>>,
};

export enum HeadingsMdx {
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  h4 = 'h4',
  h5 = 'h5',
  h6 = 'h6'
}

export enum ImageCropFocus {
  CENTER = 'CENTER',
  NORTH = 'NORTH',
  NORTHEAST = 'NORTHEAST',
  EAST = 'EAST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTH = 'SOUTH',
  SOUTHWEST = 'SOUTHWEST',
  WEST = 'WEST',
  NORTHWEST = 'NORTHWEST',
  ENTROPY = 'ENTROPY',
  ATTENTION = 'ATTENTION'
}

export enum ImageFit {
  COVER = 'COVER',
  CONTAIN = 'CONTAIN',
  FILL = 'FILL'
}

export enum ImageFormat {
  NO_CHANGE = 'NO_CHANGE',
  JPG = 'JPG',
  PNG = 'PNG',
  WEBP = 'WEBP'
}

export type ImageSharp = Node & {
   __typename?: 'ImageSharp',
  fixed: Maybe<ImageSharpFixed>,
  resolutions: Maybe<ImageSharpResolutions>,
  fluid: Maybe<ImageSharpFluid>,
  sizes: Maybe<ImageSharpSizes>,
  original: Maybe<ImageSharpOriginal>,
  resize: Maybe<ImageSharpResize>,
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
};


export type ImageSharpFixedArgs = {
  width: Maybe<Scalars['Int']>,
  height: Maybe<Scalars['Int']>,
  base64Width: Maybe<Scalars['Int']>,
  jpegProgressive?: Maybe<Scalars['Boolean']>,
  pngCompressionSpeed?: Maybe<Scalars['Int']>,
  grayscale?: Maybe<Scalars['Boolean']>,
  duotone: Maybe<DuotoneGradient>,
  traceSVG: Maybe<Potrace>,
  quality: Maybe<Scalars['Int']>,
  jpegQuality: Maybe<Scalars['Int']>,
  pngQuality: Maybe<Scalars['Int']>,
  webpQuality: Maybe<Scalars['Int']>,
  toFormat?: Maybe<ImageFormat>,
  toFormatBase64?: Maybe<ImageFormat>,
  cropFocus?: Maybe<ImageCropFocus>,
  fit?: Maybe<ImageFit>,
  background?: Maybe<Scalars['String']>,
  rotate?: Maybe<Scalars['Int']>,
  trim?: Maybe<Scalars['Float']>
};


export type ImageSharpResolutionsArgs = {
  width: Maybe<Scalars['Int']>,
  height: Maybe<Scalars['Int']>,
  base64Width: Maybe<Scalars['Int']>,
  jpegProgressive?: Maybe<Scalars['Boolean']>,
  pngCompressionSpeed?: Maybe<Scalars['Int']>,
  grayscale?: Maybe<Scalars['Boolean']>,
  duotone: Maybe<DuotoneGradient>,
  traceSVG: Maybe<Potrace>,
  quality: Maybe<Scalars['Int']>,
  jpegQuality: Maybe<Scalars['Int']>,
  pngQuality: Maybe<Scalars['Int']>,
  webpQuality: Maybe<Scalars['Int']>,
  toFormat?: Maybe<ImageFormat>,
  toFormatBase64?: Maybe<ImageFormat>,
  cropFocus?: Maybe<ImageCropFocus>,
  fit?: Maybe<ImageFit>,
  background?: Maybe<Scalars['String']>,
  rotate?: Maybe<Scalars['Int']>,
  trim?: Maybe<Scalars['Float']>
};


export type ImageSharpFluidArgs = {
  maxWidth: Maybe<Scalars['Int']>,
  maxHeight: Maybe<Scalars['Int']>,
  base64Width: Maybe<Scalars['Int']>,
  grayscale?: Maybe<Scalars['Boolean']>,
  jpegProgressive?: Maybe<Scalars['Boolean']>,
  pngCompressionSpeed?: Maybe<Scalars['Int']>,
  duotone: Maybe<DuotoneGradient>,
  traceSVG: Maybe<Potrace>,
  quality: Maybe<Scalars['Int']>,
  jpegQuality: Maybe<Scalars['Int']>,
  pngQuality: Maybe<Scalars['Int']>,
  webpQuality: Maybe<Scalars['Int']>,
  toFormat?: Maybe<ImageFormat>,
  toFormatBase64?: Maybe<ImageFormat>,
  cropFocus?: Maybe<ImageCropFocus>,
  fit?: Maybe<ImageFit>,
  background?: Maybe<Scalars['String']>,
  rotate?: Maybe<Scalars['Int']>,
  trim?: Maybe<Scalars['Float']>,
  sizes?: Maybe<Scalars['String']>,
  srcSetBreakpoints?: Maybe<Array<Maybe<Scalars['Int']>>>
};


export type ImageSharpSizesArgs = {
  maxWidth: Maybe<Scalars['Int']>,
  maxHeight: Maybe<Scalars['Int']>,
  base64Width: Maybe<Scalars['Int']>,
  grayscale?: Maybe<Scalars['Boolean']>,
  jpegProgressive?: Maybe<Scalars['Boolean']>,
  pngCompressionSpeed?: Maybe<Scalars['Int']>,
  duotone: Maybe<DuotoneGradient>,
  traceSVG: Maybe<Potrace>,
  quality: Maybe<Scalars['Int']>,
  jpegQuality: Maybe<Scalars['Int']>,
  pngQuality: Maybe<Scalars['Int']>,
  webpQuality: Maybe<Scalars['Int']>,
  toFormat?: Maybe<ImageFormat>,
  toFormatBase64?: Maybe<ImageFormat>,
  cropFocus?: Maybe<ImageCropFocus>,
  fit?: Maybe<ImageFit>,
  background?: Maybe<Scalars['String']>,
  rotate?: Maybe<Scalars['Int']>,
  trim?: Maybe<Scalars['Float']>,
  sizes?: Maybe<Scalars['String']>,
  srcSetBreakpoints?: Maybe<Array<Maybe<Scalars['Int']>>>
};


export type ImageSharpResizeArgs = {
  width: Maybe<Scalars['Int']>,
  height: Maybe<Scalars['Int']>,
  quality: Maybe<Scalars['Int']>,
  jpegQuality: Maybe<Scalars['Int']>,
  pngQuality: Maybe<Scalars['Int']>,
  webpQuality: Maybe<Scalars['Int']>,
  jpegProgressive?: Maybe<Scalars['Boolean']>,
  pngCompressionLevel?: Maybe<Scalars['Int']>,
  pngCompressionSpeed?: Maybe<Scalars['Int']>,
  grayscale?: Maybe<Scalars['Boolean']>,
  duotone: Maybe<DuotoneGradient>,
  base64?: Maybe<Scalars['Boolean']>,
  traceSVG: Maybe<Potrace>,
  toFormat?: Maybe<ImageFormat>,
  cropFocus?: Maybe<ImageCropFocus>,
  fit?: Maybe<ImageFit>,
  background?: Maybe<Scalars['String']>,
  rotate?: Maybe<Scalars['Int']>,
  trim?: Maybe<Scalars['Float']>
};

export type ImageSharpConnection = {
   __typename?: 'ImageSharpConnection',
  totalCount: Scalars['Int'],
  edges: Array<ImageSharpEdge>,
  nodes: Array<ImageSharp>,
  pageInfo: PageInfo,
  distinct: Array<Scalars['String']>,
  group: Array<ImageSharpGroupConnection>,
};


export type ImageSharpConnectionDistinctArgs = {
  field: ImageSharpFieldsEnum
};


export type ImageSharpConnectionGroupArgs = {
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>,
  field: ImageSharpFieldsEnum
};

export type ImageSharpEdge = {
   __typename?: 'ImageSharpEdge',
  next: Maybe<ImageSharp>,
  node: ImageSharp,
  previous: Maybe<ImageSharp>,
};

export enum ImageSharpFieldsEnum {
  fixed___base64 = 'fixed___base64',
  fixed___tracedSVG = 'fixed___tracedSVG',
  fixed___aspectRatio = 'fixed___aspectRatio',
  fixed___width = 'fixed___width',
  fixed___height = 'fixed___height',
  fixed___src = 'fixed___src',
  fixed___srcSet = 'fixed___srcSet',
  fixed___srcWebp = 'fixed___srcWebp',
  fixed___srcSetWebp = 'fixed___srcSetWebp',
  fixed___originalName = 'fixed___originalName',
  resolutions___base64 = 'resolutions___base64',
  resolutions___tracedSVG = 'resolutions___tracedSVG',
  resolutions___aspectRatio = 'resolutions___aspectRatio',
  resolutions___width = 'resolutions___width',
  resolutions___height = 'resolutions___height',
  resolutions___src = 'resolutions___src',
  resolutions___srcSet = 'resolutions___srcSet',
  resolutions___srcWebp = 'resolutions___srcWebp',
  resolutions___srcSetWebp = 'resolutions___srcSetWebp',
  resolutions___originalName = 'resolutions___originalName',
  fluid___base64 = 'fluid___base64',
  fluid___tracedSVG = 'fluid___tracedSVG',
  fluid___aspectRatio = 'fluid___aspectRatio',
  fluid___src = 'fluid___src',
  fluid___srcSet = 'fluid___srcSet',
  fluid___srcWebp = 'fluid___srcWebp',
  fluid___srcSetWebp = 'fluid___srcSetWebp',
  fluid___sizes = 'fluid___sizes',
  fluid___originalImg = 'fluid___originalImg',
  fluid___originalName = 'fluid___originalName',
  fluid___presentationWidth = 'fluid___presentationWidth',
  fluid___presentationHeight = 'fluid___presentationHeight',
  sizes___base64 = 'sizes___base64',
  sizes___tracedSVG = 'sizes___tracedSVG',
  sizes___aspectRatio = 'sizes___aspectRatio',
  sizes___src = 'sizes___src',
  sizes___srcSet = 'sizes___srcSet',
  sizes___srcWebp = 'sizes___srcWebp',
  sizes___srcSetWebp = 'sizes___srcSetWebp',
  sizes___sizes = 'sizes___sizes',
  sizes___originalImg = 'sizes___originalImg',
  sizes___originalName = 'sizes___originalName',
  sizes___presentationWidth = 'sizes___presentationWidth',
  sizes___presentationHeight = 'sizes___presentationHeight',
  original___width = 'original___width',
  original___height = 'original___height',
  original___src = 'original___src',
  resize___src = 'resize___src',
  resize___tracedSVG = 'resize___tracedSVG',
  resize___width = 'resize___width',
  resize___height = 'resize___height',
  resize___aspectRatio = 'resize___aspectRatio',
  resize___originalName = 'resize___originalName',
  id = 'id',
  parent___id = 'parent___id',
  parent___parent___id = 'parent___parent___id',
  parent___parent___parent___id = 'parent___parent___parent___id',
  parent___parent___parent___children = 'parent___parent___parent___children',
  parent___parent___children = 'parent___parent___children',
  parent___parent___children___id = 'parent___parent___children___id',
  parent___parent___children___children = 'parent___parent___children___children',
  parent___parent___internal___content = 'parent___parent___internal___content',
  parent___parent___internal___contentDigest = 'parent___parent___internal___contentDigest',
  parent___parent___internal___description = 'parent___parent___internal___description',
  parent___parent___internal___fieldOwners = 'parent___parent___internal___fieldOwners',
  parent___parent___internal___ignoreType = 'parent___parent___internal___ignoreType',
  parent___parent___internal___mediaType = 'parent___parent___internal___mediaType',
  parent___parent___internal___owner = 'parent___parent___internal___owner',
  parent___parent___internal___type = 'parent___parent___internal___type',
  parent___children = 'parent___children',
  parent___children___id = 'parent___children___id',
  parent___children___parent___id = 'parent___children___parent___id',
  parent___children___parent___children = 'parent___children___parent___children',
  parent___children___children = 'parent___children___children',
  parent___children___children___id = 'parent___children___children___id',
  parent___children___children___children = 'parent___children___children___children',
  parent___children___internal___content = 'parent___children___internal___content',
  parent___children___internal___contentDigest = 'parent___children___internal___contentDigest',
  parent___children___internal___description = 'parent___children___internal___description',
  parent___children___internal___fieldOwners = 'parent___children___internal___fieldOwners',
  parent___children___internal___ignoreType = 'parent___children___internal___ignoreType',
  parent___children___internal___mediaType = 'parent___children___internal___mediaType',
  parent___children___internal___owner = 'parent___children___internal___owner',
  parent___children___internal___type = 'parent___children___internal___type',
  parent___internal___content = 'parent___internal___content',
  parent___internal___contentDigest = 'parent___internal___contentDigest',
  parent___internal___description = 'parent___internal___description',
  parent___internal___fieldOwners = 'parent___internal___fieldOwners',
  parent___internal___ignoreType = 'parent___internal___ignoreType',
  parent___internal___mediaType = 'parent___internal___mediaType',
  parent___internal___owner = 'parent___internal___owner',
  parent___internal___type = 'parent___internal___type',
  children = 'children',
  children___id = 'children___id',
  children___parent___id = 'children___parent___id',
  children___parent___parent___id = 'children___parent___parent___id',
  children___parent___parent___children = 'children___parent___parent___children',
  children___parent___children = 'children___parent___children',
  children___parent___children___id = 'children___parent___children___id',
  children___parent___children___children = 'children___parent___children___children',
  children___parent___internal___content = 'children___parent___internal___content',
  children___parent___internal___contentDigest = 'children___parent___internal___contentDigest',
  children___parent___internal___description = 'children___parent___internal___description',
  children___parent___internal___fieldOwners = 'children___parent___internal___fieldOwners',
  children___parent___internal___ignoreType = 'children___parent___internal___ignoreType',
  children___parent___internal___mediaType = 'children___parent___internal___mediaType',
  children___parent___internal___owner = 'children___parent___internal___owner',
  children___parent___internal___type = 'children___parent___internal___type',
  children___children = 'children___children',
  children___children___id = 'children___children___id',
  children___children___parent___id = 'children___children___parent___id',
  children___children___parent___children = 'children___children___parent___children',
  children___children___children = 'children___children___children',
  children___children___children___id = 'children___children___children___id',
  children___children___children___children = 'children___children___children___children',
  children___children___internal___content = 'children___children___internal___content',
  children___children___internal___contentDigest = 'children___children___internal___contentDigest',
  children___children___internal___description = 'children___children___internal___description',
  children___children___internal___fieldOwners = 'children___children___internal___fieldOwners',
  children___children___internal___ignoreType = 'children___children___internal___ignoreType',
  children___children___internal___mediaType = 'children___children___internal___mediaType',
  children___children___internal___owner = 'children___children___internal___owner',
  children___children___internal___type = 'children___children___internal___type',
  children___internal___content = 'children___internal___content',
  children___internal___contentDigest = 'children___internal___contentDigest',
  children___internal___description = 'children___internal___description',
  children___internal___fieldOwners = 'children___internal___fieldOwners',
  children___internal___ignoreType = 'children___internal___ignoreType',
  children___internal___mediaType = 'children___internal___mediaType',
  children___internal___owner = 'children___internal___owner',
  children___internal___type = 'children___internal___type',
  internal___content = 'internal___content',
  internal___contentDigest = 'internal___contentDigest',
  internal___description = 'internal___description',
  internal___fieldOwners = 'internal___fieldOwners',
  internal___ignoreType = 'internal___ignoreType',
  internal___mediaType = 'internal___mediaType',
  internal___owner = 'internal___owner',
  internal___type = 'internal___type'
}

export type ImageSharpFilterInput = {
  fixed: Maybe<ImageSharpFixedFilterInput>,
  resolutions: Maybe<ImageSharpResolutionsFilterInput>,
  fluid: Maybe<ImageSharpFluidFilterInput>,
  sizes: Maybe<ImageSharpSizesFilterInput>,
  original: Maybe<ImageSharpOriginalFilterInput>,
  resize: Maybe<ImageSharpResizeFilterInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
};

export type ImageSharpFixed = {
   __typename?: 'ImageSharpFixed',
  base64: Maybe<Scalars['String']>,
  tracedSVG: Maybe<Scalars['String']>,
  aspectRatio: Maybe<Scalars['Float']>,
  width: Scalars['Float'],
  height: Scalars['Float'],
  src: Scalars['String'],
  srcSet: Scalars['String'],
  srcWebp: Maybe<Scalars['String']>,
  srcSetWebp: Maybe<Scalars['String']>,
  originalName: Maybe<Scalars['String']>,
};

export type ImageSharpFixedFilterInput = {
  base64: Maybe<StringQueryOperatorInput>,
  tracedSVG: Maybe<StringQueryOperatorInput>,
  aspectRatio: Maybe<FloatQueryOperatorInput>,
  width: Maybe<FloatQueryOperatorInput>,
  height: Maybe<FloatQueryOperatorInput>,
  src: Maybe<StringQueryOperatorInput>,
  srcSet: Maybe<StringQueryOperatorInput>,
  srcWebp: Maybe<StringQueryOperatorInput>,
  srcSetWebp: Maybe<StringQueryOperatorInput>,
  originalName: Maybe<StringQueryOperatorInput>,
};

export type ImageSharpFluid = {
   __typename?: 'ImageSharpFluid',
  base64: Maybe<Scalars['String']>,
  tracedSVG: Maybe<Scalars['String']>,
  aspectRatio: Scalars['Float'],
  src: Scalars['String'],
  srcSet: Scalars['String'],
  srcWebp: Maybe<Scalars['String']>,
  srcSetWebp: Maybe<Scalars['String']>,
  sizes: Scalars['String'],
  originalImg: Maybe<Scalars['String']>,
  originalName: Maybe<Scalars['String']>,
  presentationWidth: Maybe<Scalars['Int']>,
  presentationHeight: Maybe<Scalars['Int']>,
};

export type ImageSharpFluidFilterInput = {
  base64: Maybe<StringQueryOperatorInput>,
  tracedSVG: Maybe<StringQueryOperatorInput>,
  aspectRatio: Maybe<FloatQueryOperatorInput>,
  src: Maybe<StringQueryOperatorInput>,
  srcSet: Maybe<StringQueryOperatorInput>,
  srcWebp: Maybe<StringQueryOperatorInput>,
  srcSetWebp: Maybe<StringQueryOperatorInput>,
  sizes: Maybe<StringQueryOperatorInput>,
  originalImg: Maybe<StringQueryOperatorInput>,
  originalName: Maybe<StringQueryOperatorInput>,
  presentationWidth: Maybe<IntQueryOperatorInput>,
  presentationHeight: Maybe<IntQueryOperatorInput>,
};

export type ImageSharpGroupConnection = {
   __typename?: 'ImageSharpGroupConnection',
  totalCount: Scalars['Int'],
  edges: Array<ImageSharpEdge>,
  nodes: Array<ImageSharp>,
  pageInfo: PageInfo,
  field: Scalars['String'],
  fieldValue: Maybe<Scalars['String']>,
};

export type ImageSharpOriginal = {
   __typename?: 'ImageSharpOriginal',
  width: Maybe<Scalars['Float']>,
  height: Maybe<Scalars['Float']>,
  src: Maybe<Scalars['String']>,
};

export type ImageSharpOriginalFilterInput = {
  width: Maybe<FloatQueryOperatorInput>,
  height: Maybe<FloatQueryOperatorInput>,
  src: Maybe<StringQueryOperatorInput>,
};

export type ImageSharpResize = {
   __typename?: 'ImageSharpResize',
  src: Maybe<Scalars['String']>,
  tracedSVG: Maybe<Scalars['String']>,
  width: Maybe<Scalars['Int']>,
  height: Maybe<Scalars['Int']>,
  aspectRatio: Maybe<Scalars['Float']>,
  originalName: Maybe<Scalars['String']>,
};

export type ImageSharpResizeFilterInput = {
  src: Maybe<StringQueryOperatorInput>,
  tracedSVG: Maybe<StringQueryOperatorInput>,
  width: Maybe<IntQueryOperatorInput>,
  height: Maybe<IntQueryOperatorInput>,
  aspectRatio: Maybe<FloatQueryOperatorInput>,
  originalName: Maybe<StringQueryOperatorInput>,
};

export type ImageSharpResolutions = {
   __typename?: 'ImageSharpResolutions',
  base64: Maybe<Scalars['String']>,
  tracedSVG: Maybe<Scalars['String']>,
  aspectRatio: Maybe<Scalars['Float']>,
  width: Scalars['Float'],
  height: Scalars['Float'],
  src: Scalars['String'],
  srcSet: Scalars['String'],
  srcWebp: Maybe<Scalars['String']>,
  srcSetWebp: Maybe<Scalars['String']>,
  originalName: Maybe<Scalars['String']>,
};

export type ImageSharpResolutionsFilterInput = {
  base64: Maybe<StringQueryOperatorInput>,
  tracedSVG: Maybe<StringQueryOperatorInput>,
  aspectRatio: Maybe<FloatQueryOperatorInput>,
  width: Maybe<FloatQueryOperatorInput>,
  height: Maybe<FloatQueryOperatorInput>,
  src: Maybe<StringQueryOperatorInput>,
  srcSet: Maybe<StringQueryOperatorInput>,
  srcWebp: Maybe<StringQueryOperatorInput>,
  srcSetWebp: Maybe<StringQueryOperatorInput>,
  originalName: Maybe<StringQueryOperatorInput>,
};

export type ImageSharpSizes = {
   __typename?: 'ImageSharpSizes',
  base64: Maybe<Scalars['String']>,
  tracedSVG: Maybe<Scalars['String']>,
  aspectRatio: Scalars['Float'],
  src: Scalars['String'],
  srcSet: Scalars['String'],
  srcWebp: Maybe<Scalars['String']>,
  srcSetWebp: Maybe<Scalars['String']>,
  sizes: Scalars['String'],
  originalImg: Maybe<Scalars['String']>,
  originalName: Maybe<Scalars['String']>,
  presentationWidth: Maybe<Scalars['Int']>,
  presentationHeight: Maybe<Scalars['Int']>,
};

export type ImageSharpSizesFilterInput = {
  base64: Maybe<StringQueryOperatorInput>,
  tracedSVG: Maybe<StringQueryOperatorInput>,
  aspectRatio: Maybe<FloatQueryOperatorInput>,
  src: Maybe<StringQueryOperatorInput>,
  srcSet: Maybe<StringQueryOperatorInput>,
  srcWebp: Maybe<StringQueryOperatorInput>,
  srcSetWebp: Maybe<StringQueryOperatorInput>,
  sizes: Maybe<StringQueryOperatorInput>,
  originalImg: Maybe<StringQueryOperatorInput>,
  originalName: Maybe<StringQueryOperatorInput>,
  presentationWidth: Maybe<IntQueryOperatorInput>,
  presentationHeight: Maybe<IntQueryOperatorInput>,
};

export type ImageSharpSortInput = {
  fields: Maybe<Array<Maybe<ImageSharpFieldsEnum>>>,
  order: Maybe<Array<Maybe<SortOrderEnum>>>,
};

export type Internal = {
   __typename?: 'Internal',
  content: Maybe<Scalars['String']>,
  contentDigest: Scalars['String'],
  description: Maybe<Scalars['String']>,
  fieldOwners: Maybe<Array<Maybe<Scalars['String']>>>,
  ignoreType: Maybe<Scalars['Boolean']>,
  mediaType: Maybe<Scalars['String']>,
  owner: Scalars['String'],
  type: Scalars['String'],
};

export type InternalFilterInput = {
  content: Maybe<StringQueryOperatorInput>,
  contentDigest: Maybe<StringQueryOperatorInput>,
  description: Maybe<StringQueryOperatorInput>,
  fieldOwners: Maybe<StringQueryOperatorInput>,
  ignoreType: Maybe<BooleanQueryOperatorInput>,
  mediaType: Maybe<StringQueryOperatorInput>,
  owner: Maybe<StringQueryOperatorInput>,
  type: Maybe<StringQueryOperatorInput>,
};

export type IntQueryOperatorInput = {
  eq: Maybe<Scalars['Int']>,
  ne: Maybe<Scalars['Int']>,
  gt: Maybe<Scalars['Int']>,
  gte: Maybe<Scalars['Int']>,
  lt: Maybe<Scalars['Int']>,
  lte: Maybe<Scalars['Int']>,
  in: Maybe<Array<Maybe<Scalars['Int']>>>,
  nin: Maybe<Array<Maybe<Scalars['Int']>>>,
};


export type JsonQueryOperatorInput = {
  eq: Maybe<Scalars['JSON']>,
  ne: Maybe<Scalars['JSON']>,
  in: Maybe<Array<Maybe<Scalars['JSON']>>>,
  nin: Maybe<Array<Maybe<Scalars['JSON']>>>,
  regex: Maybe<Scalars['JSON']>,
  glob: Maybe<Scalars['JSON']>,
};

export type Mdx = Node & {
   __typename?: 'Mdx',
  rawBody: Scalars['String'],
  fileAbsolutePath: Scalars['String'],
  frontmatter: Maybe<MdxFrontmatter>,
  body: Scalars['String'],
  excerpt: Scalars['String'],
  headings: Maybe<Array<Maybe<MdxHeadingMdx>>>,
  html: Maybe<Scalars['String']>,
  mdxAST: Maybe<Scalars['JSON']>,
  tableOfContents: Maybe<Scalars['JSON']>,
  timeToRead: Maybe<Scalars['Int']>,
  wordCount: Maybe<MdxWordCount>,
  fields: Maybe<MdxFields>,
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
};


export type MdxExcerptArgs = {
  pruneLength?: Maybe<Scalars['Int']>
};


export type MdxHeadingsArgs = {
  depth: Maybe<HeadingsMdx>
};


export type MdxTableOfContentsArgs = {
  maxDepth: Maybe<Scalars['Int']>
};

export type MdxConnection = {
   __typename?: 'MdxConnection',
  totalCount: Scalars['Int'],
  edges: Array<MdxEdge>,
  nodes: Array<Mdx>,
  pageInfo: PageInfo,
  distinct: Array<Scalars['String']>,
  group: Array<MdxGroupConnection>,
};


export type MdxConnectionDistinctArgs = {
  field: MdxFieldsEnum
};


export type MdxConnectionGroupArgs = {
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>,
  field: MdxFieldsEnum
};

export type MdxEdge = {
   __typename?: 'MdxEdge',
  next: Maybe<Mdx>,
  node: Mdx,
  previous: Maybe<Mdx>,
};

export type MdxFields = {
   __typename?: 'MdxFields',
  slug: Maybe<Scalars['String']>,
};

export enum MdxFieldsEnum {
  rawBody = 'rawBody',
  fileAbsolutePath = 'fileAbsolutePath',
  frontmatter___title = 'frontmatter___title',
  frontmatter___fullWidth = 'frontmatter___fullWidth',
  body = 'body',
  excerpt = 'excerpt',
  headings = 'headings',
  headings___value = 'headings___value',
  headings___depth = 'headings___depth',
  html = 'html',
  mdxAST = 'mdxAST',
  tableOfContents = 'tableOfContents',
  timeToRead = 'timeToRead',
  wordCount___paragraphs = 'wordCount___paragraphs',
  wordCount___sentences = 'wordCount___sentences',
  wordCount___words = 'wordCount___words',
  fields___slug = 'fields___slug',
  id = 'id',
  parent___id = 'parent___id',
  parent___parent___id = 'parent___parent___id',
  parent___parent___parent___id = 'parent___parent___parent___id',
  parent___parent___parent___children = 'parent___parent___parent___children',
  parent___parent___children = 'parent___parent___children',
  parent___parent___children___id = 'parent___parent___children___id',
  parent___parent___children___children = 'parent___parent___children___children',
  parent___parent___internal___content = 'parent___parent___internal___content',
  parent___parent___internal___contentDigest = 'parent___parent___internal___contentDigest',
  parent___parent___internal___description = 'parent___parent___internal___description',
  parent___parent___internal___fieldOwners = 'parent___parent___internal___fieldOwners',
  parent___parent___internal___ignoreType = 'parent___parent___internal___ignoreType',
  parent___parent___internal___mediaType = 'parent___parent___internal___mediaType',
  parent___parent___internal___owner = 'parent___parent___internal___owner',
  parent___parent___internal___type = 'parent___parent___internal___type',
  parent___children = 'parent___children',
  parent___children___id = 'parent___children___id',
  parent___children___parent___id = 'parent___children___parent___id',
  parent___children___parent___children = 'parent___children___parent___children',
  parent___children___children = 'parent___children___children',
  parent___children___children___id = 'parent___children___children___id',
  parent___children___children___children = 'parent___children___children___children',
  parent___children___internal___content = 'parent___children___internal___content',
  parent___children___internal___contentDigest = 'parent___children___internal___contentDigest',
  parent___children___internal___description = 'parent___children___internal___description',
  parent___children___internal___fieldOwners = 'parent___children___internal___fieldOwners',
  parent___children___internal___ignoreType = 'parent___children___internal___ignoreType',
  parent___children___internal___mediaType = 'parent___children___internal___mediaType',
  parent___children___internal___owner = 'parent___children___internal___owner',
  parent___children___internal___type = 'parent___children___internal___type',
  parent___internal___content = 'parent___internal___content',
  parent___internal___contentDigest = 'parent___internal___contentDigest',
  parent___internal___description = 'parent___internal___description',
  parent___internal___fieldOwners = 'parent___internal___fieldOwners',
  parent___internal___ignoreType = 'parent___internal___ignoreType',
  parent___internal___mediaType = 'parent___internal___mediaType',
  parent___internal___owner = 'parent___internal___owner',
  parent___internal___type = 'parent___internal___type',
  children = 'children',
  children___id = 'children___id',
  children___parent___id = 'children___parent___id',
  children___parent___parent___id = 'children___parent___parent___id',
  children___parent___parent___children = 'children___parent___parent___children',
  children___parent___children = 'children___parent___children',
  children___parent___children___id = 'children___parent___children___id',
  children___parent___children___children = 'children___parent___children___children',
  children___parent___internal___content = 'children___parent___internal___content',
  children___parent___internal___contentDigest = 'children___parent___internal___contentDigest',
  children___parent___internal___description = 'children___parent___internal___description',
  children___parent___internal___fieldOwners = 'children___parent___internal___fieldOwners',
  children___parent___internal___ignoreType = 'children___parent___internal___ignoreType',
  children___parent___internal___mediaType = 'children___parent___internal___mediaType',
  children___parent___internal___owner = 'children___parent___internal___owner',
  children___parent___internal___type = 'children___parent___internal___type',
  children___children = 'children___children',
  children___children___id = 'children___children___id',
  children___children___parent___id = 'children___children___parent___id',
  children___children___parent___children = 'children___children___parent___children',
  children___children___children = 'children___children___children',
  children___children___children___id = 'children___children___children___id',
  children___children___children___children = 'children___children___children___children',
  children___children___internal___content = 'children___children___internal___content',
  children___children___internal___contentDigest = 'children___children___internal___contentDigest',
  children___children___internal___description = 'children___children___internal___description',
  children___children___internal___fieldOwners = 'children___children___internal___fieldOwners',
  children___children___internal___ignoreType = 'children___children___internal___ignoreType',
  children___children___internal___mediaType = 'children___children___internal___mediaType',
  children___children___internal___owner = 'children___children___internal___owner',
  children___children___internal___type = 'children___children___internal___type',
  children___internal___content = 'children___internal___content',
  children___internal___contentDigest = 'children___internal___contentDigest',
  children___internal___description = 'children___internal___description',
  children___internal___fieldOwners = 'children___internal___fieldOwners',
  children___internal___ignoreType = 'children___internal___ignoreType',
  children___internal___mediaType = 'children___internal___mediaType',
  children___internal___owner = 'children___internal___owner',
  children___internal___type = 'children___internal___type',
  internal___content = 'internal___content',
  internal___contentDigest = 'internal___contentDigest',
  internal___description = 'internal___description',
  internal___fieldOwners = 'internal___fieldOwners',
  internal___ignoreType = 'internal___ignoreType',
  internal___mediaType = 'internal___mediaType',
  internal___owner = 'internal___owner',
  internal___type = 'internal___type'
}

export type MdxFieldsFilterInput = {
  slug: Maybe<StringQueryOperatorInput>,
};

export type MdxFilterInput = {
  rawBody: Maybe<StringQueryOperatorInput>,
  fileAbsolutePath: Maybe<StringQueryOperatorInput>,
  frontmatter: Maybe<MdxFrontmatterFilterInput>,
  body: Maybe<StringQueryOperatorInput>,
  excerpt: Maybe<StringQueryOperatorInput>,
  headings: Maybe<MdxHeadingMdxFilterListInput>,
  html: Maybe<StringQueryOperatorInput>,
  mdxAST: Maybe<JsonQueryOperatorInput>,
  tableOfContents: Maybe<JsonQueryOperatorInput>,
  timeToRead: Maybe<IntQueryOperatorInput>,
  wordCount: Maybe<MdxWordCountFilterInput>,
  fields: Maybe<MdxFieldsFilterInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
};

export type MdxFrontmatter = {
   __typename?: 'MdxFrontmatter',
  title: Scalars['String'],
  fullWidth: Maybe<Scalars['Boolean']>,
};

export type MdxFrontmatterFilterInput = {
  title: Maybe<StringQueryOperatorInput>,
  fullWidth: Maybe<BooleanQueryOperatorInput>,
};

export type MdxGroupConnection = {
   __typename?: 'MdxGroupConnection',
  totalCount: Scalars['Int'],
  edges: Array<MdxEdge>,
  nodes: Array<Mdx>,
  pageInfo: PageInfo,
  field: Scalars['String'],
  fieldValue: Maybe<Scalars['String']>,
};

export type MdxHeadingMdx = {
   __typename?: 'MdxHeadingMdx',
  value: Maybe<Scalars['String']>,
  depth: Maybe<Scalars['Int']>,
};

export type MdxHeadingMdxFilterInput = {
  value: Maybe<StringQueryOperatorInput>,
  depth: Maybe<IntQueryOperatorInput>,
};

export type MdxHeadingMdxFilterListInput = {
  elemMatch: Maybe<MdxHeadingMdxFilterInput>,
};

export type MdxSortInput = {
  fields: Maybe<Array<Maybe<MdxFieldsEnum>>>,
  order: Maybe<Array<Maybe<SortOrderEnum>>>,
};

export type MdxWordCount = {
   __typename?: 'MdxWordCount',
  paragraphs: Maybe<Scalars['Int']>,
  sentences: Maybe<Scalars['Int']>,
  words: Maybe<Scalars['Int']>,
};

export type MdxWordCountFilterInput = {
  paragraphs: Maybe<IntQueryOperatorInput>,
  sentences: Maybe<IntQueryOperatorInput>,
  words: Maybe<IntQueryOperatorInput>,
};

/** Node Interface */
export type Node = {
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
};

export type NodeFilterInput = {
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
};

export type NodeFilterListInput = {
  elemMatch: Maybe<NodeFilterInput>,
};

export type PageInfo = {
   __typename?: 'PageInfo',
  currentPage: Scalars['Int'],
  hasPreviousPage: Scalars['Boolean'],
  hasNextPage: Scalars['Boolean'],
  itemCount: Scalars['Int'],
  pageCount: Scalars['Int'],
  perPage: Maybe<Scalars['Int']>,
};

export type Potrace = {
  turnPolicy: Maybe<PotraceTurnPolicy>,
  turdSize: Maybe<Scalars['Float']>,
  alphaMax: Maybe<Scalars['Float']>,
  optCurve: Maybe<Scalars['Boolean']>,
  optTolerance: Maybe<Scalars['Float']>,
  threshold: Maybe<Scalars['Int']>,
  blackOnWhite: Maybe<Scalars['Boolean']>,
  color: Maybe<Scalars['String']>,
  background: Maybe<Scalars['String']>,
};

export enum PotraceTurnPolicy {
  TURNPOLICY_BLACK = 'TURNPOLICY_BLACK',
  TURNPOLICY_WHITE = 'TURNPOLICY_WHITE',
  TURNPOLICY_LEFT = 'TURNPOLICY_LEFT',
  TURNPOLICY_RIGHT = 'TURNPOLICY_RIGHT',
  TURNPOLICY_MINORITY = 'TURNPOLICY_MINORITY',
  TURNPOLICY_MAJORITY = 'TURNPOLICY_MAJORITY'
}

export type Query = {
   __typename?: 'Query',
  file: Maybe<File>,
  allFile: FileConnection,
  directory: Maybe<Directory>,
  allDirectory: DirectoryConnection,
  imageSharp: Maybe<ImageSharp>,
  allImageSharp: ImageSharpConnection,
  mdx: Maybe<Mdx>,
  allMdx: MdxConnection,
  site: Maybe<Site>,
  allSite: SiteConnection,
  sitePlugin: Maybe<SitePlugin>,
  allSitePlugin: SitePluginConnection,
  sitePage: Maybe<SitePage>,
  allSitePage: SitePageConnection,
};


export type QueryFileArgs = {
  sourceInstanceName: Maybe<StringQueryOperatorInput>,
  absolutePath: Maybe<StringQueryOperatorInput>,
  relativePath: Maybe<StringQueryOperatorInput>,
  extension: Maybe<StringQueryOperatorInput>,
  size: Maybe<IntQueryOperatorInput>,
  prettySize: Maybe<StringQueryOperatorInput>,
  modifiedTime: Maybe<DateQueryOperatorInput>,
  accessTime: Maybe<DateQueryOperatorInput>,
  changeTime: Maybe<DateQueryOperatorInput>,
  birthTime: Maybe<DateQueryOperatorInput>,
  root: Maybe<StringQueryOperatorInput>,
  dir: Maybe<StringQueryOperatorInput>,
  base: Maybe<StringQueryOperatorInput>,
  ext: Maybe<StringQueryOperatorInput>,
  name: Maybe<StringQueryOperatorInput>,
  relativeDirectory: Maybe<StringQueryOperatorInput>,
  dev: Maybe<IntQueryOperatorInput>,
  mode: Maybe<IntQueryOperatorInput>,
  nlink: Maybe<IntQueryOperatorInput>,
  uid: Maybe<IntQueryOperatorInput>,
  gid: Maybe<IntQueryOperatorInput>,
  rdev: Maybe<IntQueryOperatorInput>,
  ino: Maybe<FloatQueryOperatorInput>,
  atimeMs: Maybe<FloatQueryOperatorInput>,
  mtimeMs: Maybe<FloatQueryOperatorInput>,
  ctimeMs: Maybe<FloatQueryOperatorInput>,
  atime: Maybe<DateQueryOperatorInput>,
  mtime: Maybe<DateQueryOperatorInput>,
  ctime: Maybe<DateQueryOperatorInput>,
  birthtime: Maybe<DateQueryOperatorInput>,
  birthtimeMs: Maybe<FloatQueryOperatorInput>,
  blksize: Maybe<IntQueryOperatorInput>,
  blocks: Maybe<IntQueryOperatorInput>,
  publicURL: Maybe<StringQueryOperatorInput>,
  childImageSharp: Maybe<ImageSharpFilterInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  childMdx: Maybe<MdxFilterInput>
};


export type QueryAllFileArgs = {
  filter: Maybe<FileFilterInput>,
  sort: Maybe<FileSortInput>,
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
};


export type QueryDirectoryArgs = {
  sourceInstanceName: Maybe<StringQueryOperatorInput>,
  absolutePath: Maybe<StringQueryOperatorInput>,
  relativePath: Maybe<StringQueryOperatorInput>,
  extension: Maybe<StringQueryOperatorInput>,
  size: Maybe<IntQueryOperatorInput>,
  prettySize: Maybe<StringQueryOperatorInput>,
  modifiedTime: Maybe<DateQueryOperatorInput>,
  accessTime: Maybe<DateQueryOperatorInput>,
  changeTime: Maybe<DateQueryOperatorInput>,
  birthTime: Maybe<DateQueryOperatorInput>,
  root: Maybe<StringQueryOperatorInput>,
  dir: Maybe<StringQueryOperatorInput>,
  base: Maybe<StringQueryOperatorInput>,
  ext: Maybe<StringQueryOperatorInput>,
  name: Maybe<StringQueryOperatorInput>,
  relativeDirectory: Maybe<StringQueryOperatorInput>,
  dev: Maybe<IntQueryOperatorInput>,
  mode: Maybe<IntQueryOperatorInput>,
  nlink: Maybe<IntQueryOperatorInput>,
  uid: Maybe<IntQueryOperatorInput>,
  gid: Maybe<IntQueryOperatorInput>,
  rdev: Maybe<IntQueryOperatorInput>,
  ino: Maybe<FloatQueryOperatorInput>,
  atimeMs: Maybe<FloatQueryOperatorInput>,
  mtimeMs: Maybe<FloatQueryOperatorInput>,
  ctimeMs: Maybe<FloatQueryOperatorInput>,
  atime: Maybe<DateQueryOperatorInput>,
  mtime: Maybe<DateQueryOperatorInput>,
  ctime: Maybe<DateQueryOperatorInput>,
  birthtime: Maybe<DateQueryOperatorInput>,
  birthtimeMs: Maybe<FloatQueryOperatorInput>,
  blksize: Maybe<IntQueryOperatorInput>,
  blocks: Maybe<IntQueryOperatorInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>
};


export type QueryAllDirectoryArgs = {
  filter: Maybe<DirectoryFilterInput>,
  sort: Maybe<DirectorySortInput>,
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
};


export type QueryImageSharpArgs = {
  fixed: Maybe<ImageSharpFixedFilterInput>,
  resolutions: Maybe<ImageSharpResolutionsFilterInput>,
  fluid: Maybe<ImageSharpFluidFilterInput>,
  sizes: Maybe<ImageSharpSizesFilterInput>,
  original: Maybe<ImageSharpOriginalFilterInput>,
  resize: Maybe<ImageSharpResizeFilterInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>
};


export type QueryAllImageSharpArgs = {
  filter: Maybe<ImageSharpFilterInput>,
  sort: Maybe<ImageSharpSortInput>,
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
};


export type QueryMdxArgs = {
  rawBody: Maybe<StringQueryOperatorInput>,
  fileAbsolutePath: Maybe<StringQueryOperatorInput>,
  frontmatter: Maybe<MdxFrontmatterFilterInput>,
  body: Maybe<StringQueryOperatorInput>,
  excerpt: Maybe<StringQueryOperatorInput>,
  headings: Maybe<MdxHeadingMdxFilterListInput>,
  html: Maybe<StringQueryOperatorInput>,
  mdxAST: Maybe<JsonQueryOperatorInput>,
  tableOfContents: Maybe<JsonQueryOperatorInput>,
  timeToRead: Maybe<IntQueryOperatorInput>,
  wordCount: Maybe<MdxWordCountFilterInput>,
  fields: Maybe<MdxFieldsFilterInput>,
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>
};


export type QueryAllMdxArgs = {
  filter: Maybe<MdxFilterInput>,
  sort: Maybe<MdxSortInput>,
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
};


export type QuerySiteArgs = {
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  siteMetadata: Maybe<SiteSiteMetadataFilterInput>,
  port: Maybe<IntQueryOperatorInput>,
  host: Maybe<StringQueryOperatorInput>,
  polyfill: Maybe<BooleanQueryOperatorInput>,
  pathPrefix: Maybe<StringQueryOperatorInput>,
  buildTime: Maybe<DateQueryOperatorInput>
};


export type QueryAllSiteArgs = {
  filter: Maybe<SiteFilterInput>,
  sort: Maybe<SiteSortInput>,
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
};


export type QuerySitePluginArgs = {
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  resolve: Maybe<StringQueryOperatorInput>,
  name: Maybe<StringQueryOperatorInput>,
  version: Maybe<StringQueryOperatorInput>,
  pluginOptions: Maybe<SitePluginPluginOptionsFilterInput>,
  nodeAPIs: Maybe<StringQueryOperatorInput>,
  browserAPIs: Maybe<StringQueryOperatorInput>,
  ssrAPIs: Maybe<StringQueryOperatorInput>,
  pluginFilepath: Maybe<StringQueryOperatorInput>,
  packageJson: Maybe<SitePluginPackageJsonFilterInput>
};


export type QueryAllSitePluginArgs = {
  filter: Maybe<SitePluginFilterInput>,
  sort: Maybe<SitePluginSortInput>,
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
};


export type QuerySitePageArgs = {
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  path: Maybe<StringQueryOperatorInput>,
  internalComponentName: Maybe<StringQueryOperatorInput>,
  component: Maybe<StringQueryOperatorInput>,
  componentChunkName: Maybe<StringQueryOperatorInput>,
  isCreatedByStatefulCreatePages: Maybe<BooleanQueryOperatorInput>,
  context: Maybe<SitePageContextFilterInput>,
  pluginCreator: Maybe<SitePluginFilterInput>,
  pluginCreatorId: Maybe<StringQueryOperatorInput>,
  componentPath: Maybe<StringQueryOperatorInput>
};


export type QueryAllSitePageArgs = {
  filter: Maybe<SitePageFilterInput>,
  sort: Maybe<SitePageSortInput>,
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
};

export type Site = Node & {
   __typename?: 'Site',
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
  siteMetadata: Maybe<SiteSiteMetadata>,
  port: Maybe<Scalars['Int']>,
  host: Maybe<Scalars['String']>,
  polyfill: Maybe<Scalars['Boolean']>,
  pathPrefix: Maybe<Scalars['String']>,
  buildTime: Maybe<Scalars['Date']>,
};


export type SiteBuildTimeArgs = {
  formatString: Maybe<Scalars['String']>,
  fromNow: Maybe<Scalars['Boolean']>,
  difference: Maybe<Scalars['String']>,
  locale: Maybe<Scalars['String']>
};

export type SiteConnection = {
   __typename?: 'SiteConnection',
  totalCount: Scalars['Int'],
  edges: Array<SiteEdge>,
  nodes: Array<Site>,
  pageInfo: PageInfo,
  distinct: Array<Scalars['String']>,
  group: Array<SiteGroupConnection>,
};


export type SiteConnectionDistinctArgs = {
  field: SiteFieldsEnum
};


export type SiteConnectionGroupArgs = {
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>,
  field: SiteFieldsEnum
};

export type SiteEdge = {
   __typename?: 'SiteEdge',
  next: Maybe<Site>,
  node: Site,
  previous: Maybe<Site>,
};

export enum SiteFieldsEnum {
  id = 'id',
  parent___id = 'parent___id',
  parent___parent___id = 'parent___parent___id',
  parent___parent___parent___id = 'parent___parent___parent___id',
  parent___parent___parent___children = 'parent___parent___parent___children',
  parent___parent___children = 'parent___parent___children',
  parent___parent___children___id = 'parent___parent___children___id',
  parent___parent___children___children = 'parent___parent___children___children',
  parent___parent___internal___content = 'parent___parent___internal___content',
  parent___parent___internal___contentDigest = 'parent___parent___internal___contentDigest',
  parent___parent___internal___description = 'parent___parent___internal___description',
  parent___parent___internal___fieldOwners = 'parent___parent___internal___fieldOwners',
  parent___parent___internal___ignoreType = 'parent___parent___internal___ignoreType',
  parent___parent___internal___mediaType = 'parent___parent___internal___mediaType',
  parent___parent___internal___owner = 'parent___parent___internal___owner',
  parent___parent___internal___type = 'parent___parent___internal___type',
  parent___children = 'parent___children',
  parent___children___id = 'parent___children___id',
  parent___children___parent___id = 'parent___children___parent___id',
  parent___children___parent___children = 'parent___children___parent___children',
  parent___children___children = 'parent___children___children',
  parent___children___children___id = 'parent___children___children___id',
  parent___children___children___children = 'parent___children___children___children',
  parent___children___internal___content = 'parent___children___internal___content',
  parent___children___internal___contentDigest = 'parent___children___internal___contentDigest',
  parent___children___internal___description = 'parent___children___internal___description',
  parent___children___internal___fieldOwners = 'parent___children___internal___fieldOwners',
  parent___children___internal___ignoreType = 'parent___children___internal___ignoreType',
  parent___children___internal___mediaType = 'parent___children___internal___mediaType',
  parent___children___internal___owner = 'parent___children___internal___owner',
  parent___children___internal___type = 'parent___children___internal___type',
  parent___internal___content = 'parent___internal___content',
  parent___internal___contentDigest = 'parent___internal___contentDigest',
  parent___internal___description = 'parent___internal___description',
  parent___internal___fieldOwners = 'parent___internal___fieldOwners',
  parent___internal___ignoreType = 'parent___internal___ignoreType',
  parent___internal___mediaType = 'parent___internal___mediaType',
  parent___internal___owner = 'parent___internal___owner',
  parent___internal___type = 'parent___internal___type',
  children = 'children',
  children___id = 'children___id',
  children___parent___id = 'children___parent___id',
  children___parent___parent___id = 'children___parent___parent___id',
  children___parent___parent___children = 'children___parent___parent___children',
  children___parent___children = 'children___parent___children',
  children___parent___children___id = 'children___parent___children___id',
  children___parent___children___children = 'children___parent___children___children',
  children___parent___internal___content = 'children___parent___internal___content',
  children___parent___internal___contentDigest = 'children___parent___internal___contentDigest',
  children___parent___internal___description = 'children___parent___internal___description',
  children___parent___internal___fieldOwners = 'children___parent___internal___fieldOwners',
  children___parent___internal___ignoreType = 'children___parent___internal___ignoreType',
  children___parent___internal___mediaType = 'children___parent___internal___mediaType',
  children___parent___internal___owner = 'children___parent___internal___owner',
  children___parent___internal___type = 'children___parent___internal___type',
  children___children = 'children___children',
  children___children___id = 'children___children___id',
  children___children___parent___id = 'children___children___parent___id',
  children___children___parent___children = 'children___children___parent___children',
  children___children___children = 'children___children___children',
  children___children___children___id = 'children___children___children___id',
  children___children___children___children = 'children___children___children___children',
  children___children___internal___content = 'children___children___internal___content',
  children___children___internal___contentDigest = 'children___children___internal___contentDigest',
  children___children___internal___description = 'children___children___internal___description',
  children___children___internal___fieldOwners = 'children___children___internal___fieldOwners',
  children___children___internal___ignoreType = 'children___children___internal___ignoreType',
  children___children___internal___mediaType = 'children___children___internal___mediaType',
  children___children___internal___owner = 'children___children___internal___owner',
  children___children___internal___type = 'children___children___internal___type',
  children___internal___content = 'children___internal___content',
  children___internal___contentDigest = 'children___internal___contentDigest',
  children___internal___description = 'children___internal___description',
  children___internal___fieldOwners = 'children___internal___fieldOwners',
  children___internal___ignoreType = 'children___internal___ignoreType',
  children___internal___mediaType = 'children___internal___mediaType',
  children___internal___owner = 'children___internal___owner',
  children___internal___type = 'children___internal___type',
  internal___content = 'internal___content',
  internal___contentDigest = 'internal___contentDigest',
  internal___description = 'internal___description',
  internal___fieldOwners = 'internal___fieldOwners',
  internal___ignoreType = 'internal___ignoreType',
  internal___mediaType = 'internal___mediaType',
  internal___owner = 'internal___owner',
  internal___type = 'internal___type',
  siteMetadata___siteUrl = 'siteMetadata___siteUrl',
  siteMetadata___description = 'siteMetadata___description',
  port = 'port',
  host = 'host',
  polyfill = 'polyfill',
  pathPrefix = 'pathPrefix',
  buildTime = 'buildTime'
}

export type SiteFilterInput = {
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  siteMetadata: Maybe<SiteSiteMetadataFilterInput>,
  port: Maybe<IntQueryOperatorInput>,
  host: Maybe<StringQueryOperatorInput>,
  polyfill: Maybe<BooleanQueryOperatorInput>,
  pathPrefix: Maybe<StringQueryOperatorInput>,
  buildTime: Maybe<DateQueryOperatorInput>,
};

export type SiteGroupConnection = {
   __typename?: 'SiteGroupConnection',
  totalCount: Scalars['Int'],
  edges: Array<SiteEdge>,
  nodes: Array<Site>,
  pageInfo: PageInfo,
  field: Scalars['String'],
  fieldValue: Maybe<Scalars['String']>,
};

export type SitePage = Node & {
   __typename?: 'SitePage',
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
  path: Maybe<Scalars['String']>,
  internalComponentName: Maybe<Scalars['String']>,
  component: Maybe<Scalars['String']>,
  componentChunkName: Maybe<Scalars['String']>,
  isCreatedByStatefulCreatePages: Maybe<Scalars['Boolean']>,
  context: Maybe<SitePageContext>,
  pluginCreator: Maybe<SitePlugin>,
  pluginCreatorId: Maybe<Scalars['String']>,
  componentPath: Maybe<Scalars['String']>,
};

export type SitePageConnection = {
   __typename?: 'SitePageConnection',
  totalCount: Scalars['Int'],
  edges: Array<SitePageEdge>,
  nodes: Array<SitePage>,
  pageInfo: PageInfo,
  distinct: Array<Scalars['String']>,
  group: Array<SitePageGroupConnection>,
};


export type SitePageConnectionDistinctArgs = {
  field: SitePageFieldsEnum
};


export type SitePageConnectionGroupArgs = {
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>,
  field: SitePageFieldsEnum
};

export type SitePageContext = {
   __typename?: 'SitePageContext',
  id: Maybe<Scalars['String']>,
  relativePath: Maybe<Scalars['String']>,
  frontmatter: Maybe<SitePageContextFrontmatter>,
};

export type SitePageContextFilterInput = {
  id: Maybe<StringQueryOperatorInput>,
  relativePath: Maybe<StringQueryOperatorInput>,
  frontmatter: Maybe<SitePageContextFrontmatterFilterInput>,
};

export type SitePageContextFrontmatter = {
   __typename?: 'SitePageContextFrontmatter',
  title: Maybe<Scalars['String']>,
  fullWidth: Maybe<Scalars['Boolean']>,
};

export type SitePageContextFrontmatterFilterInput = {
  title: Maybe<StringQueryOperatorInput>,
  fullWidth: Maybe<BooleanQueryOperatorInput>,
};

export type SitePageEdge = {
   __typename?: 'SitePageEdge',
  next: Maybe<SitePage>,
  node: SitePage,
  previous: Maybe<SitePage>,
};

export enum SitePageFieldsEnum {
  id = 'id',
  parent___id = 'parent___id',
  parent___parent___id = 'parent___parent___id',
  parent___parent___parent___id = 'parent___parent___parent___id',
  parent___parent___parent___children = 'parent___parent___parent___children',
  parent___parent___children = 'parent___parent___children',
  parent___parent___children___id = 'parent___parent___children___id',
  parent___parent___children___children = 'parent___parent___children___children',
  parent___parent___internal___content = 'parent___parent___internal___content',
  parent___parent___internal___contentDigest = 'parent___parent___internal___contentDigest',
  parent___parent___internal___description = 'parent___parent___internal___description',
  parent___parent___internal___fieldOwners = 'parent___parent___internal___fieldOwners',
  parent___parent___internal___ignoreType = 'parent___parent___internal___ignoreType',
  parent___parent___internal___mediaType = 'parent___parent___internal___mediaType',
  parent___parent___internal___owner = 'parent___parent___internal___owner',
  parent___parent___internal___type = 'parent___parent___internal___type',
  parent___children = 'parent___children',
  parent___children___id = 'parent___children___id',
  parent___children___parent___id = 'parent___children___parent___id',
  parent___children___parent___children = 'parent___children___parent___children',
  parent___children___children = 'parent___children___children',
  parent___children___children___id = 'parent___children___children___id',
  parent___children___children___children = 'parent___children___children___children',
  parent___children___internal___content = 'parent___children___internal___content',
  parent___children___internal___contentDigest = 'parent___children___internal___contentDigest',
  parent___children___internal___description = 'parent___children___internal___description',
  parent___children___internal___fieldOwners = 'parent___children___internal___fieldOwners',
  parent___children___internal___ignoreType = 'parent___children___internal___ignoreType',
  parent___children___internal___mediaType = 'parent___children___internal___mediaType',
  parent___children___internal___owner = 'parent___children___internal___owner',
  parent___children___internal___type = 'parent___children___internal___type',
  parent___internal___content = 'parent___internal___content',
  parent___internal___contentDigest = 'parent___internal___contentDigest',
  parent___internal___description = 'parent___internal___description',
  parent___internal___fieldOwners = 'parent___internal___fieldOwners',
  parent___internal___ignoreType = 'parent___internal___ignoreType',
  parent___internal___mediaType = 'parent___internal___mediaType',
  parent___internal___owner = 'parent___internal___owner',
  parent___internal___type = 'parent___internal___type',
  children = 'children',
  children___id = 'children___id',
  children___parent___id = 'children___parent___id',
  children___parent___parent___id = 'children___parent___parent___id',
  children___parent___parent___children = 'children___parent___parent___children',
  children___parent___children = 'children___parent___children',
  children___parent___children___id = 'children___parent___children___id',
  children___parent___children___children = 'children___parent___children___children',
  children___parent___internal___content = 'children___parent___internal___content',
  children___parent___internal___contentDigest = 'children___parent___internal___contentDigest',
  children___parent___internal___description = 'children___parent___internal___description',
  children___parent___internal___fieldOwners = 'children___parent___internal___fieldOwners',
  children___parent___internal___ignoreType = 'children___parent___internal___ignoreType',
  children___parent___internal___mediaType = 'children___parent___internal___mediaType',
  children___parent___internal___owner = 'children___parent___internal___owner',
  children___parent___internal___type = 'children___parent___internal___type',
  children___children = 'children___children',
  children___children___id = 'children___children___id',
  children___children___parent___id = 'children___children___parent___id',
  children___children___parent___children = 'children___children___parent___children',
  children___children___children = 'children___children___children',
  children___children___children___id = 'children___children___children___id',
  children___children___children___children = 'children___children___children___children',
  children___children___internal___content = 'children___children___internal___content',
  children___children___internal___contentDigest = 'children___children___internal___contentDigest',
  children___children___internal___description = 'children___children___internal___description',
  children___children___internal___fieldOwners = 'children___children___internal___fieldOwners',
  children___children___internal___ignoreType = 'children___children___internal___ignoreType',
  children___children___internal___mediaType = 'children___children___internal___mediaType',
  children___children___internal___owner = 'children___children___internal___owner',
  children___children___internal___type = 'children___children___internal___type',
  children___internal___content = 'children___internal___content',
  children___internal___contentDigest = 'children___internal___contentDigest',
  children___internal___description = 'children___internal___description',
  children___internal___fieldOwners = 'children___internal___fieldOwners',
  children___internal___ignoreType = 'children___internal___ignoreType',
  children___internal___mediaType = 'children___internal___mediaType',
  children___internal___owner = 'children___internal___owner',
  children___internal___type = 'children___internal___type',
  internal___content = 'internal___content',
  internal___contentDigest = 'internal___contentDigest',
  internal___description = 'internal___description',
  internal___fieldOwners = 'internal___fieldOwners',
  internal___ignoreType = 'internal___ignoreType',
  internal___mediaType = 'internal___mediaType',
  internal___owner = 'internal___owner',
  internal___type = 'internal___type',
  path = 'path',
  internalComponentName = 'internalComponentName',
  component = 'component',
  componentChunkName = 'componentChunkName',
  isCreatedByStatefulCreatePages = 'isCreatedByStatefulCreatePages',
  context___id = 'context___id',
  context___relativePath = 'context___relativePath',
  context___frontmatter___title = 'context___frontmatter___title',
  context___frontmatter___fullWidth = 'context___frontmatter___fullWidth',
  pluginCreator___id = 'pluginCreator___id',
  pluginCreator___parent___id = 'pluginCreator___parent___id',
  pluginCreator___parent___parent___id = 'pluginCreator___parent___parent___id',
  pluginCreator___parent___parent___children = 'pluginCreator___parent___parent___children',
  pluginCreator___parent___children = 'pluginCreator___parent___children',
  pluginCreator___parent___children___id = 'pluginCreator___parent___children___id',
  pluginCreator___parent___children___children = 'pluginCreator___parent___children___children',
  pluginCreator___parent___internal___content = 'pluginCreator___parent___internal___content',
  pluginCreator___parent___internal___contentDigest = 'pluginCreator___parent___internal___contentDigest',
  pluginCreator___parent___internal___description = 'pluginCreator___parent___internal___description',
  pluginCreator___parent___internal___fieldOwners = 'pluginCreator___parent___internal___fieldOwners',
  pluginCreator___parent___internal___ignoreType = 'pluginCreator___parent___internal___ignoreType',
  pluginCreator___parent___internal___mediaType = 'pluginCreator___parent___internal___mediaType',
  pluginCreator___parent___internal___owner = 'pluginCreator___parent___internal___owner',
  pluginCreator___parent___internal___type = 'pluginCreator___parent___internal___type',
  pluginCreator___children = 'pluginCreator___children',
  pluginCreator___children___id = 'pluginCreator___children___id',
  pluginCreator___children___parent___id = 'pluginCreator___children___parent___id',
  pluginCreator___children___parent___children = 'pluginCreator___children___parent___children',
  pluginCreator___children___children = 'pluginCreator___children___children',
  pluginCreator___children___children___id = 'pluginCreator___children___children___id',
  pluginCreator___children___children___children = 'pluginCreator___children___children___children',
  pluginCreator___children___internal___content = 'pluginCreator___children___internal___content',
  pluginCreator___children___internal___contentDigest = 'pluginCreator___children___internal___contentDigest',
  pluginCreator___children___internal___description = 'pluginCreator___children___internal___description',
  pluginCreator___children___internal___fieldOwners = 'pluginCreator___children___internal___fieldOwners',
  pluginCreator___children___internal___ignoreType = 'pluginCreator___children___internal___ignoreType',
  pluginCreator___children___internal___mediaType = 'pluginCreator___children___internal___mediaType',
  pluginCreator___children___internal___owner = 'pluginCreator___children___internal___owner',
  pluginCreator___children___internal___type = 'pluginCreator___children___internal___type',
  pluginCreator___internal___content = 'pluginCreator___internal___content',
  pluginCreator___internal___contentDigest = 'pluginCreator___internal___contentDigest',
  pluginCreator___internal___description = 'pluginCreator___internal___description',
  pluginCreator___internal___fieldOwners = 'pluginCreator___internal___fieldOwners',
  pluginCreator___internal___ignoreType = 'pluginCreator___internal___ignoreType',
  pluginCreator___internal___mediaType = 'pluginCreator___internal___mediaType',
  pluginCreator___internal___owner = 'pluginCreator___internal___owner',
  pluginCreator___internal___type = 'pluginCreator___internal___type',
  pluginCreator___resolve = 'pluginCreator___resolve',
  pluginCreator___name = 'pluginCreator___name',
  pluginCreator___version = 'pluginCreator___version',
  pluginCreator___pluginOptions___name = 'pluginCreator___pluginOptions___name',
  pluginCreator___pluginOptions___path = 'pluginCreator___pluginOptions___path',
  pluginCreator___pluginOptions___ignore = 'pluginCreator___pluginOptions___ignore',
  pluginCreator___pluginOptions___extensions = 'pluginCreator___pluginOptions___extensions',
  pluginCreator___pluginOptions___trackingId = 'pluginCreator___pluginOptions___trackingId',
  pluginCreator___pluginOptions___short_name = 'pluginCreator___pluginOptions___short_name',
  pluginCreator___pluginOptions___start_url = 'pluginCreator___pluginOptions___start_url',
  pluginCreator___pluginOptions___lang = 'pluginCreator___pluginOptions___lang',
  pluginCreator___pluginOptions___description = 'pluginCreator___pluginOptions___description',
  pluginCreator___pluginOptions___icon = 'pluginCreator___pluginOptions___icon',
  pluginCreator___pluginOptions___typeDefsOutputPath = 'pluginCreator___pluginOptions___typeDefsOutputPath',
  pluginCreator___pluginOptions___pathCheck = 'pluginCreator___pluginOptions___pathCheck',
  pluginCreator___nodeAPIs = 'pluginCreator___nodeAPIs',
  pluginCreator___browserAPIs = 'pluginCreator___browserAPIs',
  pluginCreator___ssrAPIs = 'pluginCreator___ssrAPIs',
  pluginCreator___pluginFilepath = 'pluginCreator___pluginFilepath',
  pluginCreator___packageJson___name = 'pluginCreator___packageJson___name',
  pluginCreator___packageJson___description = 'pluginCreator___packageJson___description',
  pluginCreator___packageJson___version = 'pluginCreator___packageJson___version',
  pluginCreator___packageJson___main = 'pluginCreator___packageJson___main',
  pluginCreator___packageJson___author = 'pluginCreator___packageJson___author',
  pluginCreator___packageJson___license = 'pluginCreator___packageJson___license',
  pluginCreator___packageJson___dependencies = 'pluginCreator___packageJson___dependencies',
  pluginCreator___packageJson___dependencies___name = 'pluginCreator___packageJson___dependencies___name',
  pluginCreator___packageJson___dependencies___version = 'pluginCreator___packageJson___dependencies___version',
  pluginCreator___packageJson___devDependencies = 'pluginCreator___packageJson___devDependencies',
  pluginCreator___packageJson___devDependencies___name = 'pluginCreator___packageJson___devDependencies___name',
  pluginCreator___packageJson___devDependencies___version = 'pluginCreator___packageJson___devDependencies___version',
  pluginCreator___packageJson___peerDependencies = 'pluginCreator___packageJson___peerDependencies',
  pluginCreator___packageJson___peerDependencies___name = 'pluginCreator___packageJson___peerDependencies___name',
  pluginCreator___packageJson___peerDependencies___version = 'pluginCreator___packageJson___peerDependencies___version',
  pluginCreator___packageJson___keywords = 'pluginCreator___packageJson___keywords',
  pluginCreatorId = 'pluginCreatorId',
  componentPath = 'componentPath'
}

export type SitePageFilterInput = {
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  path: Maybe<StringQueryOperatorInput>,
  internalComponentName: Maybe<StringQueryOperatorInput>,
  component: Maybe<StringQueryOperatorInput>,
  componentChunkName: Maybe<StringQueryOperatorInput>,
  isCreatedByStatefulCreatePages: Maybe<BooleanQueryOperatorInput>,
  context: Maybe<SitePageContextFilterInput>,
  pluginCreator: Maybe<SitePluginFilterInput>,
  pluginCreatorId: Maybe<StringQueryOperatorInput>,
  componentPath: Maybe<StringQueryOperatorInput>,
};

export type SitePageGroupConnection = {
   __typename?: 'SitePageGroupConnection',
  totalCount: Scalars['Int'],
  edges: Array<SitePageEdge>,
  nodes: Array<SitePage>,
  pageInfo: PageInfo,
  field: Scalars['String'],
  fieldValue: Maybe<Scalars['String']>,
};

export type SitePageSortInput = {
  fields: Maybe<Array<Maybe<SitePageFieldsEnum>>>,
  order: Maybe<Array<Maybe<SortOrderEnum>>>,
};

export type SitePlugin = Node & {
   __typename?: 'SitePlugin',
  id: Scalars['ID'],
  parent: Maybe<Node>,
  children: Array<Node>,
  internal: Internal,
  resolve: Maybe<Scalars['String']>,
  name: Maybe<Scalars['String']>,
  version: Maybe<Scalars['String']>,
  pluginOptions: Maybe<SitePluginPluginOptions>,
  nodeAPIs: Maybe<Array<Maybe<Scalars['String']>>>,
  browserAPIs: Maybe<Array<Maybe<Scalars['String']>>>,
  ssrAPIs: Maybe<Array<Maybe<Scalars['String']>>>,
  pluginFilepath: Maybe<Scalars['String']>,
  packageJson: Maybe<SitePluginPackageJson>,
};

export type SitePluginConnection = {
   __typename?: 'SitePluginConnection',
  totalCount: Scalars['Int'],
  edges: Array<SitePluginEdge>,
  nodes: Array<SitePlugin>,
  pageInfo: PageInfo,
  distinct: Array<Scalars['String']>,
  group: Array<SitePluginGroupConnection>,
};


export type SitePluginConnectionDistinctArgs = {
  field: SitePluginFieldsEnum
};


export type SitePluginConnectionGroupArgs = {
  skip: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>,
  field: SitePluginFieldsEnum
};

export type SitePluginEdge = {
   __typename?: 'SitePluginEdge',
  next: Maybe<SitePlugin>,
  node: SitePlugin,
  previous: Maybe<SitePlugin>,
};

export enum SitePluginFieldsEnum {
  id = 'id',
  parent___id = 'parent___id',
  parent___parent___id = 'parent___parent___id',
  parent___parent___parent___id = 'parent___parent___parent___id',
  parent___parent___parent___children = 'parent___parent___parent___children',
  parent___parent___children = 'parent___parent___children',
  parent___parent___children___id = 'parent___parent___children___id',
  parent___parent___children___children = 'parent___parent___children___children',
  parent___parent___internal___content = 'parent___parent___internal___content',
  parent___parent___internal___contentDigest = 'parent___parent___internal___contentDigest',
  parent___parent___internal___description = 'parent___parent___internal___description',
  parent___parent___internal___fieldOwners = 'parent___parent___internal___fieldOwners',
  parent___parent___internal___ignoreType = 'parent___parent___internal___ignoreType',
  parent___parent___internal___mediaType = 'parent___parent___internal___mediaType',
  parent___parent___internal___owner = 'parent___parent___internal___owner',
  parent___parent___internal___type = 'parent___parent___internal___type',
  parent___children = 'parent___children',
  parent___children___id = 'parent___children___id',
  parent___children___parent___id = 'parent___children___parent___id',
  parent___children___parent___children = 'parent___children___parent___children',
  parent___children___children = 'parent___children___children',
  parent___children___children___id = 'parent___children___children___id',
  parent___children___children___children = 'parent___children___children___children',
  parent___children___internal___content = 'parent___children___internal___content',
  parent___children___internal___contentDigest = 'parent___children___internal___contentDigest',
  parent___children___internal___description = 'parent___children___internal___description',
  parent___children___internal___fieldOwners = 'parent___children___internal___fieldOwners',
  parent___children___internal___ignoreType = 'parent___children___internal___ignoreType',
  parent___children___internal___mediaType = 'parent___children___internal___mediaType',
  parent___children___internal___owner = 'parent___children___internal___owner',
  parent___children___internal___type = 'parent___children___internal___type',
  parent___internal___content = 'parent___internal___content',
  parent___internal___contentDigest = 'parent___internal___contentDigest',
  parent___internal___description = 'parent___internal___description',
  parent___internal___fieldOwners = 'parent___internal___fieldOwners',
  parent___internal___ignoreType = 'parent___internal___ignoreType',
  parent___internal___mediaType = 'parent___internal___mediaType',
  parent___internal___owner = 'parent___internal___owner',
  parent___internal___type = 'parent___internal___type',
  children = 'children',
  children___id = 'children___id',
  children___parent___id = 'children___parent___id',
  children___parent___parent___id = 'children___parent___parent___id',
  children___parent___parent___children = 'children___parent___parent___children',
  children___parent___children = 'children___parent___children',
  children___parent___children___id = 'children___parent___children___id',
  children___parent___children___children = 'children___parent___children___children',
  children___parent___internal___content = 'children___parent___internal___content',
  children___parent___internal___contentDigest = 'children___parent___internal___contentDigest',
  children___parent___internal___description = 'children___parent___internal___description',
  children___parent___internal___fieldOwners = 'children___parent___internal___fieldOwners',
  children___parent___internal___ignoreType = 'children___parent___internal___ignoreType',
  children___parent___internal___mediaType = 'children___parent___internal___mediaType',
  children___parent___internal___owner = 'children___parent___internal___owner',
  children___parent___internal___type = 'children___parent___internal___type',
  children___children = 'children___children',
  children___children___id = 'children___children___id',
  children___children___parent___id = 'children___children___parent___id',
  children___children___parent___children = 'children___children___parent___children',
  children___children___children = 'children___children___children',
  children___children___children___id = 'children___children___children___id',
  children___children___children___children = 'children___children___children___children',
  children___children___internal___content = 'children___children___internal___content',
  children___children___internal___contentDigest = 'children___children___internal___contentDigest',
  children___children___internal___description = 'children___children___internal___description',
  children___children___internal___fieldOwners = 'children___children___internal___fieldOwners',
  children___children___internal___ignoreType = 'children___children___internal___ignoreType',
  children___children___internal___mediaType = 'children___children___internal___mediaType',
  children___children___internal___owner = 'children___children___internal___owner',
  children___children___internal___type = 'children___children___internal___type',
  children___internal___content = 'children___internal___content',
  children___internal___contentDigest = 'children___internal___contentDigest',
  children___internal___description = 'children___internal___description',
  children___internal___fieldOwners = 'children___internal___fieldOwners',
  children___internal___ignoreType = 'children___internal___ignoreType',
  children___internal___mediaType = 'children___internal___mediaType',
  children___internal___owner = 'children___internal___owner',
  children___internal___type = 'children___internal___type',
  internal___content = 'internal___content',
  internal___contentDigest = 'internal___contentDigest',
  internal___description = 'internal___description',
  internal___fieldOwners = 'internal___fieldOwners',
  internal___ignoreType = 'internal___ignoreType',
  internal___mediaType = 'internal___mediaType',
  internal___owner = 'internal___owner',
  internal___type = 'internal___type',
  resolve = 'resolve',
  name = 'name',
  version = 'version',
  pluginOptions___name = 'pluginOptions___name',
  pluginOptions___path = 'pluginOptions___path',
  pluginOptions___ignore = 'pluginOptions___ignore',
  pluginOptions___extensions = 'pluginOptions___extensions',
  pluginOptions___trackingId = 'pluginOptions___trackingId',
  pluginOptions___short_name = 'pluginOptions___short_name',
  pluginOptions___start_url = 'pluginOptions___start_url',
  pluginOptions___lang = 'pluginOptions___lang',
  pluginOptions___description = 'pluginOptions___description',
  pluginOptions___icon = 'pluginOptions___icon',
  pluginOptions___typeDefsOutputPath = 'pluginOptions___typeDefsOutputPath',
  pluginOptions___pathCheck = 'pluginOptions___pathCheck',
  nodeAPIs = 'nodeAPIs',
  browserAPIs = 'browserAPIs',
  ssrAPIs = 'ssrAPIs',
  pluginFilepath = 'pluginFilepath',
  packageJson___name = 'packageJson___name',
  packageJson___description = 'packageJson___description',
  packageJson___version = 'packageJson___version',
  packageJson___main = 'packageJson___main',
  packageJson___author = 'packageJson___author',
  packageJson___license = 'packageJson___license',
  packageJson___dependencies = 'packageJson___dependencies',
  packageJson___dependencies___name = 'packageJson___dependencies___name',
  packageJson___dependencies___version = 'packageJson___dependencies___version',
  packageJson___devDependencies = 'packageJson___devDependencies',
  packageJson___devDependencies___name = 'packageJson___devDependencies___name',
  packageJson___devDependencies___version = 'packageJson___devDependencies___version',
  packageJson___peerDependencies = 'packageJson___peerDependencies',
  packageJson___peerDependencies___name = 'packageJson___peerDependencies___name',
  packageJson___peerDependencies___version = 'packageJson___peerDependencies___version',
  packageJson___keywords = 'packageJson___keywords'
}

export type SitePluginFilterInput = {
  id: Maybe<StringQueryOperatorInput>,
  parent: Maybe<NodeFilterInput>,
  children: Maybe<NodeFilterListInput>,
  internal: Maybe<InternalFilterInput>,
  resolve: Maybe<StringQueryOperatorInput>,
  name: Maybe<StringQueryOperatorInput>,
  version: Maybe<StringQueryOperatorInput>,
  pluginOptions: Maybe<SitePluginPluginOptionsFilterInput>,
  nodeAPIs: Maybe<StringQueryOperatorInput>,
  browserAPIs: Maybe<StringQueryOperatorInput>,
  ssrAPIs: Maybe<StringQueryOperatorInput>,
  pluginFilepath: Maybe<StringQueryOperatorInput>,
  packageJson: Maybe<SitePluginPackageJsonFilterInput>,
};

export type SitePluginGroupConnection = {
   __typename?: 'SitePluginGroupConnection',
  totalCount: Scalars['Int'],
  edges: Array<SitePluginEdge>,
  nodes: Array<SitePlugin>,
  pageInfo: PageInfo,
  field: Scalars['String'],
  fieldValue: Maybe<Scalars['String']>,
};

export type SitePluginPackageJson = {
   __typename?: 'SitePluginPackageJson',
  name: Maybe<Scalars['String']>,
  description: Maybe<Scalars['String']>,
  version: Maybe<Scalars['String']>,
  main: Maybe<Scalars['String']>,
  author: Maybe<Scalars['String']>,
  license: Maybe<Scalars['String']>,
  dependencies: Maybe<Array<Maybe<SitePluginPackageJsonDependencies>>>,
  devDependencies: Maybe<Array<Maybe<SitePluginPackageJsonDevDependencies>>>,
  peerDependencies: Maybe<Array<Maybe<SitePluginPackageJsonPeerDependencies>>>,
  keywords: Maybe<Array<Maybe<Scalars['String']>>>,
};

export type SitePluginPackageJsonDependencies = {
   __typename?: 'SitePluginPackageJsonDependencies',
  name: Maybe<Scalars['String']>,
  version: Maybe<Scalars['String']>,
};

export type SitePluginPackageJsonDependenciesFilterInput = {
  name: Maybe<StringQueryOperatorInput>,
  version: Maybe<StringQueryOperatorInput>,
};

export type SitePluginPackageJsonDependenciesFilterListInput = {
  elemMatch: Maybe<SitePluginPackageJsonDependenciesFilterInput>,
};

export type SitePluginPackageJsonDevDependencies = {
   __typename?: 'SitePluginPackageJsonDevDependencies',
  name: Maybe<Scalars['String']>,
  version: Maybe<Scalars['String']>,
};

export type SitePluginPackageJsonDevDependenciesFilterInput = {
  name: Maybe<StringQueryOperatorInput>,
  version: Maybe<StringQueryOperatorInput>,
};

export type SitePluginPackageJsonDevDependenciesFilterListInput = {
  elemMatch: Maybe<SitePluginPackageJsonDevDependenciesFilterInput>,
};

export type SitePluginPackageJsonFilterInput = {
  name: Maybe<StringQueryOperatorInput>,
  description: Maybe<StringQueryOperatorInput>,
  version: Maybe<StringQueryOperatorInput>,
  main: Maybe<StringQueryOperatorInput>,
  author: Maybe<StringQueryOperatorInput>,
  license: Maybe<StringQueryOperatorInput>,
  dependencies: Maybe<SitePluginPackageJsonDependenciesFilterListInput>,
  devDependencies: Maybe<SitePluginPackageJsonDevDependenciesFilterListInput>,
  peerDependencies: Maybe<SitePluginPackageJsonPeerDependenciesFilterListInput>,
  keywords: Maybe<StringQueryOperatorInput>,
};

export type SitePluginPackageJsonPeerDependencies = {
   __typename?: 'SitePluginPackageJsonPeerDependencies',
  name: Maybe<Scalars['String']>,
  version: Maybe<Scalars['String']>,
};

export type SitePluginPackageJsonPeerDependenciesFilterInput = {
  name: Maybe<StringQueryOperatorInput>,
  version: Maybe<StringQueryOperatorInput>,
};

export type SitePluginPackageJsonPeerDependenciesFilterListInput = {
  elemMatch: Maybe<SitePluginPackageJsonPeerDependenciesFilterInput>,
};

export type SitePluginPluginOptions = {
   __typename?: 'SitePluginPluginOptions',
  name: Maybe<Scalars['String']>,
  path: Maybe<Scalars['String']>,
  ignore: Maybe<Array<Maybe<Scalars['String']>>>,
  extensions: Maybe<Array<Maybe<Scalars['String']>>>,
  trackingId: Maybe<Scalars['String']>,
  short_name: Maybe<Scalars['String']>,
  start_url: Maybe<Scalars['String']>,
  lang: Maybe<Scalars['String']>,
  description: Maybe<Scalars['String']>,
  icon: Maybe<Scalars['String']>,
  typeDefsOutputPath: Maybe<Scalars['String']>,
  pathCheck: Maybe<Scalars['Boolean']>,
};

export type SitePluginPluginOptionsFilterInput = {
  name: Maybe<StringQueryOperatorInput>,
  path: Maybe<StringQueryOperatorInput>,
  ignore: Maybe<StringQueryOperatorInput>,
  extensions: Maybe<StringQueryOperatorInput>,
  trackingId: Maybe<StringQueryOperatorInput>,
  short_name: Maybe<StringQueryOperatorInput>,
  start_url: Maybe<StringQueryOperatorInput>,
  lang: Maybe<StringQueryOperatorInput>,
  description: Maybe<StringQueryOperatorInput>,
  icon: Maybe<StringQueryOperatorInput>,
  typeDefsOutputPath: Maybe<StringQueryOperatorInput>,
  pathCheck: Maybe<BooleanQueryOperatorInput>,
};

export type SitePluginSortInput = {
  fields: Maybe<Array<Maybe<SitePluginFieldsEnum>>>,
  order: Maybe<Array<Maybe<SortOrderEnum>>>,
};

export type SiteSiteMetadata = {
   __typename?: 'SiteSiteMetadata',
  siteUrl: Maybe<Scalars['String']>,
  description: Maybe<Scalars['String']>,
};

export type SiteSiteMetadataFilterInput = {
  siteUrl: Maybe<StringQueryOperatorInput>,
  description: Maybe<StringQueryOperatorInput>,
};

export type SiteSortInput = {
  fields: Maybe<Array<Maybe<SiteFieldsEnum>>>,
  order: Maybe<Array<Maybe<SortOrderEnum>>>,
};

export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC'
}

export type StringQueryOperatorInput = {
  eq: Maybe<Scalars['String']>,
  ne: Maybe<Scalars['String']>,
  in: Maybe<Array<Maybe<Scalars['String']>>>,
  nin: Maybe<Array<Maybe<Scalars['String']>>>,
  regex: Maybe<Scalars['String']>,
  glob: Maybe<Scalars['String']>,
};

export type LoadAllMdxQueryVariables = {};


export type LoadAllMdxQuery = (
  { __typename?: 'Query' }
  & { allMdx: (
    { __typename?: 'MdxConnection' }
    & { edges: Array<(
      { __typename?: 'MdxEdge' }
      & { node: (
        { __typename?: 'Mdx' }
        & Pick<Mdx, 'id' | 'fileAbsolutePath'>
        & { fields: Maybe<(
          { __typename?: 'MdxFields' }
          & Pick<MdxFields, 'slug'>
        )> }
      ) }
    )> }
  ) }
);

export type EntryQueryVariables = {
  id: Scalars['String']
};


export type EntryQuery = (
  { __typename?: 'Query' }
  & { mdx: Maybe<(
    { __typename?: 'Mdx' }
    & Pick<Mdx, 'id' | 'body' | 'timeToRead'>
    & { frontmatter: Maybe<(
      { __typename?: 'MdxFrontmatter' }
      & Pick<MdxFrontmatter, 'fullWidth' | 'title'>
    )>, wordCount: Maybe<(
      { __typename?: 'MdxWordCount' }
      & Pick<MdxWordCount, 'paragraphs' | 'words' | 'sentences'>
    )> }
  )> }
);
