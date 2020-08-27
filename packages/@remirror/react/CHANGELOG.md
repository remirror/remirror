# @remirror/react

## 1.0.0-next.28

> 2020-08-27

### Minor Changes

- [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d)
  [#591](https://github.com/remirror/remirror/pull/591) Thanks
  [@ifiokjr](https://github.com/ifiokjr)! - Add support for nested content within `ReactComponent`
  node views. Also support adding multiple components to the manager via the `nodeViewComponents`
  setting. Currently `ReactNodeView` components must be defined at initialization, and marks are not
  supported.

  - Also enforce minimum required extensions for the manager passed to the `RemirrorProvider`.
  - Some general cleanup and refactoring.
  - Add support for composing refs when using `getRootProps`. Now you can add your own ref to the
    `getRootProps({ ref })` function call which will be populated at the same time.
  - Test the names of `Extension`'s and `Preset`'s in with `extensionValidityTest`.
  - **BREAKING CHANGES** 💥
    - Rename: `ReactSSRExtension` => `ReactSsrExtension`
    - Rename: `ReactComponentExtension.name` from `reactNodeView` => `reactComponent`.
    - Rename: `NodeViewsExtension` => `NodeViewExtension`
    - Rename: `NodeViewsExtension` => `NodeViewExtension`
    - Rename: `SuggestExtension.name` from `suggestions` => `suggest`

### Patch Changes

- [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)
  [#585](https://github.com/remirror/remirror/pull/585) Thanks
  [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies and `linaria`.

- Updated dependencies
  [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47),
  [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448),
  [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d),
  [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/extension-placeholder@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28
  - @remirror/preset-react@1.0.0-next.28
  - @remirror/extension-react-component@1.0.0-next.28
  - @remirror/extension-react-ssr@1.0.0-next.28
  - @remirror/extension-positioner@1.0.0-next.28
  - @remirror/preset-core@1.0.0-next.28
  - @remirror/i18n@1.0.0-next.28
  - @remirror/react-utils@1.0.0-next.28
  - @remirror/theme@1.0.0-next.28

## 1.0.0-next.27

> 2020-08-25

### Patch Changes

- Updated dependencies [a7436f03]
  - @remirror/theme@1.0.0-next.27

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/extension-placeholder@1.0.0-next.26
  - @remirror/extension-positioner@1.0.0-next.26
  - @remirror/extension-react-component@1.0.0-next.26
  - @remirror/extension-react-ssr@1.0.0-next.26
  - @remirror/preset-core@1.0.0-next.26
  - @remirror/preset-react@1.0.0-next.26
  - @remirror/react-utils@1.0.0-next.26
  - @remirror/i18n@1.0.0-next.26
  - @remirror/theme@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/extension-placeholder@1.0.0-next.25
  - @remirror/extension-positioner@1.0.0-next.25
  - @remirror/extension-react-component@1.0.0-next.25
  - @remirror/extension-react-ssr@1.0.0-next.25
  - @remirror/preset-core@1.0.0-next.25
  - @remirror/preset-react@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
  - @remirror/core@1.0.0-next.24
  - @remirror/extension-placeholder@1.0.0-next.24
  - @remirror/extension-positioner@1.0.0-next.24
  - @remirror/extension-react-component@1.0.0-next.24
  - @remirror/extension-react-ssr@1.0.0-next.24
  - @remirror/preset-core@1.0.0-next.24
  - @remirror/preset-react@1.0.0-next.24

## 1.0.0-next.23

> 2020-08-18

### Patch Changes

- d505ebc1: Fixes #555 `onChange` callback not being updated when using a controlled editor in
  `StrictMode`.

## 1.0.0-next.22

> 2020-08-17

### Minor Changes

- d300c5f0: Fix #516 with social emoji popup when scroll bars are visible.

  Export `emptyCoords` object from `@remirror/extension-positioner`.

  Add second parameter to `usePositioner` hook which can override when a positioner should be set to
  active.

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
- Updated dependencies [d300c5f0]
  - @remirror/core@1.0.0-next.22
  - @remirror/extension-positioner@1.0.0-next.22
  - @remirror/extension-placeholder@1.0.0-next.22
  - @remirror/extension-react-component@1.0.0-next.22
  - @remirror/extension-react-ssr@1.0.0-next.22
  - @remirror/preset-core@1.0.0-next.22
  - @remirror/preset-react@1.0.0-next.22
  - @remirror/react-utils@1.0.0-next.22
  - @remirror/theme@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22
  - @remirror/i18n@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core@1.0.0-next.21
  - @remirror/extension-placeholder@1.0.0-next.21
  - @remirror/extension-positioner@1.0.0-next.21
  - @remirror/extension-react-component@1.0.0-next.21
  - @remirror/extension-react-ssr@1.0.0-next.21
  - @remirror/preset-core@1.0.0-next.21
  - @remirror/preset-react@1.0.0-next.21
  - @remirror/react-utils@1.0.0-next.21
  - @remirror/theme@1.0.0-next.21
  - @remirror/i18n@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- 95697fbd: Fix the controlled editor when used in `StrictMode`. Closes #482
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/pm@1.0.0-next.20
  - @remirror/core@1.0.0-next.20
  - @remirror/react-utils@1.0.0-next.20
  - @remirror/theme@1.0.0-next.20
  - @remirror/i18n@1.0.0-next.20
  - @remirror/extension-placeholder@1.0.0-next.20
  - @remirror/extension-positioner@1.0.0-next.20
  - @remirror/extension-react-component@1.0.0-next.20
  - @remirror/extension-react-ssr@1.0.0-next.20
  - @remirror/preset-core@1.0.0-next.20
  - @remirror/preset-react@1.0.0-next.20

## 1.0.0-next.17

> 2020-08-02

### Major Changes

- 4498814f: Rename `UsePositionerHookReturn` and `UseMultiPositionerHookReturn` to
  `UsePositionerReturn` and `UseMultiPositionerReturn`.

  - Add `active: boolean` property to `UsePositionerHookReturn`.
  - Fix the floating emoji menu for the social editor and showcase. Now hidden when text selection
    spans multiple characters.

### Patch Changes

- Updated dependencies [2d72ca94]
- Updated dependencies [898c62e0]
  - @remirror/extension-positioner@1.0.0-next.17
  - @remirror/core@1.0.0-next.17
  - @remirror/preset-core@1.0.0-next.17
  - @remirror/extension-placeholder@1.0.0-next.17
  - @remirror/extension-react-component@1.0.0-next.17
  - @remirror/extension-react-ssr@1.0.0-next.17
  - @remirror/preset-react@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- 6528323e: **Breaking:** `@remirror/preset-core` -`CreateCoreManagerOptions` now extends
  `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/preset-wysiwyg` - Rename `CreateWysiwygPresetListParameter` to
  **`CreateWysiwygPresetListOptions`**. Also it now extends `Remirror.ManagerSettings`.
  **Breaking:**`@remirror/react` - `CreateReactManagerOptions` now extends
  `Remirror.ManagerSettings`. **Breaking:** `@remirror/react-social` - `CreateSocialManagerOptions`
  now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/react`, `@remirror/react-social`, `@remirror/react-wysiwyg` now uses a
  `settings` property for manager settings.

  `@remirror/core-types` - Add `GetStaticAndDynamic<Options>` helper for extracting options from
  extension. Apply it to the packages mentioned above.

  - `@remirror/react-wysiwyg` - Update imports from `@remirror/preset-wysiwyg`.

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

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
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
- Updated dependencies [2592b7b3]
- Updated dependencies [720c9b43]
  - @remirror/preset-core@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/extension-placeholder@1.0.0-next.16
  - @remirror/extension-positioner@1.0.0-next.16
  - @remirror/extension-react-component@1.0.0-next.16
  - @remirror/extension-react-ssr@1.0.0-next.16
  - @remirror/i18n@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - @remirror/preset-react@1.0.0-next.16
  - @remirror/react-utils@1.0.0-next.16
  - @remirror/theme@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [6c3b278b]
- Updated dependencies [f91dcab1]
  - @remirror/core@1.0.0-next.15
  - @remirror/preset-core@1.0.0-next.15
  - @remirror/extension-placeholder@1.0.0-next.15
  - @remirror/extension-positioner@1.0.0-next.15
  - @remirror/extension-react-component@1.0.0-next.15
  - @remirror/extension-react-ssr@1.0.0-next.15
  - @remirror/preset-react@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 4571a447: Use methods for `addHandler` and `addCustomHandler`

  `@remirror/react` - Bind `addHandler` and `addCustomHandler` for `Preset` and `Extension` hooks.

- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [e45706e5]
- Updated dependencies [02704d42]
- Updated dependencies [38941404]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-placeholder@1.0.0-next.13
  - @remirror/extension-positioner@1.0.0-next.13
  - @remirror/extension-react-component@1.0.0-next.13
  - @remirror/extension-react-ssr@1.0.0-next.13
  - @remirror/preset-core@1.0.0-next.13
  - @remirror/preset-react@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core@1.0.0-next.12
  - @remirror/extension-placeholder@1.0.0-next.12
  - @remirror/extension-positioner@1.0.0-next.12
  - @remirror/extension-react-component@1.0.0-next.12
  - @remirror/extension-react-ssr@1.0.0-next.12
  - @remirror/preset-core@1.0.0-next.12
  - @remirror/preset-react@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

- 21a9650c: Rename `getArray` to `getLazyArray`. Also bump the version of `@remirror/core-helpers`
  to make sure it is released.
- Updated dependencies [54461006]
  - @remirror/core@1.0.0-next.11
  - @remirror/extension-placeholder@1.0.0-next.11
  - @remirror/extension-positioner@1.0.0-next.11
  - @remirror/extension-react-ssr@1.0.0-next.11
  - @remirror/extension-react-component@1.0.0-next.11
  - @remirror/preset-core@1.0.0-next.11
  - @remirror/preset-react@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 3702a83a: Remove requirement for `readonly` arrays when passing a list of extensions / presets to
  manager creators.

  - **`@remirror/react`** - Add support for a function as the first parameter to the `useManager`
    hook and `createReactManager` function.
  - **`@remirror/preset-core`** - Add support for a function as the first parameter to the
    `createCoreManager` function.

- e554ce8c: - Use `ReactComponent` for SSR.
  - Add `environment to`NodeViewComponentProps`.
  - Export `NodeViewComponentProps` from `@remirror/extension-react-component`.
  - Refactor `manager.store.components` to use `ManagerStoreReactComponent` interface.

### Patch Changes

- 76d1df83: - Prevent `createReactManager` being called on every render.
  - Accept a `manager` as a parameter for ``createReactManager`
  - Improve internal performance of components by caching the `ReactEditorWrapper` after the first
    render.
- Updated dependencies [6468058a]
- Updated dependencies [3702a83a]
- Updated dependencies [e554ce8c]
  - @remirror/core@1.0.0-next.10
  - @remirror/preset-core@1.0.0-next.10
  - @remirror/extension-react-component@1.0.0-next.10
  - @remirror/extension-react-ssr@1.0.0-next.10
  - @remirror/extension-placeholder@1.0.0-next.10
  - @remirror/extension-positioner@1.0.0-next.10
  - @remirror/preset-react@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Minor Changes

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

### Patch Changes

- b332942b: Fix broken SSR and add unit tests back.
- Updated dependencies [02fdafff]
  - @remirror/core@1.0.0-next.9
  - @remirror/extension-placeholder@1.0.0-next.9
  - @remirror/extension-positioner@1.0.0-next.9
  - @remirror/extension-react-component@1.0.0-next.9
  - @remirror/preset-core@1.0.0-next.9
  - @remirror/preset-react@1.0.0-next.9

## 1.0.0-next.7

> 2020-07-21

### Patch Changes

- 6c5a93c8: Fix a bug where the previous state was always equal to the updated state for controlled
  editors. This caused problems with functionality that relies on comparing state values e.g.
  `PositionerExtension`.

## 1.0.0-next.5

> 2020-07-17

### Minor Changes

- 4628d342: Add new entry point `@remirror/react/renderers`. It provides utilities for rendering the
  editor directly from the exported json.

## 1.0.0-next.4

> 2020-07-16

### Major Changes

- 64edeec2: Add a new extension package `@remirror/extension-react-component` for creating
  ProseMirror `NodeView`'s from React components.

  - Move `ReactPortal` implementation from `@remirror/react` to `@remirror/react-utils` for usage in
    other parts of the application.
  - Move `ReactNodeView` into new package `@remirror/extension-react-component`.
  - Rename `ReactNodeView.createNodeView` to `ReactNodeView.create`.

  The new package adds the `ReactComponent` property to the extension interface. An extension with a
  component attached will use it to override the automatic DOM representation with a ProseMirror
  `NodeView`.

### Patch Changes

- e1a1b6ec: Prevent multiple editors being attached with a single Provider. This error flags you
  when you are attaching `getRootProps` to the dom in multiple placeswithin a single editor
  instance. This can help prevent unwanted behaviour.
- 9f495078: Move `suppressHydrationWarning` prop from core to to react editor. It makes no sense for
  it to be in core since it only impacts the react editor.
- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
- Updated dependencies [64edeec2]
  - @remirror/core@1.0.0-next.4
  - @remirror/extension-placeholder@1.0.0-next.4
  - @remirror/extension-positioner@1.0.0-next.4
  - @remirror/i18n@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/preset-core@1.0.0-next.4
  - @remirror/preset-react@1.0.0-next.4
  - @remirror/react-utils@1.0.0-next.4
  - @remirror/theme@1.0.0-next.4
  - @remirror/extension-react-component@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/extension-placeholder@1.0.0-next.3
  - @remirror/extension-positioner@1.0.0-next.3
  - @remirror/i18n@1.0.0-next.3
  - @remirror/preset-core@1.0.0-next.3
  - @remirror/preset-react@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Minor Changes

- Add support for `React.StrictMode`.

  Previously, activating `StrictMode` would cause the components to render twice and break
  functionality of `RemirrorProvider` due to an outdated check on whether `getRootProps` had been
  called. This check has been removed since it isn't needed anymore.

### Patch Changes

- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.2
  - @remirror/react-utils@1.0.0-next.2
  - @remirror/extension-placeholder@1.0.0-next.2
  - @remirror/extension-positioner@1.0.0-next.2
  - @remirror/preset-core@1.0.0-next.2
  - @remirror/preset-react@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/extension-placeholder@1.0.0-next.1
  - @remirror/extension-positioner@1.0.0-next.1
  - @remirror/i18n@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/preset-core@1.0.0-next.1
  - @remirror/preset-react@1.0.0-next.1
  - @remirror/react-utils@1.0.0-next.1
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

- 09e990cb: Update `EditorManager` / `ExtensionManager` name to be \*\*`RemirrorManager`.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/extension-placeholder@1.0.0-next.0
  - @remirror/extension-positioner@1.0.0-next.0
  - @remirror/i18n@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/preset-core@1.0.0-next.0
  - @remirror/preset-react@1.0.0-next.0
  - @remirror/react-utils@1.0.0-next.0
  - @remirror/theme@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1

## 0.11.0

### Minor Changes

- 026d4238: Add a `focus` method to the remirror editor context object. It allows focusing at a
  provided position which can be `start`, `end`, a specific position or a range using the
  `{from: number; to: number}` type signature.

  To use this run

  ```tsx
  import { useRemirrorContext } from '@remirror/react';

  const MyEditor = () => {
    const { focus, getRootProps } = useRemirrorContext();

    useEffect(() => {
      focus('end'); // Autofocus to the end once
    }, []);
  };
  return <div {...getRootProps()} />;
  ```

  Resolves the initial issue raised in #229.

- 69d00c62: Add custom arguments to `autoFocus` props. The same arguments that can added to the
  `focus()` context method can now be passed as a prop.

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0
  - @remirror/core-extensions@0.11.0
  - @remirror/react-ssr@0.11.0

## 0.7.7

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - @remirror/react-utils@0.7.6
  - @remirror/ui@0.7.6
  - @remirror/react-ssr@0.7.6

## 0.7.6

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - @remirror/core-extensions@0.7.5
  - @remirror/react-utils@0.7.5
  - @remirror/ui@0.7.5
  - @remirror/react-ssr@0.7.5

## 0.7.5

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react-portals@0.7.4
  - @remirror/react-ssr@0.7.4
  - @remirror/react-utils@0.7.4
  - @remirror/ui@0.7.4

## 0.7.4

### Patch Changes

- 416d65da: Better code comment docs around how to apply additional extensions (#186).

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/react-portals@0.7.3
  - @remirror/react-ssr@0.7.3
  - @remirror/react-utils@0.7.3
  - @remirror/ui@0.7.3
