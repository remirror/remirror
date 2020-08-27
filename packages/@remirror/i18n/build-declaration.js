const path = require('path');
const fs = require('fs');
const { camelCase, pascalCase } = require('case-anything');

/**
 * Create the declration string.
 *
 * @param {string} locale - the name of the local
 * @param {any} json
 * @param {string[]} ids - the id's being used
 */
function createDeclarationString(locale, json, ids = []) {
  locale = camelCase(locale);
  const messagesName = `${pascalCase(locale)}Messages`;
  const localeName = `${pascalCase(locale)}Locale`;
  return `\
import type { Messages } from '@lingui/core';

type ${messagesName} = Record<${ids.map((id) => JSON.stringify(id)).join(' | ')}, Messages[string]>;

export interface ${localeName} {
  /**
   * The messages available for the \`${locale}\` locale.
   */
  messages: ${messagesName};
}

export const ${locale}: ${localeName} = ${json};

export default ${locale};
`;
}

/**
 * @typedef { Object } MessagesObject
 * @property {import('@lingui/core').Messages} messages
 */

/**
 * @param {string} locale
 */
function getIdsFromLocale(locale) {
  /** @type MessagesObject */
  const object = require(`./src/${locale}/messages.js`);

  return [Object.keys(object.messages), JSON.stringify(object)];
}

/**
 * @param {string} locale
 * @param {string} content
 */
function createDeclarationFile(locale, content) {
  const filePath = path.resolve(__dirname, 'src', locale, 'index.ts');
  fs.writeFileSync(filePath, content);
}

const locales = ['en'];

locales.forEach((locale) => {
  const [ids, json] = getIdsFromLocale(locale);
  const content = createDeclarationString(locale, json, ids);

  createDeclarationFile(locale, content);
});
