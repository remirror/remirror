import { Mark } from 'remirror';
import { Node } from '@remirror/pm/model';

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
	return node.marks.filter(isEntityReference).map(h => ({
		from: pos,
		to: pos + Math.max(node.textContent.length, 1),
		id: h.attrs.id,
		text: node.textContent,
	}));
}
