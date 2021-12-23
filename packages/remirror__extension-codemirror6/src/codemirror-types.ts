import type { LanguageDescription } from '@codemirror/language';
import { Extension as CodeMirrorExtension } from '@codemirror/state';

export interface CodeMirrorExtensionOptions {
  /**
   * The CodeMirror extensions to use.
   *
   * By default, the official [`oneDark`](https://github.com/codemirror/theme-one-dark) extension  will be used.
   */
  extensions?: CodeMirrorExtension[] | null;

  /**
   * The CodeMirror languages to use.
   *
   * You can install [`@codemirror/language-data`](https://codemirror.net/6/docs/ref/#language-data) and import languages from there.
   */
  languages?: LanguageDescription[] | null;
}
