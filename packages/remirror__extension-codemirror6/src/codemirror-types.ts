import { Extension as CodeMirrorExtension } from '@codemirror/state';

export interface CodeMirrorExtensionOptions {
  /**
   * The CodeMirror extensions to use.
   *
   * By default, the official [`oneDark`](https://github.com/codemirror/theme-one-dark) extension  will be used.
   */
  extensions?: CodeMirrorExtension[] | null;
}
