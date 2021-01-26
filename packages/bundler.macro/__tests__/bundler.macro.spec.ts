import plugin from 'babel-plugin-macros';
import pluginTester from 'babel-plugin-tester';
import path from 'path';

const macroPath = path.join(__dirname, '../');
const fixtures = (...paths: string[]) => path.join(__dirname, '..', '__fixtures__', ...paths);

pluginTester({
  plugin,
  pluginName: 'bundler.macro',
  title: 'transpile',
  snapshot: true,
  babelOptions: {
    filename: fixtures('main.js'),
  },

  tests: {
    'transpiles typescript': {
      code: `import { transpile } from '${macroPath}';
      const packageJson = transpile('./transpile.fixture.ts');`,
    },
    // 'get different name': {
    //   code: `import { loadTsConfigJson } from '${macroPath}';
    //   const name = loadTsConfigJson('tsconfig.awesome.json');
    //   `,
    // },
    // 'get invalid name': {
    //   code: `import { loadTsConfigJson } from '${macroPath}';
    //   const name = loadTsConfigJson('tsconfig.not.real.json');
    //   `,
    //   snapshot: false,
    //   error: "No 'tsconfig.not.real.json' file could be loaded from your current file.",
    // },
    // 'invalid argument': {
    //   code: `import { loadTsConfigJson } from '${macroPath}';
    //   const loadedFile = loadTsConfigJson(['invalid']);`,
    //   error: 'Invalid argument passed to function call.',
    //   snapshot: false,
    // },
    // 'too many arguments': {
    //   code: `import { loadTsConfigJson } from '${macroPath}';
    //   const loadedFile = loadTsConfigJson('value', 'name');`,
    //   error: 'Too many arguments provided to the function call:',
    //   snapshot: false,
    // },
  },
});
