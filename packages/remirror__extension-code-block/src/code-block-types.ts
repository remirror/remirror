import type { RefractorSyntax } from 'refractor/core';
import type { AcceptUndefined, ProsemirrorAttributes, Static, StringKey } from '@remirror/core';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

/**
 * The default supported syntax themes.
 */
export type SyntaxTheme = Lowercase<StringKey<typeof ExtensionCodeBlockTheme>>;

export interface CodeBlockOptions {
  /**
   * Import languages from refractor.
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
   * By default refractor bundles the following languages: `markup`, `css`,
   * `clike`, `js`
   *
   * @default []
   */
  supportedLanguages?: RefractorSyntax[];

  /**
   * The default language to use when none is provided.
   *
   * It is a property so it can change during the editor's life.
   *
   * @default 'markup'
   */
  defaultLanguage?: string;

  /**
   * Set to true to wrap content by default.
   *
   * @default false
   */
  defaultWrap?: boolean;

  /**
   * The theme to use for the codeBlocks.
   *
   * @remarks
   *
   * Currently only one theme can be set per editor.
   *
   * Set this to false if you want to manage the syntax styles by yourself. For
   * tips on how this could be accomplished see {@link https://prismjs.com}
   *
   * @default 'atom-dark'
   */
  syntaxTheme?: SyntaxTheme;

  /**
   * Provide a formatter which can format the provided source code.
   *
   * @returns an object when formatting was successful and false when the code
   * could not be formatted (a noop).
   */
  formatter?: CodeBlockFormatter;

  /**
   * The name of the node that the code block should toggle back and forth from.
   *
   * Leave `undefined` to use the `defaultBlockNode` for the editor.
   *
   * @default undefined
   */
  toggleName?: AcceptUndefined<string>;

  /**
   * Class to use in decorations of plain `text` nodes.
   *
   * @remarks
   *
   * refractor highlighting produces `elements` to indicate the type of a part
   * of the code. These elements get translated into decorations by this plugin.
   *
   * For all other parts of the code the decoration will use this class name if
   * it is set to a non-empty value, otherwise no decoration will be produced.
   */
  plainTextClassName?: string;

  /**
   * Extract the language string from a code block.
   */
  getLanguageFromDom?: Static<
    (codeElement: HTMLElement, preElement: HTMLElement) => string | undefined
  >;
}

/**
 * A function which takes code and formats the code.
 *
 * TODO - possibly allow error management if failure is because of invalid
 * syntax
 */
export type CodeBlockFormatter = (params: FormatterProps) => FormattedContent | undefined;

export interface FormatterProps {
  /**
   * The code to be formatted
   */
  source: string;

  /**
   * Specify where the cursor is. This option cannot be used with rangeStart and
   * rangeEnd. This allows the command to both formats the code, and translates
   * a cursor position from unformatted code to formatted code.
   */
  cursorOffset: number;

  /**
   * The language of the code block. Should be used to determine whether the
   * formatter can support the transformation.
   *
   * Possible languages are available here
   * https://github.com/wooorm/refractor/tree/716fe904c37cd7ebfde53ac5157e7d6c323a3986/lang
   */
  language: string;
}

/**
 * Data returned from a code formatter.
 */
export interface FormattedContent {
  /**
   * The transformed source.
   */
  formatted: string;

  /**
   * The new cursor position after formatting
   */
  cursorOffset: number;
}

export interface CodeBlockAttributes extends ProsemirrorAttributes {
  /**
   * The language attribute
   */
  language: string;

  /**
   * Set to true to active the wrapping of the content within the editor.
   */
  wrap?: boolean;
}
