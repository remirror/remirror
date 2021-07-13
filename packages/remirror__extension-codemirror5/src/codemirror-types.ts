import type CodeMirror from 'codemirror';
import type { ProsemirrorAttributes, Static } from '@remirror/core';

export interface CodeMirrorExtensionOptions {
  /**
   * Configuration for the inner CodeMirror editor.
   *
   * @default undefined
   */
  defaultCodeMirrorConfig?: CodeMirror.EditorConfiguration | null;

  /**
   * The instance of codemirror to use.
   */
  CodeMirror?: Static<typeof CodeMirror>;
}

export interface CodeMirrorExtensionAttributes extends ProsemirrorAttributes {
  /**
   * Configuration for the inner CodeMirror editor.
   *
   * @default undefined
   */
  codeMirrorConfig?: CodeMirror.EditorConfiguration;

  /**
   * A string to represent the language, which will be passed into CodeMirror's
   * `findModeByName` function. Note that you can also specify the
   * language by editing `codeMirrorConfig.mode` directly.
   *
   * @default undefined
   */
  language?: string;
}
