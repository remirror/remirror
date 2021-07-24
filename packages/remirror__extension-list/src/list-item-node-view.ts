import type { EditorView, NodeView } from '@remirror/pm/view';
import { ExtensionListTheme } from '@remirror/theme';

export function createCustomMarkListItemNodeView({
  mark,
  extraAttrs,
  extraClasses,
  view,
}: {
  mark: HTMLElement;
  extraAttrs?: Record<string, string>;
  extraClasses?: string[];
  view: EditorView;
}): NodeView {
  const dom = document.createElement('li');
  dom.classList.add(ExtensionListTheme.LIST_ITEM_WITH_CUSTOM_MARKER);

  if (extraClasses) {
    extraClasses.forEach((className) => dom.classList.add(className));
  }

  const markContainer = document.createElement('span');
  markContainer.contentEditable = 'false';
  markContainer.classList.add(ExtensionListTheme.LIST_ITEM_MARKER_CONTAINER);

  const contentDOM = document.createElement('div');

  markContainer.append(mark);
  dom.append(markContainer);
  dom.append(contentDOM);

  // When a list item node's `content` updates, it's necessary to re-run the
  // nodeView function so that the list item node's `disabled` class can be
  // updated.
  //
  // However, when users are using IME, never re-create the nodeView. See also #1017.
  const update = (): boolean => {
    if (view?.composing) {
      return true;
    }

    return false;
  };

  if (extraAttrs) {
    for (const [key, value] of Object.entries(extraAttrs)) {
      dom.setAttribute(key, value);
    }
  }

  return { dom, contentDOM, update };
}
