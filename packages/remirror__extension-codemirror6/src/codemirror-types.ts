import type { LanguageDescription } from '@codemirror/language';
import { Extension as CodeMirrorExtension } from '@codemirror/state';
import { ProsemirrorAttributes } from '@remirror/core';

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
   * @defaultValue null
   */
  extensions?: CodeMirrorExtension[] | null;

  /**
   * The CodeMirror languages to use.
   *
   * @remarks
   *
   * You can install [`@codemirror/language-data`](https://codemirror.net/6/docs/ref/#language-data) and import languages from there.
   *
   * @defaultValue null
   */
  languages?: LanguageDescription[] | null;

  /**
   * The name of the node that the codeMirror block should toggle back and forth from.
   *
   * @defaultValue "paragraph"
   */
  toggleName?: string;
}

export interface CodeMirrorExtensionAttributes extends ProsemirrorAttributes {
  /**
   * A string to represent the language matching the language name or alias in
   * [`LanguageDescription`](https://codemirror.net/docs/ref/#language.LanguageDescription)
   *
   * @defaultValue ''
   */
  language?: string;
}
