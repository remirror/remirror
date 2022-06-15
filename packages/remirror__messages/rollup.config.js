import { defineConfig } from 'rollup';

import pacakgeJson from './package.json';

const dependencies = Object.keys({
  ...pacakgeJson.dependencies,
  ...pacakgeJson.devDependencies,
  ...pacakgeJson.peerDependencies,
});

export default defineConfig({
  external: dependencies,
  onwarn(warning, warn) {
    // skip certain warnings
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
      return;
    }
  },
});
