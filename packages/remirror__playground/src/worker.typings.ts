/**
 * @worker
 *
 * A worker for generating typings for the playground.
 *
 * Adapted from
 * https://github.com/expo/snack-web/blob/af35e68d99a11efd78e0a159b2d9401fece48fd5/src/client/workers/typings.worker.tsx#L1-L308
 */

/// <reference lib="webworker" />

import { createStore, get, set } from 'idb-keyval';
import path from 'path-browserify';
import registerPromiseWorker from 'promise-worker/register';
import warning from 'tiny-warning';

import { DTS_MODULE_NAMES } from './generated/meta';
import { DATA_ROOT_URL, NPM_ROOT_URL } from './playground-constants';
import type { TypingsWorkerOutput, TypingsWorkerPayload, WorkerData } from './playground-types';
import { getImportStatements } from './playground-utils';

type FetchedPaths = TypingsWorkerOutput['typings'];

interface File {
  name: string;
  type: string;
  path: string;
}

interface FileMetadata {
  [key: string]: File;
}

const store = createStore('typescript-definitions-cache-v1', 'store');
const cache = new Map<string, Promise<string>>();

/**
 * Get the response text from a given request.
 */
function fetchAsText(url: string): Promise<string> {
  const cached = cache.get(url);

  if (cached) {
    // If we have a promise cached for the URL, return it
    return cached;
  }

  const promise = fetch(url).then((response) => {
    if (response.ok) {
      // If response was successful, get the response text
      return response.text();
    }

    throw new Error(response.statusText || `Request failed with status: ${response.status}`);
  });

  // Cache the promise for the URL for subsequent requests
  cache.set(url, promise);

  return promise;
}

/**
 * Fetch definitions published to npm from DefinitelyTyped (@types/x)
 */
async function fetchFromDefinitelyTyped(dependency: string, _: string, fetchedPaths: FetchedPaths) {
  const typings = await fetchAsText(
    `${NPM_ROOT_URL}@types/${dependency.replace('@', '').replace(/\//g, '__')}/index.d.ts`,
  );
  fetchedPaths[`node_modules/${dependency}/index.d.ts`] = typings;
}

/**
 * Get the file meta data for the provided dependency path.
 */
async function getFileMetaData(
  dependency: string,
  version: string,
  dependencyPath: string,
): Promise<FileMetadata> {
  const metadata: FileMetadata = {};
  const text = await fetchAsText(`${DATA_ROOT_URL}${dependency}@${version}/flat`);
  const json: { files: File[] } = JSON.parse(text);
  const files = json.files.filter((file) => file.name.startsWith(dependencyPath));

  for (const file of files) {
    metadata[file.name] = file;
  }

  return metadata;
}

function resolveAppropriateFile(fileMetaData: FileMetadata, relativePath: string) {
  const absolutePath = `/${relativePath}`;

  if (fileMetaData[`${absolutePath}.d.ts`]) {
    return `${relativePath}.d.ts`;
  }

  if (fileMetaData[`${absolutePath}.ts`]) {
    return `${relativePath}.ts`;
  }

  if (fileMetaData[absolutePath]) {
    return relativePath;
  }

  if (fileMetaData[`${absolutePath}/index.d.ts`]) {
    return `${relativePath}/index.d.ts`;
  }

  return relativePath;
}

function getFileTypes(
  dependencyUrl: string,
  dependencyName: string,
  relativePath: string,
  fetchedPaths: FetchedPaths,
  fileMetaData: FileMetadata,
): Promise<any> {
  const virtualPath = path.join('node_modules', dependencyName, relativePath);

  if (fetchedPaths[virtualPath]) {
    return Promise.resolve();
  }

  return fetchAsText(`${dependencyUrl}/${relativePath}`).then((content: string): any => {
    if (fetchedPaths[virtualPath]) {
      return;
    }

    fetchedPaths[virtualPath] = content;

    // Now find all require statements, so we can download those types too
    return Promise.all(
      getImportStatements(relativePath, content)
        .filter(
          // Don't add global deps
          (dep) => dep.startsWith('.'),
        )
        .map((relativePath) => path.join(path.dirname(relativePath), relativePath))
        .map((relativePath) => resolveAppropriateFile(fileMetaData, relativePath))
        .map((nextDepPath) =>
          getFileTypes(dependencyUrl, dependencyName, nextDepPath, fetchedPaths, fileMetaData),
        ),
    );
  });
}

/** Get the list of matching files in the package as a flat array */
function filterAndFlatten(files: File[], filter: RegExp) {
  const paths: string[] = [];

  for (const file of files) {
    if (filter.test(file.name)) {
      paths.push(file.name);
    }
  }

  return paths;
}

/**
 * Add the dependency to the fetched paths.
 */
async function fetchFromMeta(dependency: string, version: string, fetchedPaths: FetchedPaths) {
  const response = await fetchAsText(`${DATA_ROOT_URL}${dependency}@${version}/flat`);
  const meta: { files: File[] } = JSON.parse(response);

  // Get the list of .d.ts files in the package
  let declarations = filterAndFlatten(meta.files, /\.d\.ts$/);

  if (declarations.length === 0) {
    // If no .d.ts files found, fallback to .ts files
    declarations = filterAndFlatten(meta.files, /\.ts$/);
  }

  if (declarations.length === 0) {
    throw new Error(`No inline typings found for ${dependency}@${version}`);
  }

  // Also add package.json so TypeScript can find the correct entry file
  declarations.push('/package.json');

  const items = await Promise.all(
    declarations.map((file) => {
      return fetchAsText(`${NPM_ROOT_URL}${dependency}@${version}${file}`).then(
        (content: string): [string, string] => [`node_modules/${dependency}${file}`, content],
      );
    }),
  );

  for (const [key, value] of items) {
    fetchedPaths[key] = value;
  }
}

function fetchFromTypings(dependency: string, version: string, fetchedPaths: FetchedPaths) {
  const depUrl = `${NPM_ROOT_URL}${dependency}@${version}`;

  return fetchAsText(`${depUrl}/package.json`)
    .then((response: string) => JSON.parse(response))
    .then((packageJSON: { typings?: string; types?: string }) => {
      const types = packageJSON.typings ?? packageJSON.types;

      if (types) {
        // Add package.json, since this defines where all types lie
        fetchedPaths[`node_modules/${dependency}/package.json`] = JSON.stringify(packageJSON);

        // Get all files in the specified directory
        return getFileMetaData(dependency, version, path.join('/', path.dirname(types))).then(
          (fileMetaData: FileMetadata) =>
            getFileTypes(
              depUrl,
              dependency,
              resolveAppropriateFile(fileMetaData, types),
              fetchedPaths,
              fileMetaData,
            ),
        );
      }

      throw new Error(`No typings field in package.json for ${dependency}@${version}`);
    });
}

/**
 * Initialize the definitions.
 */
async function initDefinitions() {
  const { DTS_CACHE } = await import('./generated/exports');
  const result: FetchedPaths = {};

  for (const [packageName, relativeContents] of Object.entries(DTS_CACHE)) {
    for (const [relativePath, contents] of Object.entries(relativeContents)) {
      const virtualPath = path.join('node_modules', packageName, relativePath);
      result[virtualPath] = contents;
    }
  }

  return result;
}

/**
 * Load the definitions.
 */
async function fetchDefinitions(payload: TypingsWorkerPayload) {
  const { name, version = 'latest' } = payload;

  // Don't fetch definitions for already fetched module names.
  if (DTS_MODULE_NAMES.has(name)) {
    return {};
  }

  // Query cache for the definitions
  const key = `${name}@${version}`;

  let result: FetchedPaths | undefined;

  try {
    result = await get(key, store);
  } catch (error) {
    warning(false, `An error occurred when getting definitions from cache ${error.message}`);
    result = undefined;
  }

  if (result) {
    return result;
  }

  // If result is empty, fetch from remote
  const fetchedPaths = {};

  const fetchPromise: Promise<void> = fetchFromTypings(name, version, fetchedPaths)
    .catch(() =>
      // Not available in package.json, try checking meta for inline .d.ts files
      fetchFromMeta(name, version, fetchedPaths),
    )
    .catch(() =>
      // Not available in package.json or inline from meta, try checking in @types/
      fetchFromDefinitelyTyped(name, version, fetchedPaths),
    );

  await fetchPromise;

  if (Object.keys(fetchedPaths).length > 0) {
    // Also cache the definitions
    set(key, fetchedPaths, store);

    return fetchedPaths;
  }

  throw new Error(`Type definitions are empty for ${key}`);
}

registerPromiseWorker(async (data: WorkerData): Promise<TypingsWorkerOutput | null> => {
  if (data.type === 'typings') {
    const payload = await fetchDefinitions(data);

    return { type: 'typings-success', typings: payload };
  }

  if (data.type === 'typings-init') {
    const payload = await initDefinitions();

    return { type: 'typings-success', typings: payload };
  }

  return null;
});
