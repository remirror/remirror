import { ProsemirrorNode } from '@remirror/pm';
import type { NodeView } from '@remirror/pm/view';
import { ExtensionListTheme } from '@remirror/theme';

type UpdateElement = (node: ProsemirrorNode, dom: HTMLElement) => void;

export function createCustomMarkListItemNodeView({
  node,
  mark,
  updateDOM,
  updateMark,
}: {
  node: ProsemirrorNode;
  mark: HTMLElement;
  updateDOM: UpdateElement;
  updateMark: UpdateElement;
}): NodeView {
  const markContainer = document.createElement('span');
  markContainer.contentEditable = 'false';
  markContainer.classList.add(ExtensionListTheme.LIST_ITEM_MARKER_CONTAINER);
  markContainer.append(mark);

  const contentDOM = document.createElement('div');

  const dom = document.createElement('li');
  dom.classList.add(ExtensionListTheme.LIST_ITEM_WITH_CUSTOM_MARKER);
  dom.append(markContainer);
  dom.append(contentDOM);

  const update = (newNode: ProsemirrorNode): boolean => {
    if (newNode.type !== node.type) {
      return false;
    }

    node = newNode;
    updateDOM(node, dom);
    updateMark(node, mark);
    return true;
  };

  update(node);

  return { dom, contentDOM, update };
}
