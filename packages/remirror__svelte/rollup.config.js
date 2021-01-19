import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.module, format: 'es' },
    { file: pkg.main, format: 'umd', name: 'RemirrorSvelte' },
  ],
  plugins: [
    copy({ targets: [{ src: 'src/**/*.d.ts', dest: 'dist' }] }),
    svelte({
      preprocess: sveltePreprocess(),
    }),
    resolve(),
    commonjs(),
    ts({ transpiler: 'babel' }),
  ],
};
