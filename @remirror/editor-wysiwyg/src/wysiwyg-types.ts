import {
  BaseExtensions,
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  OrderedListExtension,
  ParagraphExtension,
  SSRHelperExtension,
  StrikeExtension,
  TrailingNodeExtension,
  UnderlineExtension,
} from '@remirror/core-extensions';
import { CodeBlockExtension, CodeBlockExtensionOptions } from '@remirror/extension-code-block';
import { ImageExtension } from '@remirror/extension-image';
import { RemirrorProps } from '@remirror/react';
import { ButtonState, WysiwygEditorTheme } from './wysiwyg-theme';

/**
 * The union type of all the extension used within the Wysiwyg Editor.
 *
 * Placing this as a generic in the props and other places will provide you with
 * better typechecking and inference.
 *
 * ```ts
 * const { actions } = useRemirror<WysiwygExtensions[]>();
 * const actions.updateLink() // => full type checking
 */
export type WysiwygExtensions =
  | BaseExtensions
  | BlockquoteExtension
  | BoldExtension
  | BulletListExtension
  | CodeExtension
  | HardBreakExtension
  | HeadingExtension
  | HorizontalRuleExtension
  | ImageExtension
  | ItalicExtension
  | LinkExtension
  | ListItemExtension
  | OrderedListExtension
  | ParagraphExtension
  | SSRHelperExtension
  | StrikeExtension
  | TrailingNodeExtension
  | UnderlineExtension
  | CodeBlockExtension;

export type WysiwygExtensionList = WysiwygExtensions[];

export interface WysiwygEditorProps
  extends Partial<
      Pick<
        RemirrorProps<WysiwygExtensionList>,
        | 'initialContent'
        | 'attributes'
        | 'editable'
        | 'autoFocus'
        | 'onChange'
        | 'onFocus'
        | 'onBlur'
        | 'onFirstRender'
        | 'onDispatchTransaction'
        | 'label'
        | 'editorStyles'
        | 'forceEnvironment'
        | 'suppressHydrationWarning'
      >
    >,
    Pick<CodeBlockExtensionOptions, 'supportedLanguages' | 'defaultLanguage' | 'syntaxTheme' | 'formatter'> {
  /**
   * The message to show when the editor is empty.
   */
  placeholder?: string;

  /**
   * Extend the theme with your own styles
   */
  theme?: Partial<WysiwygEditorTheme>;

  /**
   * By default the editor injects a link tag with FontAwesome into the dom. Set this to true to prevent
   * that from happening. Please note unless you provide your own link Server Side rendering will flash unstyled
   * content.
   *
   * ```tsx
   * // Add something similar to the following
   * <link rel='stylesheet' href='https://unpkg.com/@fortawesome/fontawesome-svg-core@1.2.19/styles.css' />
   * ```
   *
   * @default false
   */
  removeFontAwesomeCSS?: boolean;
}

export interface ButtonProps {
  state: ButtonState;
}
