import { promises as fsp } from 'fs';
import { resolve } from 'path';

type Meta = any;

async function scanImportsFrom<T>(
  sourceDir: string,
  sourceModulePath: string,
  callback: (meta: Meta) => Promise<T>,
): Promise<{ [folderName: string]: T }> {
  const result: { [folderName: string]: T } = {};
  const folders = await fsp.readdir(sourceDir);
  for (const folder of folders) {
    const path = `${sourceDir}/${folder}`;
    const packageJson = require(`${path}/package.json`);
    const mainPath = resolve(path, packageJson.main);
    const mod = require(mainPath);
    const meta = {
      name: `${sourceModulePath}/${folder}`,
      exports: Object.keys(mod),
    };
    result[folder] = await callback(meta);
  }
  return result;
}

async function importExtension(meta: Meta) {
  return meta;
}
async function importPreset(meta: Meta) {
  return meta;
}

async function main() {
  // TODO: rewrite this to walk everything inside `packages/remirror`; ignore
  // `dist` and `src; populate `execute.ts`'s `knownRequires` and handle the
  // TypeScript definitions.
  const extensions = await scanImportsFrom(
    `${__dirname}/../../../packages/remirror/extension`,
    'remirror/extension',
    importExtension,
  );
  const presets = await scanImportsFrom(
    `${__dirname}/../../../packages/remirror/preset`,
    'remirror/preset',
    importPreset,
  );
  const everything = {
    extensions,
    presets,
  };
  console.dir(everything, { depth: 6 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
