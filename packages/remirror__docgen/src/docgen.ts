import { baseDir, createProject, generateDocGenExports, log } from './docgen-utils';

const entryPoint = baseDir('./packages/remirror/src/index.ts');

async function run() {
  const project = createProject();
  const generatedExports = generateDocGenExports({ project, entryPoint });
  log.debug(generatedExports.filter((exp) => !exp.package.startsWith('@remirror')));
}

run();

export {};
