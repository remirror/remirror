// declare module 'hoist-non-react-statics' {
//   import React from 'react';

//   declare function hoistNonReactStatics<Own, Custom>(
//     TargetComponent: React.ComponentType<Own>,
//     SourceComponent: React.ComponentType<Custom>,
//     customStatic?: object,
//   ): React.ComponentType<Own>;

//   export default hoistNonReactStatics;
// }

declare module 'prosemirror-dropcursor' {
  import { Plugin, Selection } from 'prosemirror-state';

  /**
   * Gap cursor selections are represented using this class. Its
   * `$anchor` and `$head` properties both point at the cursor position.
   */
  export function dropCursor(): Plugin;
}
