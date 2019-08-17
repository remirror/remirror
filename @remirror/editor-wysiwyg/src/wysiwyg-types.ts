import { RemirrorTheme } from '@remirror/core';
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

export interface WysiwygEditorProps
  extends Partial<
      Pick<
        RemirrorProps<WysiwygExtensions>,
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
  theme?: Partial<RemirrorTheme>;
}

export type ButtonProps = JSX.IntrinsicElements['button'] & {
  state?: ButtonState;
};

export type ButtonState = 'default' | 'active-default' | 'inverse' | 'active-inverse';
