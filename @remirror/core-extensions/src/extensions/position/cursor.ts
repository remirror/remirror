import { Extension } from '@remirror/core';

export interface CursorPositionOptions {}

export class CursorPosition extends Extension<CursorPositionOptions> {
  get name(): 'cursorPosition' {
    return 'cursorPosition';
  }
}
