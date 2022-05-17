import { HighlightAttrs } from '../types';

/**
 * Util function to partition an array of highlights into two
 * sub-arrays based on the passed callback `filter`
 */
function partitionHighlights<HighlightAttrs>(
  array: HighlightAttrs[],
  filter: (val: HighlightAttrs) => boolean,
): [HighlightAttrs[], HighlightAttrs[]] {
  const matches = array.filter((e) => filter(e));
  const notMatches = array.filter((e) => !filter(e));
  return [matches, notMatches];
}

const joinDisjoinedHighlight = (highlights: HighlightAttrs[], highlight: HighlightAttrs) => {
  let { id, from, to, text } = highlight;

  if (from >= to) {
    return highlights; // Sanity check.
  }

  // Find outer bound of all marks belong to the highlight
  const [same, diff] = partitionHighlights(highlights, (h) => h.id === id);
  from = Math.min(...same.map((h) => h.from), from);
  to = Math.max(...same.map((h) => h.to), to);
  let fullText = same.map((h) => h.text).join(' ');
  // Respect existing keys and merge them into the new highlight.
  const newHighlight: HighlightAttrs = {
    ...highlight,
    from,
    to,
    text: (fullText += text),
  };
  return [...diff, newHighlight];
};

/**
 * @returns highlights joined by ID
 */
export const joinDisjoinedHighlights = (
  disjoinedHighlights: HighlightAttrs[],
): HighlightAttrs[] => {
  let joinedHighlights: HighlightAttrs[] = [];

  for (const disjoinedHighlight of disjoinedHighlights) {
    joinedHighlights = joinDisjoinedHighlight(joinedHighlights, disjoinedHighlight);
  }

  return joinedHighlights;
};
