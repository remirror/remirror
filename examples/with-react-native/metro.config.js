const {applyConfigForLinkedDependencies} = require('metro-symlinked-deps');

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
