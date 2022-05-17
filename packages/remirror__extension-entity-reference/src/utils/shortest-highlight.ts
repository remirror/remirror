import { HighlightAttrs } from '../types';

type HighlightText = Pick<HighlightAttrs, 'text'>;

// @TODO add unit tests
export const getShortestHighlight = <T extends HighlightText>(highlights: T[]): T | undefined => {
  return highlights.sort(({ text: a }, { text: b }) => a.length - b.length)[0];
};
