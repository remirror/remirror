import warning from 'tiny-warning';

export const hasSelf = typeof self !== 'undefined';

let baseUrl: string | undefined;
const envGlobal = hasSelf ? self : globalThis;

export const resolvedPromise = Promise.resolve();

export function createBlob(source: BlobPart): string {
  return URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
}

export const hasDocument = typeof document !== 'undefined';

/** Support for browsers without dynamic import (eg Firefox 6x) */
let dynamicImport: (path: string) => Promise<{ [key: string]: any; default: any }>;

try {
  dynamicImport = (0, eval)('u=>import(u)');
} catch {
  if (hasDocument) {
    self.addEventListener('error', (e) => (importShim.e = e.error));
    dynamicImport = (blobUrl: string): Promise<{ [key: string]: any; default: any }> => {
      const topLevelBlobUrl = createBlob(
        `import*as m from'${blobUrl}';self.importShim.l=m;self.importShim.e=null`,
      );
      const s = document.createElement('script');
      s.type = 'module';
      s.src = topLevelBlobUrl;
      document.head.append(s);
      return new Promise((resolve, reject) => {
        s.addEventListener('load', () => {
          s.remove();
          importShim.e ? reject(importShim.e) : resolve(importShim.l);
        });
      });
    };
  }
}

if (hasDocument) {
  const baseEl = document.querySelector<HTMLAnchorElement>('base[href]');

  if (baseEl) {
    baseUrl = baseEl.href;
  }
}

if (!baseUrl && typeof location !== 'undefined') {
  baseUrl = location.href.split('#')[0]?.split('?')[0];
  const lastSepIndex = baseUrl?.lastIndexOf('/');

  if (lastSepIndex != null && lastSepIndex !== -1) {
    baseUrl = baseUrl?.slice(0, lastSepIndex + 1);
  }
}

const backslashRegEx = /\\/g;
export function resolveIfNotPlainOrUrl(
  relativeUrl: string,
  parentUrl?: string,
): string | undefined {
  // strip off any trailing query params or hashes
  parentUrl = parentUrl?.split('#')[0]?.split('?')[0];

  if (relativeUrl.includes('\\')) {
    relativeUrl = relativeUrl.replace(backslashRegEx, '/');
  }

  // protocol-relative
  if (relativeUrl[0] === '/' && relativeUrl[1] === '/') {
    return `${parentUrl?.slice(0, parentUrl.indexOf(':') + 1)}${relativeUrl}`;
  }
  // relative-url
  else if (
    (relativeUrl[0] === '.' &&
      (relativeUrl[1] === '/' ||
        (relativeUrl[1] === '.' &&
          (relativeUrl[2] === '/' || (relativeUrl.length === 2 && (relativeUrl += '/')))) ||
        (relativeUrl.length === 1 && (relativeUrl += '/')))) ||
    relativeUrl[0] === '/'
  ) {
    const parentProtocol = parentUrl?.slice(0, parentUrl.indexOf(':') + 1) ?? '';
    // Disabled, but these cases will give inconsistent results for deep backtracking
    //if (parentUrl[parentProtocol.length] !== '/')
    //  throw new Error('Cannot resolve');
    // read pathname from parent URL
    // pathname taken to be part after leading "/"
    let pathname: string;

    if (parentUrl?.[parentProtocol.length + 1] === '/') {
      // resolving to a :// so we need to read out the auth and host
      if (parentProtocol !== 'file:') {
        pathname = parentUrl.slice(parentProtocol.length + 2);
        pathname = pathname.slice(pathname.indexOf('/') + 1);
      } else {
        pathname = parentUrl.slice(8);
      }
    } else {
      // resolving to :/ so pathname is the /... part
      pathname =
        parentUrl?.slice(
          parentProtocol.length + (parentUrl?.[parentProtocol.length] === '/' ? 1 : 0),
        ) ?? '';
    }

    if (relativeUrl[0] === '/') {
      return parentUrl?.slice(0, parentUrl.length - pathname?.length - 1) + relativeUrl;
    }

    // join together and split for removal of .. and . segments
    // looping the string instead of anything fancy for perf reasons
    // '../../../../../z' resolved to 'x/y' is just 'z'
    const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relativeUrl;

    const output = [];
    let segmentIndex = -1;

    for (let i = 0; i < segmented.length; i++) {
      // busy reading a segment - only terminate on '/'
      if (segmentIndex !== -1) {
        if (segmented[i] === '/') {
          output.push(segmented.slice(segmentIndex, i + 1));
          segmentIndex = -1;
        }
      }

      // new segment - check if it is relative
      else if (segmented[i] === '.') {
        // ../ segment
        if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
          output.pop();
          i += 2;
        }
        // ./ segment
        else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
          i += 1;
        } else {
          // the start of a new segment as below
          segmentIndex = i;
        }
      }
      // it is the start of a new segment
      else {
        segmentIndex = i;
      }
    }

    // finish reading out the last segment
    if (segmentIndex !== -1) {
      output.push(segmented.slice(segmentIndex));
    }

    return `${parentUrl?.slice(0, parentUrl.length - pathname.length)}${output.join('')}`;
  }

  return;
}

/*
 * Import maps implementation
 *
 * To make lookups fast we pre-resolve the entire import map
 * and then match based on backtracked hash lookups
 *
 */
export function resolveUrl(relUrl: string, parentUrl?: string): string | undefined {
  return (
    resolveIfNotPlainOrUrl(relUrl, parentUrl) ||
    (relUrl.includes(':') ? relUrl : resolveIfNotPlainOrUrl(`./${relUrl}`, parentUrl))
  );
}

function resolveAndComposePackages(
  packages: ImportMapImports,
  outPackages: ImportMapImports,
  baseUrl: string,
  parentMap: ImportMap,
) {
  for (const key of Object.keys(packages)) {
    const resolvedLhs = resolveIfNotPlainOrUrl(key, baseUrl) || key;
    const target = packages[key];

    if (typeof target !== 'string') {
      continue;
    }

    const mapped = resolveImportMap(
      parentMap,
      resolveIfNotPlainOrUrl(target, baseUrl) || target,
      baseUrl,
    );

    if (mapped) {
      outPackages[resolvedLhs] = mapped;
      continue;
    }

    targetWarning(key, target, 'bare specifier did not resolve');
  }
}

export interface ImportMapImports {
  [key: string]: string;
}

export interface ImportMapScopes {
  [key: string]: ImportMapImports;
}

export interface ImportMapDepcache {
  [key: string]: string[];
}

/**
 * The structure for import maps as defined by the `ECMAScript` spec.
 */
export interface ImportMap {
  imports?: ImportMapImports;
  scopes?: ImportMapScopes;
  depcache: ImportMapDepcache;
}

export function resolveAndComposeImportMap(
  json: ImportMap,
  baseUrl: string,
  parentMap: ImportMap,
): Required<ImportMap> {
  const outMap = {
    imports: { ...parentMap.imports },
    scopes: { ...parentMap.scopes },
    depcache: { ...parentMap.depcache },
  };

  if (json.imports) {
    resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap);
  }

  for (const [scope, value] of Object.entries(json.scopes ?? {})) {
    const resolvedScope = resolveUrl(scope, baseUrl);

    if (!resolvedScope) {
      continue;
    }

    resolveAndComposePackages(value, (outMap.scopes[resolvedScope] ??= {}), baseUrl, parentMap);
  }

  for (const [key, value] of Object.entries(json.depcache ?? {})) {
    const resolvedDepcache = resolveUrl(key, baseUrl);

    if (!resolvedDepcache) {
      continue;
    }

    outMap.depcache[resolvedDepcache] = value;
  }

  return outMap;
}

function getMatch(path: string, matchObj: ImportMapScopes | ImportMapImports) {
  if (matchObj[path]) {
    return path;
  }

  let sepIndex = path.length;

  do {
    const segment = path.slice(0, sepIndex + 1);

    if (segment in matchObj) {
      return segment;
    }
  } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1);

  return;
}

function applyPackages(id: string, packages: ImportMapImports) {
  const pkgName = getMatch(id, packages);

  if (!pkgName) {
    return;
  }

  const pkg = packages[pkgName];

  if (pkg == null) {
    return;
  }

  if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/') {
    targetWarning(pkgName, pkg, "should have a trailing '/'");
    return;
  }

  return pkg + id.slice(pkgName.length);
}

function targetWarning(match: string, target: string, message: string) {
  warning(false, `Package target ${message}, resolving target '${target}' for ${match}`);
}

export function resolveImportMap(
  importMap: ImportMap,
  resolvedOrPlain: string,
  parentUrl?: string,
): string | undefined {
  let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes ?? {});

  while (scopeUrl) {
    const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes?.[scopeUrl] ?? {});

    if (packageResolution) {
      return packageResolution;
    }

    scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), importMap.scopes ?? {});
  }

  return (
    applyPackages(resolvedOrPlain, importMap.imports ?? {}) ??
    (resolvedOrPlain.includes(':') ? resolvedOrPlain : undefined)
  );
}

export { baseUrl, dynamicImport, envGlobal as global };
