import { ObjectInterpolation } from '@emotion/core';
import { BaseExtensionOptions, NodeMatch } from '@remirror/core-types';

export interface CompositionExtensionOptions extends BaseExtensionOptions {
  /**
   * The nodes that need to be deleted when backspace is pressed
   */
  ensureNodeDeletion?: NodeMatch[];
}

export interface PlaceholderExtensionOptions extends BaseExtensionOptions {
  /**
   * The placeholder text to use.
   */
  placeholder?: string;

  /**
   * The class to decorate the empty top level node with.
   */
  emptyNodeClass?: string;

  /**
   * Additional styles to inject
   */
  placeholderStyle?: ObjectInterpolation<undefined>;
}

export interface PlaceholderPluginState extends Required<PlaceholderExtensionOptions> {
  empty: boolean;
}

export interface PlaceholderPluginMeta {
  /** Whether the placeholder should be removed on the next state updated */
  removePlaceholder?: boolean;
  /**  */
  applyPlaceholderIfEmpty?: boolean;
}

/**
 * FIXME: TS doesn't have a type for InputEvent yet since its not widely supported.
 * @see https://www.w3.org/TR/input-events-2/
 */
export interface InputEvent extends UIEvent {
  isComposing: boolean;
  inputType: 'deleteContentBackward' | 'insertText' | 'insertCompositionText';
  data: string | null;
}
