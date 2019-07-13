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
   * For some tips on how this could be accomplished see {@link https://prismjs.com}
   *
   * @default 'atomDark'
   */
  syntaxTheme?: SyntaxTheme | false;

  /**
   * A handler called whenever any code block in the document has changed.
   *
   * Returns a list of all codeBlocks, whether they are active, their prosemirror node
   */
  onUpdate?(blocks: any[]): void;

  /**
   * Provides information on the specific block that was hovered over as well as the hover event.
   */
  onHover?({ block, event, view }: any): void;
}

export interface CodeBlockAttrs extends Attrs {
  /**
   * The language attribute
   */
  language: string;
}
