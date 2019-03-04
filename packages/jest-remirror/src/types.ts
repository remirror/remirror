import { EditorView } from 'prosemirror-view';

export interface TestingEditorView extends EditorView {
  dispatchEvent(event: string | CustomEvent | { type: string }): void;
}
