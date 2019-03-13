import { Extension, KeyboardBindings, ProsemirrorPlugin } from '@remirror/core';
import { Interpolation } from 'emotion';
import { arrow, deleteNode } from './actions';
import { Direction } from './direction';
import { createGapCursorPlugin } from './plugin';
import { gapCursorStyles } from './styles';
import { GapCursorOptions } from './types';

export class GapCursor extends Extension<GapCursorOptions> {
  get name(): 'gapCursor' {
    return 'gapCursor';
  }

  public keys(): KeyboardBindings {
    return {
      ArrowLeft: (state, dispatch, view) => {
        const endOfTextblock = view ? view.endOfTextblock.bind(view) : undefined;
        return arrow(Direction.LEFT, endOfTextblock)(state, dispatch, view);
      },
      ArrowRight: (state, dispatch, view) => {
        const endOfTextblock = view ? view.endOfTextblock.bind(view) : undefined;
        return arrow(Direction.RIGHT, endOfTextblock)(state, dispatch, view);
      },
      ArrowUp: (state, dispatch, view) => {
        const endOfTextblock = view ? view.endOfTextblock.bind(view) : undefined;
        return arrow(Direction.UP, endOfTextblock)(state, dispatch, view);
      },
      ArrowDown: (state, dispatch, view) => {
        const endOfTextblock = view ? view.endOfTextblock.bind(view) : undefined;
        return arrow(Direction.DOWN, endOfTextblock)(state, dispatch, view);
      },
      // The default Prosemirror Backspace doesn't handle removing block nodes when cursor is after it
      Backspace: deleteNode(Direction.BACKWARD),
      Delete: deleteNode(Direction.FORWARD),
    };
  }

  public styles(): Interpolation {
    return gapCursorStyles;
  }

  public plugin(): ProsemirrorPlugin {
    return createGapCursorPlugin({ ctx: this });
  }
}
