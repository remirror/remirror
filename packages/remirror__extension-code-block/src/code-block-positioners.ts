import type { FindProsemirrorNodeResult } from '@remirror/core';
import { findParentNodeOfType, isElementDomNode } from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';

export const codeBlockPositioner = Positioner.create<FindProsemirrorNodeResult>({
  getActive(props) {
    const { selection, schema } = props.state;
    const parent = findParentNodeOfType({
      selection,
      types: schema.nodes.codeBlock,
    });

    if (!parent) {
      return Positioner.EMPTY;
    }

    return [parent];
  },

  getPosition(props) {
    const { data, view } = props;
    const node = view.nodeDOM(data.pos);

    if (!isElementDomNode(node)) {
      return defaultAbsolutePosition;
    }

    const rect = node.getBoundingClientRect();
    const editorRect = view.dom.getBoundingClientRect();
    const left = view.dom.scrollLeft + rect.left - editorRect.left;
    const top = view.dom.scrollTop + rect.top - editorRect.top;

    return {
      x: left - 1,
      y: top - 1,
      width: rect.width,
      height: rect.height,
      rect,
      visible: isPositionVisible(rect, view.dom),
    };
  },

  hasChanged: hasStateChanged,
});
