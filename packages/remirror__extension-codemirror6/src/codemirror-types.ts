import type { LanguageDescription } from '@codemirror/language';
import { Extension as CodeMirrorExtension } from '@codemirror/state';

export interface CodeMirrorExtensionOptions {
  /**
   * The CodeMirror extensions to use.
   *
   * @remarks
   *
   * For package size reasons, no CodeMirror extensions are included by default.
   * You might want to install and add the following two extensions:
   *
   * - [`basicSetup`](https://codemirror.net/6/docs/ref/#basic-setup.basicSetup)
   * - [`oneDark`](https://github.com/codemirror/theme-one-dark)
   *
   * @default null
   */
  extensions?: CodeMirrorExtension[] | null;

  /**
   * The CodeMirror languages to use.
   *
   * @remarks
   *
   * You can install [`@codemirror/language-data`](https://codemirror.net/6/docs/ref/#language-data) and import languages from there.
   *
   * @default null
   */
  languages?: LanguageDescription[] | null;
}
