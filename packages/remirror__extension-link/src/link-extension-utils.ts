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

export const getBalancedIndex = (input: string, index: number): number =>
  !isBalanced(input.slice(0, index)) ? getBalancedIndex(input, --index) : index;

export const getTrailingPunctuationIndex = (input: string, index: number): number =>
  SENTENCE_PUNCTUATIONS.includes(input.slice(0, index).slice(-1))
    ? getTrailingPunctuationIndex(input, --index)
    : index;

export const getTrailingCharIndex = ({
  adjacentPunctuations,
  input,
  url = '',
}: {
  adjacentPunctuations: typeof DEFAULT_ADJACENT_PUNCTUATIONS;
  input: string;
  url: string;
}): number | undefined =>
  (input.split(url)[1] || '').length * -1 ||
  (adjacentPunctuations.includes(input.slice(-1)) ? -1 : undefined);

export const addProtocol = (input: string, defaultProtocol?: string): string =>
  ['http://', 'https://', 'ftp://'].some((protocol) => input.startsWith(protocol))
    ? input
    : `${defaultProtocol && defaultProtocol.length > 0 ? defaultProtocol : 'https:'}//${input}`;
