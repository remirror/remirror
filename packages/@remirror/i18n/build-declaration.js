const path = require('path');
const fs = require('fs');

/**
 * @param {string[]} ids
 */
function createDeclarationString(ids = []) {
  return `import { Messages } from '@lingui/core';

declare const locale: {
  messages: Record<${ids.map((id) => JSON.stringify(id)).join(' | ')}, Messages[string]>;
}

export = locale;`;
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

  return Object.keys(object.messages);
}

/**
 * @param {string} locale
 * @param {string} content
 */
function createDeclarationFile(locale, content) {
  const filePath = path.resolve(__dirname, 'src', locale, 'messages.d.ts');
  fs.writeFileSync(filePath, content);
}

const locales = ['en'];

locales.forEach((locale) => {
  const ids = getIdsFromLocale(locale);
  const content = createDeclarationString(ids);

  createDeclarationFile(locale, content);
});
