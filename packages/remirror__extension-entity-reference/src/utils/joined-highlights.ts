import { HighlightMarkMetaData } from '../types';
import { findMinMaxRange } from './ranges';

/**
 * Util function to partition an array of highlights into two
 * sub-arrays based on the passed callback `filter`
 */
function partitionHighlights<HighlightMarkMetaData>(
  array: HighlightMarkMetaData[],
  filter: (val: HighlightMarkMetaData) => boolean,
): [HighlightMarkMetaData[], HighlightMarkMetaData[]] {
  const matches = array.filter((e) => filter(e));
  const notMatches = array.filter((e) => !filter(e));
  return [matches, notMatches];
}

const joinDisjoinedHighlight = (
  highlights: HighlightMarkMetaData[],
  highlight: HighlightMarkMetaData,
) => {
  const { id, text } = highlight;

  if (highlight.from >= highlight.to) {
    return highlights; // Sanity check.
  }

  // Find outer bound of all marks belong to the highlight
  const [same, diff] = partitionHighlights(highlights, (h) => h.id === id);
  const [from, to] = findMinMaxRange([...same, highlight]);
  let fullText = same.map((h) => h.text).join(' ');
  // Respect existing keys and merge them into the new highlight.
  const newHighlight: HighlightMarkMetaData = {
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
  disjoinedHighlights: HighlightMarkMetaData[],
): HighlightMarkMetaData[] => {
  let joinedHighlights: HighlightMarkMetaData[] = [];

  for (const disjoinedHighlight of disjoinedHighlights) {
    joinedHighlights = joinDisjoinedHighlight(joinedHighlights, disjoinedHighlight);
  }

  return joinedHighlights;
};
