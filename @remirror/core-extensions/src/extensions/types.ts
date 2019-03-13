import { NodeMatch } from '@remirror/core';

export interface CompositionOptions {
  /**
   * The nodes that need to be deleted when backspace is pressed
   */
  ensureNodeDeletion?: NodeMatch[];
}
