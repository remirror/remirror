/* "Borrowed" from @atlaskit */

import {
  Extension,
  getPluginState,
  NodeMatch,
  nodeNameMatchesList,
  ResolvedPos,
  ZERO_WIDTH_SPACE_CHAR,
} from '@remirror/core';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const inlineCursorTargetStateKey = new PluginKey('inlineCursorTargetPlugin');

export const INLINE_CURSOR_TARGETS: NodeMatch[] = ['emoji', (name: string) => name.includes('mentions')];

export interface InlineCursorTargetOptions {
  targets?: NodeMatch[];
}

export class InlineCursorTarget extends Extension<InlineCursorTargetOptions> {
  get name(): 'inlineCursorTarget' {
    return 'inlineCursorTarget';
  }

  get defaultOptions() {
    return {
      targets: INLINE_CURSOR_TARGETS,
    };
  }

  public plugin() {
    return createInlineCursorTargetPlugin({ ctx: this });
  }
}

export const findSpecialNodeAfter = ($pos: ResolvedPos, tr: Transaction, matchers: NodeMatch[]) => {
  if (nodeNameMatchesList($pos.nodeAfter, matchers)) {
    return $pos.pos + 1;
  }

  const { parentOffset, parent } = $pos;
  const docSize = tr.doc.nodeSize - 2;

  if (parentOffset === parent.content.size && $pos.pos + 1 < docSize - 2) {
    const { nodeAfter } = tr.doc.resolve($pos.pos + 1);
    if (nodeAfter && nodeNameMatchesList(nodeAfter.firstChild, matchers)) {
      return $pos.pos + 2;
    }
  }

  return;
};

export const findSpecialNodeBefore = ($pos: ResolvedPos, tr: Transaction, matchers: NodeMatch[]) => {
  if (nodeNameMatchesList($pos.nodeBefore, matchers)) {
    return $pos.pos - 1;
  }

  if ($pos.pos === 0) {
    return;
  }

  const { parentOffset } = $pos;

  if (parentOffset === 0) {
    const { nodeBefore } = tr.doc.resolve($pos.pos - 1);
    if (nodeBefore && nodeNameMatchesList(nodeBefore.firstChild, matchers)) {
      return $pos.pos - 2;
    }
  }

  return;
};

interface CreateInlineCursorTargetPluginParams {
  ctx: InlineCursorTarget;
}

const createInlineCursorTargetPlugin = ({ ctx }: CreateInlineCursorTargetPluginParams) => {
  return new Plugin({
    key: ctx.pluginKey,

    state: {
      init: () => [],
      apply(tr) {
        const { selection } = tr;
        const { $from } = selection;
        const positions: number[] = [];

        const posAfter = findSpecialNodeAfter($from, tr, ctx.options.targets);
        const posBefore = findSpecialNodeBefore($from, tr, ctx.options.targets);

        if (posAfter !== undefined) {
          positions.push(posAfter);
        }

        if (posBefore !== undefined) {
          positions.push(posBefore);
        }

        return positions;
      },
    },

    props: {
      decorations(state: EditorState) {
        const { doc } = state;
        const positions = getPluginState<number[]>(ctx.pluginKey, state);

        if (positions && positions.length) {
          const decorations = positions.map(position => {
            const node = document.createElement('span');
            node.appendChild(document.createTextNode(ZERO_WIDTH_SPACE_CHAR));
            return Decoration.widget(position, node, {
              raw: true,
              side: -1,
            } as any);
          });

          return DecorationSet.create(doc, decorations);
        }

        return null;
      },
    },
  });
};
