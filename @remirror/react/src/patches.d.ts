declare module 'prosemirror-dropcursor' {
  import { Plugin, Selection } from 'prosemirror-state';

  /**
   * Gap cursor selections are represented using this class. Its
   * `$anchor` and `$head` properties both point at the cursor position.
   */
  export function dropCursor(): Plugin;
}
