import { defineConfig } from 'rollup';

import packageJson from './package.json' assert { type: 'json' };

const dependencies = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
});

export default defineConfig({
  external: dependencies,
  // Remove unneeded imports
  treeshake: { moduleSideEffects: false },
});
