import { Attrs, NodeExtensionOptions } from '@remirror/core';
import { RefractorSyntax } from 'refractor/core';
import { SyntaxTheme } from './themes';

export interface CodeBlockExtensionOptions extends NodeExtensionOptions {
  /**
   * Import languages from refractor
   *
   * @remarks
   *
   * ```ts
   * import jsx from 'refractor/lang/jsx'
   * import typescript from 'refractor/lang/typescript'
   * ```
   *
   * And pass them into the config when initializing this extension.
   *
   * ```ts
   * import { CodeBlockExtension } from '@remirror/extension-code-block';
   *
   * new CodeBlockExtension({ supportedLanguages: [typescript, jsx] })
   * ```
   *
   * Or as a component
   *
   * ```tsx
   * <RemirrorManager>
   *   <RemirrorExtension Constructor={CodeBlockExtension} supportedLanguages={[typescript, jsx]} />
   * </RemirrorManager>
   * ```
   *
   * By default refractor bundles the following languages: `markup`, `css`, `clike`, `js`
   *
   * @default []
   */
  supportedLanguages?: RefractorSyntax[];

  /**
   * The default language to use when none is provided.
   *
   * @default 'markup'
   */
  defaultLanguage?: string;

  /**
   * The theme to use for the codeBlocks.
   *
   * @remarks
   * Currently only one theme can be set per editor.
   *
   * Set this to false if you want to manage the syntax styles by yourself.
   * For tips on how this could be accomplished see {@link https://prismjs.com}
   *
   * @default 'atomDark'
   */
  syntaxTheme?: SyntaxTheme | false;

  /**
   * Provide a formatter which can format the provided source code.
   *
   * @returns an object when formatting was successful and false when the code could not be formatted (a noop).
   */
  formatter?: CodeBlockFormatter;

  /**
   * A handler called whenever any code block in the document has changed.
   *
   * Returns a list of all codeBlocks, whether they are active, their prosemirror node
   */
  onUpdate?(blocks: any[]): void;

  /**
   * Provides information on the specific block that was hovered over as well as the hover event.
   */
  onHover?(params: any): void;
}

export type CodeBlockFormatter = (params: FormatterParams) => FormatterReturn | undefined;

export interface FormatterParams {
  /**
   * The code to be formatted
   */
  source: string;

  /**
   * Specify where the cursor is. This option cannot be used with rangeStart and rangeEnd.
   * This allows the command to both formats the code, and translates a cursor position from unformatted code to formatted code.
   */
  cursorOffset: number;

  /**
   * The language of the code block. Should be used to determine whether the formatter can support the transformation.
   *
   * Possible languages are available here https://github.com/wooorm/refractor/tree/716fe904c37cd7ebfde53ac5157e7d6c323a3986/lang
   */
  language: string;
}

export interface FormatterReturn {
  /**
   * The transformed source.
   */
  formatted: string;

  /**
   * The new cursor position after formatting
   */
  cursorOffset: number;
}

export interface CodeBlockAttrs extends Attrs {
  /**
   * The language attribute
   */
  language: string;
}

export type CodeBlockExtensionCommands =
  | 'toggleCodeBlock'
  | 'updateCodeBlock'
  | 'createCodeBlock'
  | 'formatCodeBlock';
