# remirror

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- e518ef1d: Rewrite the positioner extension with a new API for creating positioners.

  Positioners now return an array of `VirtualPositions` or an empty array if no positions extension.

  `@remirror/react` - Add `useMultiPositioner`. `@remirror/react` - Add `virtualNode` property for
  compatibility with `popper-react`

  An example of creating a new positioner with the new api is below.

  ```ts
  import { Positioner, Coords, hasStateChanged } from '@remirror/extension-positioner';

  export const cursorPopupPositioner = Positioner.create<Coords>({
    hasChanged: hasStateChanged,

    /**
     * Only active when the selection is empty (one character)
     */
    getActive: (parameter) => {
      const { state, view } = parameter;

      if (!state.selection.empty) {
        return [];
      }

      return [view.coordsAtPos(state.selection.from)];
    },

    getPosition(parameter) {
      const { element, data: cursor } = parameter;
      const parent = element.offsetParent;

      if (!parent) {
        return emptyVirtualPosition;
      }

      // The box in which the bubble menu is positioned, to use as an anchor
      const parentBox = parent.getBoundingClientRect();

      // The popup menu element
      const elementBox = element.getBoundingClientRect();

      const calculatedLeft = cursor.left - parentBox.left;
      const calculatedRight = parentBox.right - cursor.right;

      const bottom = Math.trunc(cursor.bottom - parentBox.top);
      const top = Math.trunc(cursor.top - parentBox.top);
      const rect = new DOMRect(cursor.left, cursor.top, 0, cursor.bottom - cursor.top);
      const left =
        calculatedLeft + elementBox.width > parentBox.width
          ? calculatedLeft - elementBox.width
          : calculatedLeft;
      const right =
        calculatedRight + elementBox.width > parentBox.width
          ? calculatedRight - elementBox.width
          : calculatedRight;

      return { rect, right, left, bottom, top };
    },
  });
  ```

- be9a9c17: Move all keymap functionality to `KeymapExtension` from `@remirror/core`. Remove all
  references to `@remirror/extension-base-keymap`.

### Minor Changes

- 206c1405: Extension to annotate content in your editor
- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from
  `@remirror/core-utils`.
- 2592b7b3: Allow runtime updates of `PlaceholderExtension` `emptyNodeClass` option.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [206c1405]
- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [982a6b15]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
- Updated dependencies [e518ef1d]
- Updated dependencies [be9a9c17]
- Updated dependencies [1918da2c]
- Updated dependencies [2592b7b3]
- Updated dependencies [720c9b43]
  - @remirror/preset-core@1.0.0-next.16
  - @remirror/preset-wysiwyg@1.0.0-next.16
  - @remirror/react@1.0.0-next.16
  - @remirror/react-social@1.0.0-next.16
  - @remirror/core-types@1.0.0-next.16
  - @remirror/react-wysiwyg@1.0.0-next.16
  - @remirror/extension-annotation@1.0.0-next.16
  - @remirror/core-utils@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/dom@1.0.0-next.16
  - @remirror/extension-auto-link@1.0.0-next.16
  - @remirror/extension-bidi@1.0.0-next.16
  - @remirror/extension-blockquote@1.0.0-next.16
  - @remirror/extension-bold@1.0.0-next.16
  - @remirror/extension-code@1.0.0-next.16
  - @remirror/extension-code-block@1.0.0-next.16
  - @remirror/extension-collaboration@1.0.0-next.16
  - @remirror/extension-diff@1.0.0-next.16
  - @remirror/extension-doc@1.0.0-next.16
  - @remirror/extension-drop-cursor@1.0.0-next.16
  - @remirror/extension-emoji@1.0.0-next.16
  - @remirror/extension-epic-mode@1.0.0-next.16
  - @remirror/extension-events@1.0.0-next.16
  - @remirror/extension-gap-cursor@1.0.0-next.16
  - @remirror/extension-hard-break@1.0.0-next.16
  - @remirror/extension-heading@1.0.0-next.16
  - @remirror/extension-history@1.0.0-next.16
  - @remirror/extension-horizontal-rule@1.0.0-next.16
  - @remirror/extension-image@1.0.0-next.16
  - @remirror/extension-italic@1.0.0-next.16
  - @remirror/extension-link@1.0.0-next.16
  - @remirror/extension-mention@1.0.0-next.16
  - @remirror/extension-paragraph@1.0.0-next.16
  - @remirror/extension-placeholder@1.0.0-next.16
  - @remirror/extension-position-tracker@1.0.0-next.16
  - @remirror/extension-positioner@1.0.0-next.16
  - @remirror/extension-react-component@1.0.0-next.16
  - @remirror/extension-react-ssr@1.0.0-next.16
  - @remirror/extension-search@1.0.0-next.16
  - @remirror/extension-strike@1.0.0-next.16
  - @remirror/extension-text@1.0.0-next.16
  - @remirror/extension-trailing-node@1.0.0-next.16
  - @remirror/extension-underline@1.0.0-next.16
  - @remirror/extension-yjs@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - @remirror/preset-embed@1.0.0-next.16
  - @remirror/preset-list@1.0.0-next.16
  - @remirror/preset-react@1.0.0-next.16
  - @remirror/preset-social@1.0.0-next.16
  - @remirror/preset-table@1.0.0-next.16
  - @remirror/react-utils@1.0.0-next.16
  - @remirror/theme@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Major Changes

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`,
  `areSchemaCompatible` and `getRemirrorJSON`.

  BREAKING: 💥 Rename `getObjectNode` to `getRemirrorJSON`.

- 0ff4fd5c: Default to inserting a new paragraph node after the `HorizontalRuleExtension`.

  BREAKING: 💥 Rename `horizonalRule` command to `insertHorizontalRule`.

  Add a new option `insertionNode` to the `HorizontalRuleExtension` which sets the default node to
  automatically append after insertion.

  Update the css styles for the default `hr` tag.

  Closes #417

### Minor Changes

- 44516da4: Support `chained` commands and multiple command updates in controlled editors.

  Fixes #418

- e5ea0c84: Add support for `Handler` options with custom return values and early returns.

  Previously handlers would ignore any return values. Now a handler will honour the return value.
  The earlyReturn value can be specified in the static options using the `extensionDecorator`.
  Currently it only supports primitives. Support for a function to check the return value will be
  added later.

- 08e51078: Add `insertHardBreak` command.

  Add inline documentation instructing developers to use the `TrailingNodeExtension` when using
  `hardBreak` to exit a `codeBlock`.

- f91dcab1: 🎉 New extension `@remirror/extension-events`.

  This extension adds handlers for the events happening within the remirror editor. The extension is
  part of the `CorePreset` but it doesn't make it's handlers available to the preset. In order to
  use the handlers you will need direct access to the `EventsExtension`.

  ```ts
  import { EventsExtension } from 'remirror/extension-events';
  import { useExtension } from 'remirror/react';

  const Editor = () => {
    useExtension(
      EventsExtension,
      ({ addHandler }) => {
        addHandler('focus', () => log('focused'));
      },
      [],
    );
  };
  ```

  To begin with the only events added are `focus` and `blur`.

### Patch Changes

- 0dd4d621: Prevent mid word emoji matches on colon press.
- 273d0a71: Hide social popups when the editor is blurred.
- 9d708c03: Reduce the `AutoLinkExtension` priority and remove priority override for the mention and
  emoji extensions.
- a404f5a1: Add the option `excludeExtensions` to `CorePreset`'s `constructor` to exclude any
  extensions.

  Remove the option `excludeHistory` from `CorePreset`'s `constructor`.

- e3d937f0: Support chaining for `setBold` and `removeBold` commands.
- 6c3b278b: Make sure the `transaction` has all the latest updates if changed between
  `onStateUpdate` events. This allows chaining to be supported properly.
- 7477b935: Use `NonChainableCommandFunction` annotation to indicate commands are not chainable.
- Updated dependencies [cdc5b801]
- Updated dependencies [0dd4d621]
- Updated dependencies [0ff4fd5c]
- Updated dependencies [273d0a71]
- Updated dependencies [44516da4]
- Updated dependencies [9d708c03]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [e3d937f0]
- Updated dependencies [6c3b278b]
- Updated dependencies [7477b935]
- Updated dependencies [08e51078]
- Updated dependencies [f91dcab1]
  - @remirror/core-utils@1.0.0-next.15
  - @remirror/core@1.0.0-next.15
  - @remirror/extension-emoji@1.0.0-next.15
  - @remirror/extension-horizontal-rule@1.0.0-next.15
  - @remirror/react-social@1.0.0-next.15
  - @remirror/extension-code@1.0.0-next.15
  - @remirror/extension-code-block@1.0.0-next.15
  - @remirror/extension-heading@1.0.0-next.15
  - @remirror/extension-italic@1.0.0-next.15
  - @remirror/extension-paragraph@1.0.0-next.15
  - @remirror/extension-strike@1.0.0-next.15
  - @remirror/extension-underline@1.0.0-next.15
  - @remirror/preset-social@1.0.0-next.15
  - @remirror/extension-bold@1.0.0-next.15
  - @remirror/extension-history@1.0.0-next.15
  - @remirror/extension-yjs@1.0.0-next.15
  - @remirror/extension-hard-break@1.0.0-next.15
  - @remirror/extension-events@1.0.0-next.15
  - @remirror/preset-core@1.0.0-next.15
  - @remirror/dom@1.0.0-next.15
  - @remirror/extension-auto-link@1.0.0-next.15
  - @remirror/extension-base-keymap@1.0.0-next.15
  - @remirror/extension-bidi@1.0.0-next.15
  - @remirror/extension-blockquote@1.0.0-next.15
  - @remirror/extension-collaboration@1.0.0-next.15
  - @remirror/extension-diff@1.0.0-next.15
  - @remirror/extension-doc@1.0.0-next.15
  - @remirror/extension-drop-cursor@1.0.0-next.15
  - @remirror/extension-epic-mode@1.0.0-next.15
  - @remirror/extension-gap-cursor@1.0.0-next.15
  - @remirror/extension-image@1.0.0-next.15
  - @remirror/extension-link@1.0.0-next.15
  - @remirror/extension-mention@1.0.0-next.15
  - @remirror/extension-placeholder@1.0.0-next.15
  - @remirror/extension-position-tracker@1.0.0-next.15
  - @remirror/extension-positioner@1.0.0-next.15
  - @remirror/extension-react-component@1.0.0-next.15
  - @remirror/extension-react-ssr@1.0.0-next.15
  - @remirror/extension-search@1.0.0-next.15
  - @remirror/extension-text@1.0.0-next.15
  - @remirror/extension-trailing-node@1.0.0-next.15
  - @remirror/preset-embed@1.0.0-next.15
  - @remirror/preset-list@1.0.0-next.15
  - @remirror/preset-react@1.0.0-next.15
  - @remirror/preset-table@1.0.0-next.15
  - @remirror/preset-wysiwyg@1.0.0-next.15
  - @remirror/react@1.0.0-next.15
  - @remirror/react-wysiwyg@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 4030b506: For some reason `changesets` is not picking up updates to the depedencies of `remirror`.
- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [38941404]
- Updated dependencies [e45706e5]
- Updated dependencies [38941404]
- Updated dependencies [3fbb2325]
- Updated dependencies [02704d42]
- Updated dependencies [38941404]
- Updated dependencies [38941404]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-auto-link@1.0.0-next.13
  - @remirror/extension-base-keymap@1.0.0-next.13
  - @remirror/extension-blockquote@1.0.0-next.13
  - @remirror/extension-bold@1.0.0-next.13
  - @remirror/extension-code@1.0.0-next.13
  - @remirror/extension-code-block@1.0.0-next.13
  - @remirror/extension-emoji@1.0.0-next.13
  - @remirror/extension-hard-break@1.0.0-next.13
  - @remirror/extension-heading@1.0.0-next.13
  - @remirror/extension-history@1.0.0-next.13
  - @remirror/extension-horizontal-rule@1.0.0-next.13
  - @remirror/extension-italic@1.0.0-next.13
  - @remirror/extension-link@1.0.0-next.13
  - @remirror/extension-mention@1.0.0-next.13
  - @remirror/extension-search@1.0.0-next.13
  - @remirror/extension-strike@1.0.0-next.13
  - @remirror/extension-underline@1.0.0-next.13
  - @remirror/extension-yjs@1.0.0-next.13
  - @remirror/preset-list@1.0.0-next.13
  - @remirror/extension-bidi@1.0.0-next.13
  - @remirror/extension-collaboration@1.0.0-next.13
  - @remirror/extension-diff@1.0.0-next.13
  - @remirror/extension-doc@1.0.0-next.13
  - @remirror/extension-drop-cursor@1.0.0-next.13
  - @remirror/extension-epic-mode@1.0.0-next.13
  - @remirror/extension-gap-cursor@1.0.0-next.13
  - @remirror/extension-image@1.0.0-next.13
  - @remirror/extension-paragraph@1.0.0-next.13
  - @remirror/extension-placeholder@1.0.0-next.13
  - @remirror/extension-position-tracker@1.0.0-next.13
  - @remirror/extension-positioner@1.0.0-next.13
  - @remirror/extension-react-component@1.0.0-next.13
  - @remirror/extension-react-ssr@1.0.0-next.13
  - @remirror/extension-text@1.0.0-next.13
  - @remirror/extension-trailing-node@1.0.0-next.13
  - @remirror/preset-core@1.0.0-next.13
  - @remirror/preset-embed@1.0.0-next.13
  - @remirror/preset-react@1.0.0-next.13
  - @remirror/preset-social@1.0.0-next.13
  - @remirror/preset-table@1.0.0-next.13
  - @remirror/preset-wysiwyg@1.0.0-next.13
  - @remirror/core-types@1.0.0-next.13
  - @remirror/react@1.0.0-next.13
  - @remirror/core-constants@1.0.0-next.13
  - @remirror/core-helpers@1.0.0-next.13
  - @remirror/dom@1.0.0-next.13
  - @remirror/react-social@1.0.0-next.13
  - @remirror/react-wysiwyg@1.0.0-next.13

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 65efac96: Add entrypoint for `remirror/react/renderers`.

### Patch Changes

- Updated dependencies [6468058a]
- Updated dependencies [76d1df83]
- Updated dependencies [3702a83a]
- Updated dependencies [e554ce8c]
- Updated dependencies [5539bc32]
- Updated dependencies [16a683f3]
  - @remirror/core@1.0.0-next.10
  - @remirror/react@1.0.0-next.10
  - @remirror/preset-core@1.0.0-next.10
  - @remirror/extension-react-component@1.0.0-next.10
  - @remirror/extension-react-ssr@1.0.0-next.10
  - @remirror/preset-wysiwyg@1.0.0-next.10
  - @remirror/react-social@1.0.0-next.10
  - @remirror/dom@1.0.0-next.10
  - @remirror/extension-auto-link@1.0.0-next.10
  - @remirror/extension-base-keymap@1.0.0-next.10
  - @remirror/extension-bidi@1.0.0-next.10
  - @remirror/extension-blockquote@1.0.0-next.10
  - @remirror/extension-bold@1.0.0-next.10
  - @remirror/extension-code@1.0.0-next.10
  - @remirror/extension-code-block@1.0.0-next.10
  - @remirror/extension-collaboration@1.0.0-next.10
  - @remirror/extension-diff@1.0.0-next.10
  - @remirror/extension-doc@1.0.0-next.10
  - @remirror/extension-drop-cursor@1.0.0-next.10
  - @remirror/extension-emoji@1.0.0-next.10
  - @remirror/extension-epic-mode@1.0.0-next.10
  - @remirror/extension-gap-cursor@1.0.0-next.10
  - @remirror/extension-hard-break@1.0.0-next.10
  - @remirror/extension-heading@1.0.0-next.10
  - @remirror/extension-history@1.0.0-next.10
  - @remirror/extension-horizontal-rule@1.0.0-next.10
  - @remirror/extension-image@1.0.0-next.10
  - @remirror/extension-italic@1.0.0-next.10
  - @remirror/extension-link@1.0.0-next.10
  - @remirror/extension-mention@1.0.0-next.10
  - @remirror/extension-paragraph@1.0.0-next.10
  - @remirror/extension-placeholder@1.0.0-next.10
  - @remirror/extension-position-tracker@1.0.0-next.10
  - @remirror/extension-positioner@1.0.0-next.10
  - @remirror/extension-search@1.0.0-next.10
  - @remirror/extension-strike@1.0.0-next.10
  - @remirror/extension-text@1.0.0-next.10
  - @remirror/extension-trailing-node@1.0.0-next.10
  - @remirror/extension-underline@1.0.0-next.10
  - @remirror/extension-yjs@1.0.0-next.10
  - @remirror/preset-embed@1.0.0-next.10
  - @remirror/preset-list@1.0.0-next.10
  - @remirror/preset-react@1.0.0-next.10
  - @remirror/preset-social@1.0.0-next.10
  - @remirror/preset-table@1.0.0-next.10
  - @remirror/react-wysiwyg@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

- 02fdafff: - Rename `change` event to `updated`. `updated` is called with the
  `EventListenerParameter`.

  - Add new manager `stateUpdate` to the `editorWrapper`
  - Add `autoUpdate` option to `useRemirror` hook from `@remirror/react` which means that the
    context object returned by the hook is always up to date with the latest editor state. It will
    also cause the component to rerender so be careful to only use it when necessary.

  ```tsx
  const { active, commands } = useRemirror({ autoUpdate: true });

  return (
    <button
      onClick={() => commands.toggleBold}
      style={{ fontWeight: active.bold() ? 'bold' : undefined }}
    >
      B
    </button>
  );
  ```

  - Fix broken `onChangeHandler` parameter for the use `useRemirror` hook.

- b332942b: Fix broken SSR and add unit tests back.
- Updated dependencies [02fdafff]
- Updated dependencies [b332942b]
  - @remirror/react@1.0.0-next.9
  - @remirror/core@1.0.0-next.9
  - @remirror/dom@1.0.0-next.9
  - @remirror/react-social@1.0.0-next.9
  - @remirror/react-wysiwyg@1.0.0-next.9
  - @remirror/extension-auto-link@1.0.0-next.9
  - @remirror/extension-base-keymap@1.0.0-next.9
  - @remirror/extension-bidi@1.0.0-next.9
  - @remirror/extension-blockquote@1.0.0-next.9
  - @remirror/extension-bold@1.0.0-next.9
  - @remirror/extension-code@1.0.0-next.9
  - @remirror/extension-code-block@1.0.0-next.9
  - @remirror/extension-collaboration@1.0.0-next.9
  - @remirror/extension-diff@1.0.0-next.9
  - @remirror/extension-doc@1.0.0-next.9
  - @remirror/extension-drop-cursor@1.0.0-next.9
  - @remirror/extension-emoji@1.0.0-next.9
  - @remirror/extension-epic-mode@1.0.0-next.9
  - @remirror/extension-gap-cursor@1.0.0-next.9
  - @remirror/extension-hard-break@1.0.0-next.9
  - @remirror/extension-heading@1.0.0-next.9
  - @remirror/extension-history@1.0.0-next.9
  - @remirror/extension-horizontal-rule@1.0.0-next.9
  - @remirror/extension-image@1.0.0-next.9
  - @remirror/extension-italic@1.0.0-next.9
  - @remirror/extension-link@1.0.0-next.9
  - @remirror/extension-mention@1.0.0-next.9
  - @remirror/extension-paragraph@1.0.0-next.9
  - @remirror/extension-placeholder@1.0.0-next.9
  - @remirror/extension-position-tracker@1.0.0-next.9
  - @remirror/extension-positioner@1.0.0-next.9
  - @remirror/extension-react-component@1.0.0-next.9
  - @remirror/extension-react-ssr@1.0.0-next.9
  - @remirror/extension-search@1.0.0-next.9
  - @remirror/extension-strike@1.0.0-next.9
  - @remirror/extension-text@1.0.0-next.9
  - @remirror/extension-trailing-node@1.0.0-next.9
  - @remirror/extension-underline@1.0.0-next.9
  - @remirror/extension-yjs@1.0.0-next.9
  - @remirror/preset-core@1.0.0-next.9
  - @remirror/preset-embed@1.0.0-next.9
  - @remirror/preset-list@1.0.0-next.9
  - @remirror/preset-react@1.0.0-next.9
  - @remirror/preset-social@1.0.0-next.9
  - @remirror/preset-table@1.0.0-next.9
  - @remirror/preset-wysiwyg@1.0.0-next.9

## 1.0.0-next.5

> 2020-07-17

### Patch Changes

- d186b75a: Correct the incorrect `remirror/react/ssr` and `remirror/react/component` exports. They
  were incorrectly referencing each other.
- Updated dependencies [4628d342]
- Updated dependencies [e9286ed9]
  - @remirror/react@1.0.0-next.5
  - @remirror/extension-paragraph@1.0.0-next.5
  - @remirror/react-social@1.0.0-next.5
  - @remirror/react-wysiwyg@1.0.0-next.5

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [e1a1b6ec]
- Updated dependencies [9f495078]
- Updated dependencies [2d74596b]
- Updated dependencies [5d5970ae]
- Updated dependencies [64edeec2]
  - @remirror/core@1.0.0-next.4
  - @remirror/react@1.0.0-next.4
  - @remirror/preset-table@1.0.0-next.4
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/core-utils@1.0.0-next.4
  - @remirror/dom@1.0.0-next.4
  - @remirror/extension-auto-link@1.0.0-next.4
  - @remirror/extension-base-keymap@1.0.0-next.4
  - @remirror/extension-bidi@1.0.0-next.4
  - @remirror/extension-blockquote@1.0.0-next.4
  - @remirror/extension-bold@1.0.0-next.4
  - @remirror/extension-code@1.0.0-next.4
  - @remirror/extension-code-block@1.0.0-next.4
  - @remirror/extension-collaboration@1.0.0-next.4
  - @remirror/extension-diff@1.0.0-next.4
  - @remirror/extension-doc@1.0.0-next.4
  - @remirror/extension-drop-cursor@1.0.0-next.4
  - @remirror/extension-emoji@1.0.0-next.4
  - @remirror/extension-epic-mode@1.0.0-next.4
  - @remirror/extension-gap-cursor@1.0.0-next.4
  - @remirror/extension-hard-break@1.0.0-next.4
  - @remirror/extension-heading@1.0.0-next.4
  - @remirror/extension-history@1.0.0-next.4
  - @remirror/extension-horizontal-rule@1.0.0-next.4
  - @remirror/extension-image@1.0.0-next.4
  - @remirror/extension-italic@1.0.0-next.4
  - @remirror/extension-link@1.0.0-next.4
  - @remirror/extension-mention@1.0.0-next.4
  - @remirror/extension-paragraph@1.0.0-next.4
  - @remirror/extension-placeholder@1.0.0-next.4
  - @remirror/extension-position-tracker@1.0.0-next.4
  - @remirror/extension-positioner@1.0.0-next.4
  - @remirror/extension-react-ssr@1.0.0-next.4
  - @remirror/extension-search@1.0.0-next.4
  - @remirror/extension-strike@1.0.0-next.4
  - @remirror/extension-text@1.0.0-next.4
  - @remirror/extension-trailing-node@1.0.0-next.4
  - @remirror/extension-underline@1.0.0-next.4
  - @remirror/extension-yjs@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/preset-core@1.0.0-next.4
  - @remirror/preset-embed@1.0.0-next.4
  - @remirror/preset-list@1.0.0-next.4
  - @remirror/preset-react@1.0.0-next.4
  - @remirror/preset-social@1.0.0-next.4
  - @remirror/preset-wysiwyg@1.0.0-next.4
  - @remirror/react-social@1.0.0-next.4
  - @remirror/react-utils@1.0.0-next.4
  - @remirror/react-wysiwyg@1.0.0-next.4
  - @remirror/theme@1.0.0-next.4
  - @remirror/extension-react-component@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/core-types@1.0.0-next.3
  - @remirror/core-utils@1.0.0-next.3
  - @remirror/dom@1.0.0-next.3
  - @remirror/extension-auto-link@1.0.0-next.3
  - @remirror/extension-base-keymap@1.0.0-next.3
  - @remirror/extension-bidi@1.0.0-next.3
  - @remirror/extension-blockquote@1.0.0-next.3
  - @remirror/extension-bold@1.0.0-next.3
  - @remirror/extension-code@1.0.0-next.3
  - @remirror/extension-code-block@1.0.0-next.3
  - @remirror/extension-collaboration@1.0.0-next.3
  - @remirror/extension-diff@1.0.0-next.3
  - @remirror/extension-doc@1.0.0-next.3
  - @remirror/extension-drop-cursor@1.0.0-next.3
  - @remirror/extension-emoji@1.0.0-next.3
  - @remirror/extension-epic-mode@1.0.0-next.3
  - @remirror/extension-gap-cursor@1.0.0-next.3
  - @remirror/extension-hard-break@1.0.0-next.3
  - @remirror/extension-heading@1.0.0-next.3
  - @remirror/extension-history@1.0.0-next.3
  - @remirror/extension-horizontal-rule@1.0.0-next.3
  - @remirror/extension-image@1.0.0-next.3
  - @remirror/extension-italic@1.0.0-next.3
  - @remirror/extension-link@1.0.0-next.3
  - @remirror/extension-mention@1.0.0-next.3
  - @remirror/extension-paragraph@1.0.0-next.3
  - @remirror/extension-placeholder@1.0.0-next.3
  - @remirror/extension-position-tracker@1.0.0-next.3
  - @remirror/extension-positioner@1.0.0-next.3
  - @remirror/extension-react-ssr@1.0.0-next.3
  - @remirror/extension-search@1.0.0-next.3
  - @remirror/extension-strike@1.0.0-next.3
  - @remirror/extension-text@1.0.0-next.3
  - @remirror/extension-trailing-node@1.0.0-next.3
  - @remirror/extension-underline@1.0.0-next.3
  - @remirror/extension-yjs@1.0.0-next.3
  - @remirror/preset-core@1.0.0-next.3
  - @remirror/preset-embed@1.0.0-next.3
  - @remirror/preset-list@1.0.0-next.3
  - @remirror/preset-react@1.0.0-next.3
  - @remirror/preset-social@1.0.0-next.3
  - @remirror/preset-table@1.0.0-next.3
  - @remirror/preset-wysiwyg@1.0.0-next.3
  - @remirror/react@1.0.0-next.3
  - @remirror/react-social@1.0.0-next.3
  - @remirror/react-wysiwyg@1.0.0-next.3

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/core-utils@1.0.0-next.1
  - @remirror/dom@1.0.0-next.1
  - @remirror/extension-auto-link@1.0.0-next.1
  - @remirror/extension-base-keymap@1.0.0-next.1
  - @remirror/extension-bidi@1.0.0-next.1
  - @remirror/extension-blockquote@1.0.0-next.1
  - @remirror/extension-bold@1.0.0-next.1
  - @remirror/extension-code@1.0.0-next.1
  - @remirror/extension-code-block@1.0.0-next.1
  - @remirror/extension-collaboration@1.0.0-next.1
  - @remirror/extension-diff@1.0.0-next.1
  - @remirror/extension-doc@1.0.0-next.1
  - @remirror/extension-drop-cursor@1.0.0-next.1
  - @remirror/extension-emoji@1.0.0-next.1
  - @remirror/extension-epic-mode@1.0.0-next.1
  - @remirror/extension-gap-cursor@1.0.0-next.1
  - @remirror/extension-hard-break@1.0.0-next.1
  - @remirror/extension-heading@1.0.0-next.1
  - @remirror/extension-history@1.0.0-next.1
  - @remirror/extension-horizontal-rule@1.0.0-next.1
  - @remirror/extension-image@1.0.0-next.1
  - @remirror/extension-italic@1.0.0-next.1
  - @remirror/extension-link@1.0.0-next.1
  - @remirror/extension-mention@1.0.0-next.1
  - @remirror/extension-paragraph@1.0.0-next.1
  - @remirror/extension-placeholder@1.0.0-next.1
  - @remirror/extension-position-tracker@1.0.0-next.1
  - @remirror/extension-positioner@1.0.0-next.1
  - @remirror/extension-react-ssr@1.0.0-next.1
  - @remirror/extension-search@1.0.0-next.1
  - @remirror/extension-strike@1.0.0-next.1
  - @remirror/extension-text@1.0.0-next.1
  - @remirror/extension-trailing-node@1.0.0-next.1
  - @remirror/extension-underline@1.0.0-next.1
  - @remirror/extension-yjs@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/preset-core@1.0.0-next.1
  - @remirror/preset-embed@1.0.0-next.1
  - @remirror/preset-list@1.0.0-next.1
  - @remirror/preset-react@1.0.0-next.1
  - @remirror/preset-social@1.0.0-next.1
  - @remirror/preset-table@1.0.0-next.1
  - @remirror/preset-wysiwyg@1.0.0-next.1
  - @remirror/react@1.0.0-next.1
  - @remirror/react-social@1.0.0-next.1
  - @remirror/react-utils@1.0.0-next.1
  - @remirror/react-wysiwyg@1.0.0-next.1
  - @remirror/theme@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking
  change across all packages. The best way to know what's changed is to read the documentaion on the
  new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from
    '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`.
  If your code was importing any matching interface you will need to update the name.

### Minor Changes

- 8334294e: Make `react`, `react-dom` and their `@type` counterparts optional peer depedencies. This
  means users will no longer receive a warning if they install the package without react.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
- Updated dependencies [141c7864]
  - @remirror/core@1.0.0-next.0
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/core-utils@1.0.0-next.0
  - @remirror/dom@1.0.0-next.0
  - @remirror/extension-auto-link@1.0.0-next.0
  - @remirror/extension-base-keymap@1.0.0-next.0
  - @remirror/extension-bidi@1.0.0-next.0
  - @remirror/extension-blockquote@1.0.0-next.0
  - @remirror/extension-bold@1.0.0-next.0
  - @remirror/extension-code@1.0.0-next.0
  - @remirror/extension-code-block@1.0.0-next.0
  - @remirror/extension-collaboration@1.0.0-next.0
  - @remirror/extension-diff@1.0.0-next.0
  - @remirror/extension-doc@1.0.0-next.0
  - @remirror/extension-drop-cursor@1.0.0-next.0
  - @remirror/extension-emoji@1.0.0-next.0
  - @remirror/extension-epic-mode@1.0.0-next.0
  - @remirror/extension-gap-cursor@1.0.0-next.0
  - @remirror/extension-hard-break@1.0.0-next.0
  - @remirror/extension-heading@1.0.0-next.0
  - @remirror/extension-history@1.0.0-next.0
  - @remirror/extension-horizontal-rule@1.0.0-next.0
  - @remirror/extension-image@1.0.0-next.0
  - @remirror/extension-italic@1.0.0-next.0
  - @remirror/extension-link@1.0.0-next.0
  - @remirror/extension-mention@1.0.0-next.0
  - @remirror/extension-paragraph@1.0.0-next.0
  - @remirror/extension-placeholder@1.0.0-next.0
  - @remirror/extension-position-tracker@1.0.0-next.0
  - @remirror/extension-positioner@1.0.0-next.0
  - @remirror/extension-react-ssr@1.0.0-next.0
  - @remirror/extension-search@1.0.0-next.0
  - @remirror/extension-strike@1.0.0-next.0
  - @remirror/extension-text@1.0.0-next.0
  - @remirror/extension-trailing-node@1.0.0-next.0
  - @remirror/extension-underline@1.0.0-next.0
  - @remirror/extension-yjs@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/preset-core@1.0.0-next.0
  - @remirror/preset-embed@1.0.0-next.0
  - @remirror/preset-list@1.0.0-next.0
  - @remirror/preset-react@1.0.0-next.0
  - @remirror/preset-social@1.0.0-next.0
  - @remirror/preset-table@1.0.0-next.0
  - @remirror/preset-wysiwyg@1.0.0-next.0
  - @remirror/react@1.0.0-next.0
  - @remirror/react-social@1.0.0-next.0
  - @remirror/react-utils@1.0.0-next.0
  - @remirror/react-wysiwyg@1.0.0-next.0
  - @remirror/theme@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1
  - @remirror/react@0.13.1

## 0.11.0

### Patch Changes

- Updated dependencies [026d4238]
- Updated dependencies [69d00c62]
- Updated dependencies [c2237aa0]
  - @remirror/react@0.11.0
  - @remirror/core@0.11.0
  - @remirror/core-extensions@0.11.0

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - @remirror/react@0.7.7

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - @remirror/core-extensions@0.7.5
  - @remirror/react@0.7.6

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react@0.7.5

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/react@0.7.3
