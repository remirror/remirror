import { Mark, Node } from '@remirror/pm/model';

import { HighlightAttrs } from '../types';

/**
 * Get all disjoined highlight attributes from a single node. When an inline
 * mark is added to a node, Prosemirror creates a sub-node with a new `marks`
 * array. The `pos` given to this function is the start position of that newly
 * created node (`from`) and the end position would be the start position plus
 * the length of the nodes text.
 */

const isHighlight = (mark: Mark) => mark.type.name === 'entityReference';

export const getDisjoinedHighlightsFromNode = (node: Node, pos: number): HighlightAttrs[] =>
  node.marks.filter(isHighlight).map((h) => ({
    from: pos,
    to: pos + Math.max(node.textContent.length, 1),
    id: h.attrs.id,
    tags: h.attrs.tags,
    text: node.textContent,
  }));
