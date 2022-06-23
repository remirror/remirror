/**
 * The top 50 Top Level Domains (as of May 2022), ordered by most popular, for performance.
 */
export const TOP_50_TLDS = [
  'com',
  'de',
  'net',
  'org',
  'uk',
  'cn',
  'ga',
  'nl',
  'cf',
  'ml',
  'tk',
  'ru',
  'br',
  'gq',
  'xyz',
  'fr',
  'eu',
  'info',
  'co',
  'au',
  'ca',
  'it',
  'in',
  'ch',
  'pl',
  'es',
  'online',
  'us',
  'top',
  'be',
  'jp',
  'biz',
  'se',
  'at',
  'dk',
  'cz',
  'za',
  'me',
  'ir',
  'icu',
  'shop',
  'kr',
  'site',
  'mx',
  'hu',
  'io',
  'cc',
  'club',
  'no',
  'cyou',
];

export const DEFAULT_ADJACENT_PUNCTUATIONS = [
  ',',
  '.',
  '!',
  '?',
  ':',
  ';',
  "'",
  '"',
  '(',
  ')',
  '[',
  ']',
];

export const isBalanced = (input: string) => {
  const brackets = '[]{}()<>';
  const stack = [];

  for (const bracket of input) {
    const index = brackets.indexOf(bracket);

    if (index === -1) {
      continue;
    }

    if (index % 2 === 0) {
      stack.push(index + 1);

      continue;
    }

    if (stack.length === 0 || stack.pop() !== index) {
      return false;
    }
  }

  return stack.length === 0;
};
