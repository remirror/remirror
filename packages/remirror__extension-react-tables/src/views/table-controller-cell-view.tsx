import { EditorView, NodeView } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';

import TableControllerCell from '../components/table-controller-cell';
import { h } from '../utils/dom';

export class TableControllerCellView implements NodeView {
  public dom: HTMLElement;
  public contentDOM: HTMLElement;

  constructor(public node: ProsemirrorNode, public view: EditorView, public getPos: () => number) {
    this.contentDOM = h('div', { contentEditable: false });
    this.dom = TableControllerCell({
      view,
      getPos,
      contentDOM: this.contentDOM,
    });
  }

  // When a DOM mutation happens (eg: the button show or hide), don't let
  // ProseMirror re-render the view.
  ignoreMutation(): boolean {
    return true;
  }

  // Don't let ProseMirror to handle the dom event (eg: onclick).
  stopEvent(): boolean {
    return true;
  }
}
