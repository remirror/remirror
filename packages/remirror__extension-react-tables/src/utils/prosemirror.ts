import { ProsemirrorNode } from '@remirror/pm';
import { Fragment, Slice } from '@remirror/pm/model';
import { Selection } from '@remirror/pm/state';
import { CellSelection } from '@remirror/pm/tables';
import { ReplaceAroundStep, Transform } from '@remirror/pm/transform';

type Attrs = Record<string, any>;

// Change the attributes of the node at `pos`.
//
// This different between this function and `Transform.setNodeMarkup` is that it only overwrites fields that appear in `attrs`.
export function setNodeAttrs<T extends Transform>(
  tr: T,
  pos: number,
  attrs: Attrs,
  node?: ProsemirrorNode | null | undefined,
): T {
  node = node || tr.doc.nodeAt(pos);

  if (!node) {
    throw new RangeError('No node at given position');
  }

  const type = node.type;
  const newNode = type.create({ ...node.attrs, ...attrs }, undefined, node.marks);

  if (node.isLeaf) {
    return tr.replaceWith(pos, pos + node.nodeSize, newNode);
  }

  if (!type.validContent(node.content)) {
    throw new RangeError(`Invalid content for node type ${type.name}`);
  }

  return tr.step(
    new ReplaceAroundStep(
      pos,
      pos + node.nodeSize,
      pos + 1,
      pos + node.nodeSize - 1,
      new Slice(Fragment.from(newNode), 0, 0),
      1,
      true,
    ),
  );
}

// TODO: https://github.com/ProseMirror/prosemirror-tables/pull/126
export function selectionToCellSelection(selection: Selection): CellSelection {
  return selection as unknown as CellSelection;
}

export function cellSelectionToSelection(selection: CellSelection): Selection {
  return selection as unknown as Selection;
}
