import { Messages } from '@lingui/core';
import { camelCase, pascalCase } from 'case-anything';
import fs from 'fs/promises';
import path from 'path';

import config from '../root/lingui.config';
import { baseDir, formatFiles } from './helpers';

/**
 * Create the declaration string.
 *
 * @param locale - the name of the local
 * @param ids - the id's being used
 */
function createDeclarationString(locale: string, ids: string[] = []) {
  locale = camelCase(locale);
  const messagesName = `${pascalCase(locale)}Messages`;
  return `\
import type { CompiledMessage } from '@lingui/core/cjs/i18n';

export type ${messagesName} = Record<${
    ids.length > 0 ? ids.map((id) => JSON.stringify(id)).join(' | ') : 'never'
  }, CompiledMessage>;

/**
 * The messages available for the \`${locale}\` locale.
 */
export const messages: ${messagesName};
`;
}

interface MessagesObject {
  messages: Messages;
}

const I18N_SRC_DIR = baseDir('packages', '@remirror', 'i18n', 'src');
const filesToFormat: string[] = [];

/**
 * Join up the paths
 */
function join(...paths: string[]) {
  return path.join(I18N_SRC_DIR, ...paths);
}

/**
 * Get all the message ids and their corresponding stringified JSON object.
 */
async function getIdsFromLocale(locale: string): Promise<string[]> {
  const messagesPath = join(locale, 'messages.mjs');
  const object: MessagesObject = await import(messagesPath);
  filesToFormat.push(messagesPath);

  return Object.keys(object.messages);
}

/**
 * Create the declaration file for each locale.
 */
async function createDeclarationFile(locale: string, content: string) {
  const messagesPath = join(locale, 'messages.d.ts');
  const entryPath = join(locale, 'index.ts');
  filesToFormat.push(messagesPath);
  await Promise.all([
    fs.writeFile(messagesPath, content),
    fs.writeFile(entryPath, `export * from './messages';`),
  ]);
}

async function run() {
  // Currently only the `en` locale is supported but that should increase in the
  // future.
  for (const locale of config.locales) {
    const ids = await getIdsFromLocale(locale);
    const content = createDeclarationString(locale, ids);

    await createDeclarationFile(locale, content);
  }

  await formatFiles(filesToFormat.join(' '), { formatter: 'prettier' });
}

run();
