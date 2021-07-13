/**
 * Taken from
 * https://github.com/guybedford/es-module-shims/blob/47551380d5b22930f4f6e4806f1ff49d2b7e477c/src/es-module-shims.js
 */

import { ImportSpecifier, init, parse } from 'es-module-lexer';
import warning from 'tiny-warning';

import {
  baseUrl as pageBaseUrl,
  createBlob,
  dynamicImport,
  global,
  hasDocument,
  ImportMap,
  resolveAndComposeImportMap,
  resolvedPromise,
  resolveIfNotPlainOrUrl,
  resolveImportMap,
} from './shim-utils';

let id = 0;

interface RegistryUrl {
  // url
  u: string;
  // response url
  r?: string;
  // fetchPromise
  f?: Promise<string[]>;
  // source
  S: string | undefined;
  // linkPromise
  L?: Promise<void>;
  /**
   * The parsed imports.
   */
  a?: readonly [imports: readonly ImportSpecifier[], names: readonly string[]];
  // deps
  d?: RegistryUrl[];
  // blobUrl
  b?: string;
  // shellUrl
  s: string | undefined;
}

interface RequiredRegistryUrl extends Required<Omit<RegistryUrl, 'd'>> {
  d: RequiredRegistryUrl[];
}

const registry: Record<string, RegistryUrl> = {};

async function loadAll(
  load: RegistryUrl,
  seen: Record<string, boolean>,
): Promise<RequiredRegistryUrl> {
  if (load.b || seen[load.u]) {
    return load as RequiredRegistryUrl;
  }

  seen[load.u] = true;
  await load.L;
  await Promise.all(load.d?.map((dep) => loadAll(dep, seen)) ?? []);

  return load as RequiredRegistryUrl;
}

let waitingForImportMapsInterval: ReturnType<typeof setInterval> | undefined;
let firstTopLevelProcess = true;

async function topLevelLoad(url: string, source?: string) {
  if (waitingForImportMapsInterval != null) {
    clearTimeout(waitingForImportMapsInterval);
    waitingForImportMapsInterval = undefined;
  }

  if (firstTopLevelProcess) {
    firstTopLevelProcess = false;
    processScripts();
  }

  await importMapPromise;
  await init;
  const load = getOrCreateLoad(url, source);
  const seen: Record<string, boolean> = {};
  const fullLoad = await loadAll(load, seen);
  lastLoad = undefined;
  resolveDeps(fullLoad, seen);
  const module = await dynamicImport(fullLoad.b);

  // if the top-level load is a shell, run its update function
  if (fullLoad.s) {
    (await dynamicImport(fullLoad.s)).u$_(module);
  }

  return module;
}

const importShim: Window['importShim'] = ((id: string, parentUrl?: string) => {
  return topLevelLoad(resolve(id, parentUrl ?? pageBaseUrl));
}) as any;

global.importShim = importShim;

const meta: Record<string, { url: string; resolve: typeof importMetaResolve }> = {};
const edge = navigator.userAgent.match(/Edge\/\d\d\.\d+$/);

async function importMetaResolve(this: { url: string }, id: string, parentUrl = this.url) {
  await importMapPromise;
  return resolve(id, `${parentUrl}`);
}

Object.defineProperties(importShim, {
  m: { value: meta },
  l: { value: undefined, writable: true },
  e: { value: undefined, writable: true },
});
importShim.fetch = (url) => fetch(url);
importShim.skip = /^https?:\/\/(cdn\.pika\.dev|dev\.jspm\.io|jspm\.dev)\//;
importShim.skipRegistry = () => false;
importShim.load = processScripts;
// eslint-disable-next-line unicorn/prefer-add-event-listener
importShim.onerror = (error: Error) => {
  throw error;
};

let lastLoad: string | undefined;

function resolveDeps(load: RequiredRegistryUrl, seen: Record<string, boolean>) {
  if (load.b || !seen[load.u]) {
    return;
  }

  seen[load.u] = false;

  for (const dep of load.d) {
    resolveDeps(dep, seen);
  }

  // "execution"
  const source = load.S ?? '';
  // edge doesnt execute sibling in order, so we fix this up by ensuring all previous executions are explicit dependencies
  let resolvedSource = edge && lastLoad ? `import '${lastLoad}';` : '';

  const [imports] = load.a;

  if (imports.length === 0) {
    resolvedSource += source;
  } else {
    // once all deps have loaded we can inline the dependency resolution blobs
    // and define this blob
    let lastIndex = 0;
    let depIndex = 0;

    for (const { s: start, e: end, d: dynamicImportIndex } of imports) {
      // dependency source replacements
      if (dynamicImportIndex === -1) {
        const depLoad = load.d[depIndex++];
        let blobUrl = depLoad?.b;

        if (depLoad && !blobUrl) {
          // circular shell creation
          if (!(blobUrl = depLoad.s)) {
            blobUrl = depLoad.s = createBlob(
              `export function u$_(m){${depLoad.a[1]
                .map((name) => (name === 'default' ? `$_default=m.default` : `${name}=m.${name}`))
                .join(',')}}${depLoad.a[1]
                .map((name) =>
                  name === 'default'
                    ? `let $_default;export{$_default as default}`
                    : `export let ${name}`,
                )
                .join(';')}\n//# sourceURL=${depLoad.r}?cycle`,
            );
          }
        }
        // circular shell execution
        else if (depLoad?.s) {
          resolvedSource += `${source.slice(lastIndex, start - 1)}/*${source.slice(
            start - 1,
            end + 1,
          )}*/${source.slice(start - 1, start)}${blobUrl}${
            source[end]
          };import*as m$_${depIndex} from'${depLoad.b}';import{u$_ as u$_${depIndex}}from'${
            depLoad.s
          }';u$_${depIndex}(m$_${depIndex})`;
          lastIndex = end + 1;
          depLoad.s = undefined;
          continue;
        }

        resolvedSource += `${source.slice(lastIndex, start - 1)}/*${source.slice(
          start - 1,
          end + 1,
        )}*/${source.slice(start - 1, start)}${blobUrl}`;
        lastIndex = end;
      }
      // import.meta
      else if (dynamicImportIndex === -2) {
        meta[load.r] = { url: load.r, resolve: importMetaResolve };
        resolvedSource += `${source.slice(lastIndex, start)}importShim.m[${JSON.stringify(
          load.r,
        )}]`;
        lastIndex = end;
      }
      // dynamic import
      else {
        resolvedSource += `${source.slice(lastIndex, dynamicImportIndex + 6)}Shim(${source.slice(
          start,
          end,
        )}, ${JSON.stringify(load.r)}`;
        lastIndex = end;
      }
    }

    resolvedSource += source.slice(lastIndex);
  }

  if (!resolvedSource.includes('//# sourceURL=')) {
    resolvedSource += `\n//# sourceURL=${load.r}`;
  }

  load.b = lastLoad = createBlob(resolvedSource);
  load.S = undefined;
}

/**
 * Return `true` when the url import should not be resolved from the internal
 * registry.
 */
function shouldSkipRegistry(url: string) {
  return typeof importShim.skipRegistry === 'function'
    ? importShim.skipRegistry(url)
    : importShim.skipRegistry.test(url);
}

function getOrCreateLoad(url: string, source?: string): RegistryUrl {
  const cachedLoad = registry[url];

  if (cachedLoad && !shouldSkipRegistry(url)) {
    return cachedLoad;
  }

  const load: RegistryUrl = (registry[url] = {
    // url
    u: url,
    // response url
    r: undefined,
    // fetchPromise
    f: undefined,
    // source
    S: undefined,
    // linkPromise
    L: undefined,
    // analysis
    a: undefined,
    // deps
    d: undefined,
    // blobUrl
    b: undefined,
    // shellUrl
    s: undefined,
  });

  const depcache = importMap.depcache[url];

  if (depcache) {
    depcache.forEach((depUrl) => getOrCreateLoad(resolve(depUrl, url)));
  }

  load.f = (async () => {
    if (!source) {
      const res = await importShim.fetch(url);

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} ${res.url}`);
      }

      load.r = res.url;
      const contentType = res.headers.get('content-type');

      if (contentType?.match(/^(text|application)\/(x-)?javascript(;|$)/)) {
        source = await res.text();
      } else {
        throw new Error(`Unknown Content-Type "${contentType}"`);
      }
    }

    try {
      load.a = parse(source, load.u);
    } catch (error) {
      warning(false, error);
      load.a = [[], []];
    }
    load.S = source;
    return load.a?.[0].filter((d) => d.d === -1).map((d) => source?.slice(d.s, d.e) ?? '') ?? [];
  })();

  load.L = load.f?.then(async (deps) => {
    load.d = await Promise.all(
      deps.map(async (depId) => {
        const resolved = resolve(depId, load.r || load.u);

        if (importShim.skip.test(resolved)) {
          return { b: resolved } as RegistryUrl;
        }

        const depLoad = getOrCreateLoad(resolved);
        await depLoad.f;
        return depLoad;
      }),
    );
  });

  return load;
}

let importMap: Required<ImportMap> = { imports: {}, scopes: {}, depcache: {} };
let importMapPromise: Promise<Required<ImportMap> | void> = resolvedPromise;

if (hasDocument) {
  processScripts();
  waitingForImportMapsInterval = setInterval(processScripts, 20);
}

async function processScripts() {
  if (waitingForImportMapsInterval != null && document.readyState !== 'loading') {
    clearTimeout(waitingForImportMapsInterval);
    waitingForImportMapsInterval = undefined;
  }

  for (const script of document.querySelectorAll<HTMLScriptElement>(
    'script[type="module-shim"],script[type="importmap-shim"]',
  )) {
    if (script.ep) {
      // ep marker = script processed
      continue;
    }

    if (script.type === 'module-shim') {
      await topLevelLoad(
        script.src || `${pageBaseUrl}?${id++}`,
        !script.src ? script.innerHTML : undefined,
      ).catch((error) => importShim.onerror(error));
    } else {
      importMapPromise = importMapPromise.then(
        async () =>
          (importMap = resolveAndComposeImportMap(
            script.src ? await (await fetch(script.src)).json() : JSON.parse(script.innerHTML),
            (script.src || pageBaseUrl) ?? '',
            importMap,
          )),
      );
    }

    script.ep = true;
  }
}

function resolve(id: string, parentUrl?: string): string {
  const value = resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) ?? id, parentUrl);

  if (!value) {
    throwUnresolved(id, parentUrl);
  }

  return value;
}

function throwUnresolved(id: string, parentUrl?: string): never {
  throw new Error(`Unable to resolve specifier '${id}${parentUrl ? `' from ${parentUrl}` : "'"}`);
}

declare global {
  interface Element {
    /**
     * @internal
     */
    ep?: boolean;
  }
}
