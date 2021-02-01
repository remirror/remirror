const path = require('path');
const { FileStore } = require('metro-cache');
const findCacheDir = require('find-cache-dir');
const findUp = require('find-up');
const resolveFrom = require('resolve-from');
const exclusionList = require('metro-config/src/defaults/blacklist');
const {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory,
} = require('enhanced-resolve');
const fs = require('fs');

const projectRoot = process.cwd();

// Disabled because we are using `unsafeCache` (disk cache) now.
const useResolveFrom = false;
const useCache = true;
const cacheFile = findCacheDir({
  name: 'metro-resolver-webpack-custom',
  thunk: true,
  create: true,
});

const cacheFileStore = new FileStore({
  root: findCacheDir({ name: 'metro-custom', create: true }),
});

const resolveCtx = {};
const resolveRequest = makeResolveRequest(resolveCtx);

function getConfig() {
  return {
    projectRoot: path.resolve(projectRoot),
    watchFolders: [
      path.resolve(projectRoot),
      path.join(path.resolve(projectRoot), 'node_modules'),
      getRepoRoot(),
    ],

    cacheStores: [cacheFileStore],
    resetCache: true,
    server: {},
    transformer: {
      workerPath: getWorkerPath(),
    },
    resolver: {
      resolveRequest,
      blacklistRE: exclusionList([/.*\/default\/.*/, /.*\/\.cache\/.*/, /.*\/nest-orig\/.*/]),
      extraNodeModules: {},
      resolverMainFields: ['rn:dev', 'react-native', 'browser', 'module', 'main'],
      sourceExts: ['js', 'json', 'ts', 'tsx', 'cjs', 'mjs', 'jsx'],
      useWatchman: false,
    },
  };
}

function getRepoRoot() {
  return path.dirname(findUp.sync('pnpm-workspace.yaml', { cwd: process.cwd() }));
}

function getWorkerPath() {
  // The default is set in
  // https://github.com/facebook/metro/blob/d6eefe44bdc163c04b3ada92d825451b52ecf41a/packages/metro-config/src/defaults/index.js#L116
  // As of 202012, it is 'metro/src/DeltaBundler/Worker'.
  const workerPath = '/examples/with-react-native/node_modules/metro/src/DeltaBundler/Worker.js';
  const repoRoot = getRepoRoot();
  return require.resolve(path.join(repoRoot, workerPath));
}

function makeResolveRequest(resolveCtx) {
  //////////////////////////////////////////////////////////////////////////////

  // TODO(vjpr): Change tmp file name to node_modules.
  const cacheFilename = cacheFile('cache.json');
  let cache;
  try {
    cache = JSON.parse(fs.readFileSync(cacheFilename, 'utf8'));
  } catch (error) {
    if (!error.code === 'ENOENT') {
      console.log(`cache read error:`, error);
    }
  }

  if (!cache) {
    cache = {};
  }

  if (useCache) {
    // a. TODO(vjpr): Find a better way to save. process.on('exit', () => {save()})

    //setInterval(() => {save()}, 10000)

    // NOTE(vjpr): Runs too soon. process.nextTick(() => {save()
    //})

    resolveCtx.onReporterUpdate = (event) => {
      if (event === 'bundle_build_done') {
        save();
      }
    };

    // TODO(vjpr): Maybe there is a hook we can use. After compile?
  }

  function save() {
    console.log('saving resolver cache');
    fs.writeFileSync(cacheFilename, JSON.stringify(cache, null, 2));
  }

  //////////////////////////////////////////////////////////////////////////////

  // Typical usage will consume the `NodeJsInputFileSystem` + `CachedInputFileSystem`, which wraps
  // the Node.js `fs` wrapper to add resilience + caching.
  const fileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000);

  ///////////////////////////////////////////////////////////////////////////////

  let resolver;

  // Callback def: `metro/packages/metro-resolver/src/types.js`.
  return (context, request, platform) => {
    // We wrap in try-catch otherwise errors are silent.
    try {
      return doResolve();
    } catch (error) {
      // This will log syntax errors, etc. that we make in the resolver.
      console.log({ err: error });
    }

    function doResolve() {
      if (!resolver) {
        // Only create one resolver. TODO(vjpr): Not sure if each request needs its own resolver
        // (because of extensions)

        const extensions = getExtensions(context, platform);

        resolver = ResolverFactory.createResolver({
          fileSystem,
          extensions,
          useSyncFileSystemCalls: true,
          unsafeCache: useCache ? cache : false,
          cacheWithContext: false, // TODO(vjpr): not sure about this.
          modules: [
            // Because a lot of expo packages depend on react-native but don't specify it as a dep.
            // This is needed when working in a monorepo.
            path.join(projectRoot, 'node_modules'),
            // --
            'node_modules',
          ],
        });
      }

      const resolveContext = {};
      // TODO(vjpr): Check if its a dir before dirname.
      const lookupStartPath = path.dirname(context.originModulePath);

      let filePath;

      if (useResolveFrom) {
        // `resolve-from` can be much faster than webpack, but won't work for complicated requests
        // (e.g. exts). See https://github.com/webpack/enhanced-resolve/issues/110#issue-245546672
        const result = resolveFrom.silent(lookupStartPath, request);

        if (result) {
          return { type: 'sourceFile', filePath: result };
        }
      }

      try {
        filePath = resolver.resolveSync({}, lookupStartPath, request, resolveContext);
      } catch (error) {
        //console.log({err}) console.log(JSON.stringify(err, null, 2))
        console.log(error);
        const assets = tryAssetFile(context, request, platform);

        if (assets) {
          return assets;
        }

        throw error;
      }

      return { type: 'sourceFile', filePath };
    }
  };
}

////////////////////////////////////////////////////////////////////////////////

function tryAssetFile(context, request, platform, err) {
  const dirname = path.dirname(request);
  const basename = path.basename(request);
  const assetResolutions = context.resolveAsset(dirname, basename, platform);

  if (assetResolutions) {
    return {
      type: 'assetFiles',
      filePaths: assetResolutions.map((name) => `${dirname}/${name}`),
    };
  }

  return null;
}

////////////////////////////////////////////////////////////////////////////////
// From `makePnpResolver`.

function getExtensions(context, platform) {
  const baseExtensions = context.sourceExts.map((extension) => `.${extension}`);
  let finalExtensions = [...baseExtensions];

  if (context.preferNativePlatform) {
    finalExtensions = [
      ...baseExtensions.map((extension) => `.native${extension}`),
      ...finalExtensions,
    ];
  }

  if (platform) {
    // We must keep a const reference to make Flow happy
    const p = platform;
    finalExtensions = [
      ...baseExtensions.map((extension) => `.${p}${extension}`),
      ...finalExtensions,
    ];
  }

  return finalExtensions;
}

module.exports = getConfig();
