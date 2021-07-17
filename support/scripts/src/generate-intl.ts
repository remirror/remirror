import fs from 'fs-extra';
import path from 'path';

import { baseDir, formatFiles, log } from './helpers';

const config: { locales: string[] } = require(baseDir('support', 'root', 'lingui.config.js'));

const I18N_SRC_DIR = baseDir('packages', 'remirror__i18n', 'src');
const filesToFormat: string[] = [];

/**
 * Join up the paths
 */
function join(...paths: string[]) {
  return path.join(I18N_SRC_DIR, ...paths);
}

/**
 * Create the declaration file for each locale.
 */
async function createIndexFile(locale: string) {
  const messagesPath = join(locale, 'messages.d.ts');
  const entryPath = join(locale, 'index.ts');
  filesToFormat.push(messagesPath, join(locale, 'messages.ts'));
  await Promise.all([fs.writeFile(entryPath, `export * from './messages';\n`)]);
}

async function run() {
  // Currently only the `en` locale is supported but that should increase in the
  // future.
  for (const locale of config.locales) {
    await createIndexFile(locale);
  }

  await formatFiles(filesToFormat.join(' '), { formatter: 'prettier' });
}

run().catch((error) => log.fatal(error));
