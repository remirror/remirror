import { defineConfig } from 'rollup';

import pacakgeJson from './package.json';

const dependencies = Object.keys({
  ...pacakgeJson.dependencies,
  ...pacakgeJson.devDependencies,
  ...pacakgeJson.peerDependencies,
});

export default defineConfig({
  external: dependencies,
  // Remove unneeded imports
  treeshake: { moduleSideEffects: false },
});
