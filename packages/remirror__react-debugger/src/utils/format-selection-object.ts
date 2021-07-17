import { isTextSelection } from '@remirror/core';
import { ResolvedPos } from '@remirror/pm/model';
import { Selection } from '@remirror/pm/state';

export function expandedStateFormatSelection(selection: Selection): object {
  return {
    ...collapsedStateFormatSelection(selection),
    $anchor: resolvedPosToJSON(selection.$anchor),
    $head: resolvedPosToJSON(selection.$head),
    $from: resolvedPosToJSON(selection.$from),
    $to: resolvedPosToJSON(selection.$to),
    $cursor:
      isTextSelection(selection) && selection.empty
        ? resolvedPosToJSON(selection.$anchor)
        : undefined,
  };
}

export function collapsedStateFormatSelection(selection: Selection): object {
  return { ...selection.toJSON(), empty: selection.empty, from: selection.from, to: selection.to };
}

function resolvedPosToJSON($pos: ResolvedPos): object {
  return {
    nodeAfter: $pos.nodeAfter?.toJSON(),
    nodeBefore: $pos.nodeBefore?.toJSON(),
    parent: $pos.parent?.toJSON(),
    textOffset: $pos.textOffset,
    depth: $pos.depth,
    pos: $pos.pos,
  };
}
