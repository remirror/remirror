import { NodeMatch } from '@remirror/core-types';

export interface CompositionExtensionOptions {
  /**
   * The nodes that need to be deleted when backspace is pressed
   */
  ensureNodeDeletion?: NodeMatch[];
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
