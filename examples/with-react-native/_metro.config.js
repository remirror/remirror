const { applyConfigForLinkedDependencies } = require('metro-symlinked-deps');

// TRY this if this fails https://github.com/zachariahtimothy/react-native-monorepo/blob/master/apps/zach-native/metro.config.js

module.exports = applyConfigForLinkedDependencies({
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
});
