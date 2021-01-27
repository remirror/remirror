const path = require('path');
const { FileStore } = require('metro-cache');
const findCacheDir = require('find-cache-dir');
const blacklist = require('metro-config/src/defaults/blacklist');
const findUp = require('find-up');
const leftPad = require('left-pad');
const Metro = require('metro-core');
const resolveFrom = require('resolve-from');
const {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory,
} = require('enhanced-resolve');
const fs = require('fs');

// Time tranformation of each file.
// From https://github.com/facebook/metro/issues/253#issuecomment-422084406

Metro.Logger.on('log', (logEntry) => {
  if (logEntry.action_name === 'Transforming file' && logEntry.action_phase === 'end') {
    console.log(leftPad(parseInt(logEntry.duration_ms), 4), logEntry.file_name);
  }
});

// Paths
////////////////////

const projectRoot = process.cwd();

// Config
////////////////////

// Disabled because we are using `unsafeCache` (disk cache) now.
const useResolveFrom = false;
const useCache = true;

// Caching
////////////////////

const cacheFile = findCacheDir({
  name: 'metro-resolver-webpack-custom',
  thunk: true,
  create: true,
});

// Caching
////////////////////

const cacheFileStore = new FileStore({
  root: findCacheDir({ name: 'metro-custom', create: true }),
});

// Resolving
////////////////////

let resolveCtx = {};
const resolveRequest = makeResolveRequest(resolveCtx);

////////////////////

//let expoAssetPluginPath = require.resolve(
//  path.join(projectRoot, 'node_modules/expo/tools/hashAssetFiles'),
//)

// Blacklist
////////////////////

let customBlacklist = [/.*\/nest-orig\/.*/];

////////////////////

// See https://facebook.github.io/metro/docs/en/configuration.
function getConfig() {
  return {
    // Paths
    ////////////////////////////////////////////////////////////////////////////

    projectRoot: path.resolve(projectRoot),

    watchFolders: [
      path.resolve(projectRoot),
      path.join(path.resolve(projectRoot), 'node_modules'),

      /*
      Only needed for pnpm monorepo usage
      To avoid the following error we must add the repo root:
      ```
      Expected path `/xxx/node_modules/.registry.npmjs.org/@babel/runtime/7.2.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js` to be relative to one of the project roots
      ```
      */
      getRepoRoot(),
    ],

    // Caching
    ////////////////////////////////////////////////////////////////////////////

    cacheStores: [cacheFileStore],

    //cacheVersion,

    //resetCache,

    // Reporting
    ////////////////////////////////////////////////////////////////////////////

    // See https://github.com/facebook/metro/blob/92f8e5deee2fb574ccf68d7ce4de5fecf7477df6/packages/metro/src/lib/reporting.js#L32
    reporter: {
      update: (event) => {
        console.log(event);
        resolveCtx.onReporterUpdate && resolveCtx.onReporterUpdate(event);
      },
    },

    server: {
      //enhanceMiddleware: (middlware, server) => middleware,
      //enableVisualizer: true, // Install `metro-visualizer`.
    },

    // Transformer
    ////////////////////////////////////////////////////////////////////////////

    transformer: {
      // Because react-native (expo fork?) fails to resolve it unless we install expo in the repo root.
      //   https://github.com/pnpm/pnpm/issues/1501#issuecomment-446699920
      //   TODO(vjpr): Although this is bad because it prevents using multiple versions across projects.
      //assetPlugins: [expoAssetPluginPath],

      // Transformer Paths
      ////////////////////

      // From: https://github.com/facebook/metro/blob/master/packages/metro-config/src/defaults/index.js

      workerPath: getWorkerPath(),
      //asyncRequireModulePath: 'metro-runtime/src/modules/asyncRequire',
      //assetRegistryPath: 'missing-asset-registry-path',
      //babelTransformerPath: 'metro-babel-transformer',
      //transformerPath: require.resolve('metro-transform-worker'),
      //minifierPath: 'metro-minify-uglify',

      ////////////////////

      //enableBabelRCLookup,

      //enableBabelRuntime
    },

    // Resolver
    ////////////////////////////////////////////////////////////////////////////

    resolver: {
      blacklistRE: blacklist([/.*\/default\/.*/, /.*\/\.cache\/.*/, ...customBlacklist]),

      extraNodeModules: {},

      // NOTE: This will run for all files if watchman fails to start.
      resolveRequest,
      // --

      useWatchman: false,

      // TODO(vjpr): Could use this perhaps instead of patching.
      //   Although I think I looked into this and it was not possible.
      //hasteImplModulePath,
    },
  };
}

module.exports = getConfig();

function getRepoRoot() {
  return path.dirname(findUp.sync('pnpm-workspace.yaml', { cwd: process.cwd() }));
}

function getWorkerPath() {
  // The default is set in https://github.com/facebook/metro/blob/d6eefe44bdc163c04b3ada92d825451b52ecf41a/packages/metro-config/src/defaults/index.js#L116
  // As of 202012, it is 'metro/src/DeltaBundler/Worker'.
  const workerPath =
    '/node_modules/.pnpm/metro@0.58.0/node_modules/metro/src/DeltaBundler/Worker.js';
  const repoRoot = getRepoRoot();
  return require.resolve(path.join(repoRoot, workerPath));
}

function makeResolveRequest(resolveCtx) {
  //////////////////////////////////////////////////////////////////////////////

  // TODO(vjpr): Change tmp file name to node_modules.
  let cacheFilename = cacheFile('cache.json');
  let cache;
  try {
    cache = JSON.parse(fs.readFileSync(cacheFilename, 'utf8'));
  } catch (e) {
    if (!e.code === 'ENOENT') {
      console.log(`cache read error:`, e);
    }
  }
  if (!cache) cache = {};

  if (useCache) {
    // a.
    // TODO(vjpr): Find a better way to save.
    //process.on('exit', () => {save()})

    //setInterval(() => {save()}, 10000)

    // NOTE(vjpr): Runs too soon.
    //process.nextTick(() => {
    //  save()
    //})

    resolveCtx.onReporterUpdate = (event) => {
      if (event === 'bundle_build_done') {
        save();
      }
    };

    // TODO(vjpr): Maybe there is a hook we can use. After compile?

    function save() {
      console.log('saving resolver cache');
      fs.writeFileSync(cacheFilename, JSON.stringify(cache, null, 2));
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  // Typical usage will consume the `NodeJsInputFileSystem` + `CachedInputFileSystem`, which wraps the Node.js `fs` wrapper to add resilience + caching.
  const fileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000);

  ///////////////////////////////////////////////////////////////////////////////

  let resolver;

  // Callback def: `metro/packages/metro-resolver/src/types.js`.
  return (context, request, platform) => {
    // We wrap in try-catch otherwise errors are silent.
    try {
      return doResolve();
    } catch (err) {
      // This will log syntax errors, etc. that we make in the resolver.
      console.log({ err });
    }

    function doResolve() {
      if (!resolver) {
        // Only create one resolver.
        // TODO(vjpr): Not sure if each request needs its own resolver (because of extensions)

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
        // `resolve-from` can be much faster than webpack, but won't work for complicated requests (e.g. exts).
        // See https://github.com/webpack/enhanced-resolve/issues/110#issue-245546672
        let result = resolveFrom.silent(lookupStartPath, request);
        if (result) return { type: 'sourceFile', filePath: result };
      }

      try {
        filePath = resolver.resolveSync({}, lookupStartPath, request, resolveContext);
      } catch (err) {
        //console.log({err})
        //console.log(JSON.stringify(err, null, 2))
        console.log(err);
        const assets = tryAssetFile(context, request, platform);
        if (assets) return assets;
        throw err;
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
