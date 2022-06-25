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

/** Including single and double quotation */
export const SENTENCE_PUNCTUATIONS = ['!', '?', "'", ',', '.', ':', ';', '"'];

export const DEFAULT_ADJACENT_PUNCTUATIONS = [...SENTENCE_PUNCTUATIONS, '(', ')', '[', ']'];

const PAIR_PUNCTUATIONS = '[]{}()';

export const isBalanced = (input: string): boolean => {
  const stack = [];

  for (const character of input) {
    const index = PAIR_PUNCTUATIONS.indexOf(character);

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

export const getBalancedIndex = (string: string, index: number): number => {
  const newString = string.slice(0, index);

  if (!isBalanced(newString)) {
    return getBalancedIndex(string, --index);
  }

  return index;
};

export const getAdjacentCharCount = ({
  direction,
  input,
  url,
}: {
  direction: 0 | 1;
  input: string;
  url: string | undefined;
}) => {
  const length = ((url && input.split(url)[direction]) || '').length;

  if (length > 1) {
    return Math.abs(length) * (direction === 1 ? -1 : 1);
  }

  return;
};

export const createNewURL = (input: string) => {
  try {
    return new URL(
      ['http://', 'https://', 'ftp://'].some((protocol) => input.startsWith(protocol))
        ? input
        : `https://${input}`,
    );
  } catch {
    return;
  }
};
