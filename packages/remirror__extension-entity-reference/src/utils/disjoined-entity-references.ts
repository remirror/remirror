import type { Mark, Node } from '@remirror/pm/model';

import { EntityReferenceMetaData } from '../types';

/**
 * Get all disjoined entity reference attributes from a single node. When an inline
 * mark is added to a node, Prosemirror creates a sub-node with a new `marks`
 * array. The `pos` given to this function is the start position of that newly
 * created node (`from`) and the end position would be the start position plus
 * the length of the nodes text.
 */

export function getDisjoinedEntityReferencesFromNode(
  node: Node,
  pos: number,
  markTypeName: string,
): EntityReferenceMetaData[] {
  const isEntityReference = (mark: Mark) => mark.type.name === markTypeName;
  return node.marks.filter(isEntityReference).map((mark: Mark) => {
    const { id, ...rest } = mark.attrs;

    const metaData: EntityReferenceMetaData = {
      from: pos,
      to: pos + Math.max(node.textContent.length, 1),
      id,
      text: node.textContent,
    };

    if (Object.keys(rest).length > 0) {
      metaData.attrs = rest;
    }

    return metaData;
  });
}
