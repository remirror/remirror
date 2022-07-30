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

export const getBalancedIndex = (input: string): number | undefined => {
  const stack: Array<{ index: number; expected?: string }> = [];

  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i);
    const bracketIndex = PAIR_PUNCTUATIONS.indexOf(char);

    // char is not a bracket
    if (bracketIndex === -1) {
      continue;
    }

    // char is an open bracket character
    if (bracketIndex % 2 === 0) {
      stack.push({ index: i, expected: PAIR_PUNCTUATIONS.charAt(bracketIndex + 1) });

      continue;
    }

    // char is a closing bracket character
    const unmatched = stack.pop();

    if (unmatched === undefined) {
      // closing bracket without any opening bracket
      stack.push({ index: i });

      break;
    }

    const { index, expected } = unmatched;

    if (char !== expected) {
      // closing bracket was not what we expected
      stack.push({ index });

      break;
    }
  }

  const index = stack.pop()?.index;

  if (
    // If the input is imbalanced
    index !== undefined &&
    ![
      // Slice of balanced part and iterate over the remaing charcters.
      ...input.slice(index),
      // Check character for closing pair or sentence punctuation.
    ].some((char) => ![')', ']', '}'].includes(char) && !SENTENCE_PUNCTUATIONS.includes(char))
  ) {
    return index;
  }

  return;
};

export const getTrailingPunctuationIndex = (input: string, index = -1): number =>
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
  input.slice(input.indexOf(url) + url.length).length * -1 ||
  (adjacentPunctuations.includes(input.slice(-1)) ? -1 : undefined);

export const addProtocol = (input: string, defaultProtocol?: string): string =>
  ['http://', 'https://', 'ftp://'].some((protocol) => input.startsWith(protocol))
    ? input
    : `${defaultProtocol && defaultProtocol.length > 0 ? defaultProtocol : 'https:'}//${input}`;

export const getLinkPath = (input: string, protocol?: string): string => {
  let newUrl;
  try {
    newUrl = new URL(addProtocol(input, protocol));
  } catch {
    return '';
  }

  const { pathname, search } = newUrl;

  try {
    // URL() encodes unsafe characters, which need to be decoded to check for all punctuations.
    return decodeURI(pathname.slice(1) + search);
  } catch {
    return pathname.slice(1) + search;
  }
};
