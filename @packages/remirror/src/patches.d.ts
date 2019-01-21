declare module 'css-in-js-utils/lib/cssifyObject' {
  import * as CSS from 'csstype';

  export default function(obj: CSS.Properties<any>): string;
}

declare module 'prosemirror-dropcursor' {
  import { Plugin, Selection } from 'prosemirror-state';

  /**
   * Gap cursor selections are represented using this class. Its
   * `$anchor` and `$head` properties both point at the cursor position.
   */
  export function dropCursor(): Plugin;
}
