import { ObjectInterpolation } from '@emotion/core';
import { BaseExtensionOptions, NodeMatch } from '@remirror/core';

export interface CompositionOptions extends BaseExtensionOptions {
  /**
   * The nodes that need to be deleted when backspace is pressed
   */
  ensureNodeDeletion?: NodeMatch[];
}

export interface PlaceholderOptions extends BaseExtensionOptions {
  /**
   * The placeholder text to use.
   */
  placeholder: string;

  /**
   * The class to decorate the empty top level node with.
   */
  emptyNodeClass?: string;

  /**
   * Additional styles to inject
   */
  placeholderStyle?: ObjectInterpolation<undefined>;
}

export interface PlaceholderPluginState extends Required<PlaceholderOptions> {
  empty: boolean;
}

export interface PlaceholderPluginMeta {
  /** Whether the placeholder should be removed on the next state updated */
  removePlaceholder?: boolean;
  /**  */
  applyPlaceholderIfEmpty?: boolean;
}
