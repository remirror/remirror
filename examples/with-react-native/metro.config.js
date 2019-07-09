const path = require('path');

const dir = (...args) => path.resolve(__dirname, path.join(...args));

module.exports = {
  projectRoot: dir(),
  watchFolders: [dir(), dir('../..')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
        resetCache: true,
      },
    }),
  },
  resolver: {
    blacklistRE: /Pods/,
  },
};
