import { Cast } from '@remirror/core';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export class NullSelectionReader {
  constructor(private readonly warnOnce: () => void) {}

  public destroy() {}
  public poll() {}
  public editableChanged() {}

  // Whether the DOM selection has changed from the last known state.
  public domChanged() {
    this.warnOnce();
    return true;
  }

  // Store the current state of the DOM selection.
  public storeDOMState() {
    this.warnOnce();
  }

  public clearDOMState() {
    this.warnOnce();
  }

  // When the DOM selection changes in a notable manner, modify the
  // current selection state to match.
  public readFromDOM() {
    this.warnOnce();
    return true;
  }
}

export const jsdomSelectionPatch = (view: EditorView) => {
  const warnOnce = (() => {
    return () => {
      if (window.hasWarnedAboutJsdomFixtures || window.ignoreAllJSDOMWarnings) {
        return;
      }

      console.warn(
        'Warning! Test depends on DOM selection API which is not supported in JSDOM/Node environment.',
      );

      (window as any).hasWarnedAboutJsdomFixtures = true;
    };
  })();

  // Ignore all DOM document selection changes and do nothing to update it
  (view as any).selectionReader = new NullSelectionReader(warnOnce);

  // Make sure that we don't attempt to scroll down to selection when dispatching a transaction
  (view as any).updateState = function(state: EditorState) {
    warnOnce();
    Cast(state).scrollToSelection = 0;
    EditorView.prototype.updateState.apply(this, [state]);
  };

  // Do nothing to update selection
  (view as any).setSelection = () => {
    warnOnce();
  };

  (view as any).destroy = function() {
    EditorView.prototype.destroy.apply(this);
  };
};
