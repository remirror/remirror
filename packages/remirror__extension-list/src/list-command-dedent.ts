import { CommandFunction } from '@remirror/pm';
import { Fragment, NodeRange, Slice } from '@remirror/pm/model';
import { Transaction } from '@remirror/pm/state';
import { ReplaceAroundStep } from '@remirror/pm/transform';

import { calculateItemRange } from './list-commands';
import { isListItemNode } from './list-utils';

export function dedentList(tr: Transaction): boolean {
  let range = calculateItemRange(tr.selection);

  if (!range) {
    console.log('return 1');
    return false;
  }

  const parentItem = tr.selection.$from.node(range.depth - 1);

  if (!isListItemNode(parentItem)) {
    console.log('return 2');
    return false;
  }

  const end = range.end;
  const endOfList = range.$to.end(range.depth);

  if (end < endOfList) {
    // There are siblings after the lifted items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        end - 1,
        endOfList,
        end,
        endOfList,
        new Slice(Fragment.from(parentItem.type.create(null, range.parent.copy())), 1, 0),
        1,
        true,
      ),
    );
    range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
  }

  const target = liftTarget(range);

  console.log({ end, endOfList, range, target });

  if (typeof target !== 'number') {
    console.log('return 7');
    return false;
  }

  tr.lift(range, target);
  console.log('return 9');
  return true;
}

/**
 * @internal
 */
export const dedentListCommand: CommandFunction = ({ tr, dispatch }) => {
  if (dedentList(tr)) {
    dispatch?.(tr.scrollIntoView());
  }

  return true;
};

function liftTarget(range: NodeRange) {
  const parent = range.parent;
  const content = Fragment.from(parent.content.content.slice(range.startIndex, range.endIndex));

  for (let depth = range.depth; ; --depth) {
    const node = range.$from.node(depth);
    const index = range.$from.index(depth),
      endIndex = range.$to.indexAfter(depth);

    if (depth < range.depth) {
      const canReplace = node.canReplace(index, endIndex, content);
      console.log({ depth, canReplace, index, endIndex, content, node: node.type.name });

      if (canReplace) {
        return depth;
      }
    }

    if (depth === 0) {
      break;
    }
  }
}
