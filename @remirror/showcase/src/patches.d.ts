// Temporary until PR merged https://github.com/DefinitelyTyped/DefinitelyTyped/pull/37191
declare module 'prosemirror-dev-tools' {
  import { EditorState } from 'prosemirror-state';
  import { EditorView } from 'prosemirror-view';

  interface ApplyDevToolsOptions {
    /**
     * From version 1.3.1 it's required for UMD build to provide EditorState
     * class (not instance).
     *
     * Previously it was causing different artifacts when working with state
     * e.g. rolling back to some history checkpoint or when restoring from
     * snapshot due to EditorState classes were different in UMD bundle and in
     * actual client code.
     */
    EditorState: typeof EditorState;
  }

  /**
   * Wraps the EditorView instance in the applyDevTools.
   */
  function applyDevTools(view: EditorView, options?: ApplyDevToolsOptions): void;

  export default applyDevTools;
}
