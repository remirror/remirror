# @remirror/core

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- 898c62e0: Export `BuiltinOptions` interface from `@remirror/core`.

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from
  `@remirror/core-utils`.
- 6e8b749a: Rename `nodeEqualsType` to `isNodeOfType`.
- 982a6b15: **BREAKING:**: rename `createSuggestions` to `createSuggesters` to keep in line with the
  update from `prosemirror-suggest`.

  **BREAKING:** `@remirror-core` - rename `SuggestionsExtension` to `SuggestExtension`

  `@remirror-core` - Add `builtins` parameter to `Remirror.ManagerSettings`.

- 6c6d524e: **Breaking Changes** 💥

  Rename `contains` to `containsNodesOfType`.

  Make `isValidPresetConstructor` internal only.

  Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

  Remove method:
  `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()`
  and type:
  `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags`
  exports from `jest-remirror`.

  Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from
  `multishift`.

### Minor Changes

- be9a9c17: Move all keymap functionality to `KeymapExtension` from `@remirror/core`. Remove all
  references to `@remirror/extension-base-keymap`.
- 720c9b43: Public `dynamicKeys` property now available on `Extension`'s and `Preset`'s.

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
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
  - @remirror/core-types@1.0.0-next.16
  - @remirror/core-utils@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Major Changes

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`,
  `areSchemaCompatible` and `getRemirrorJSON`.

  BREAKING: 💥 Rename `getObjectNode` to `getRemirrorJSON`.

- a404f5a1: Add the option `excludeExtensions` to `CorePreset`'s `constructor` to exclude any
  extensions.

  Remove the option `excludeHistory` from `CorePreset`'s `constructor`.

### Minor Changes

- 44516da4: Support `chained` commands and multiple command updates in controlled editors.

  Fixes #418

- e5ea0c84: Add support for `Handler` options with custom return values and early returns.

  Previously handlers would ignore any return values. Now a handler will honour the return value.
  The earlyReturn value can be specified in the static options using the `extensionDecorator`.
  Currently it only supports primitives. Support for a function to check the return value will be
  added later.

- 6c3b278b: Make sure the `transaction` has all the latest updates if changed between
  `onStateUpdate` events. This allows chaining to be supported properly.

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
  - @remirror/core-utils@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Major Changes

- 92342ab0: Throw error in `Preset` and `Extension` when attempting to update a non-dynamic option
  at runtime.

### Minor Changes

- e45706e5: Add new `extensionDecorator` function which augments the static properties of an
  `Extension` constructor when used as a decorator.

  The following code will add a decorator to the extension.

  ```ts
  import { PlainExtension, ExtensionPriority, extensionDecorator } from 'remirror/core';

  interface ExampleOptions {
    color?: string;

    /**
     * This option is annotated as a handler and needs a static property.
     **/
    onChange?: Handler<() => void>;
  }

  @extensionDecorator<ExampleOptions>({
    defaultOptions: { color: 'red' },
    defaultPriority: ExtensionPriority.Lowest,
    handlerKeys: ['onChange'],
  })
  class ExampleExtension extends PlainExtension<ExampleOptions> {
    get name() {
      return 'example' as const;
    }
  }
  ```

  The extension decorator updates the static properties of the extension. If you prefer not to use
  decorators it can also be called as a function. The `Extension` constructor is mutated by the
  function call and does not need to be returned.

  ```ts
  extensionDecorator({ defaultSettings: { color: 'red' } })(ExampleExtension);
  ```

- f3155b5f: Add new `presetDecorator` function which augments the static properties of an `Preset`
  constructor when used as a decorator.

  The following code will add a decorator to the preset.

  ```ts
  import { Preset presetDecorator } from 'remirror/core';

  interface ExampleOptions {
    color?: string;

    /**
     * This option is annotated as a handler and needs a static property.
     **/
    onChange?: Handler<() => void>;
  }

  @presetDecorator<ExampleOptions>({
    defaultOptions: { color: 'red' },
    handlerKeys: ['onChange'],
  })
  class ExamplePreset extends Preset<ExampleOptions> {
    get name() {
      return 'example' as const;
    }
  }
  ```

  The preset decorator updates the static properties of the preset. If you prefer not to use
  decorators it can also be called as a function. The `Preset` constructor is mutated by the
  function call and does not need to be returned.

  ```ts
  presetDecorator({ defaultSettings: { color: 'red' }, handlerKeys: ['onChange'] })(ExamplePreset);
  ```

- 4571a447: Use methods for `addHandler` and `addCustomHandler`

  `@remirror/react` - Bind `addHandler` and `addCustomHandler` for `Preset` and `Extension` hooks.

### Patch Changes

- d877adb3: Switch to using method signatures for extension class methods as discussed in #360. The
  following methods have been affected:

  ```
  createKeymap
  createInputRules
  createPasteRules
  ```

- cc5c1c1c: Remove static properties and use the `@extensionDecorator` instead.
- Updated dependencies [e45706e5]
- Updated dependencies [92342ab0]
  - @remirror/core-types@1.0.0-next.13
  - @remirror/core-constants@1.0.0-next.13
  - @remirror/core-helpers@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Minor Changes

- 19b3595f: `isNodeActive` now matches partial attribute objects. Fixes #385.
- d8aa2432: Remove type guard from `isEmptyArray` and `isEmptyObject` as they were incorrect.

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core-utils@1.0.0-next.12
  - @remirror/core-helpers@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Minor Changes

- 54461006: Remove the first parameter `extensions` from the lifecycle methods `onCreate`, `onView`
  and `onDestroy`.

  Switch to using method signatures for extension class methods as discussed in #360. The following
  methods have been affected:

  ```
  onCreate
  onView
  onStateUpdate
  onDestroy
  createAttributes
  createCommands
  createPlugin
  createExternalPlugins
  createSuggestions
  createHelpers
  fromObject
  onSetOptions
  ```

### Patch Changes

- Updated dependencies [21a9650c]
  - @remirror/core-helpers@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 6468058a: `RemirrorManager.create` can now accept a function to which returns an array of
  extensions and presets. This lazy creation allows for optimizations to be made elsewhere in the
  codebase.

## 1.0.0-next.9

> 2020-07-23

### Major Changes

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

## 1.0.0-next.4

> 2020-07-16

### Minor Changes

- 64edeec2: Add blur method to the editor context which is used in the `@remirror/react` and
  `@remirror/dom` libraries.
- 9f495078: Move `suppressHydrationWarning` prop from core to to react editor. It makes no sense for
  it to be in core since it only impacts the react editor.

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/core-utils@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core-types@1.0.0-next.3
  - @remirror/core-utils@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Minor Changes

- Add support for `React.StrictMode`.

  Previously, activating `StrictMode` would cause the components to render twice and break
  functionality of `RemirrorProvider` due to an outdated check on whether `getRootProps` had been
  called. This check has been removed since it isn't needed anymore.

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/core-utils@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1

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
- 09e990cb: Update `EditorManager` / `ExtensionManager` name to be \*\*`RemirrorManager`.

### Minor Changes

- Previously the `useRemirror` hook only updated when the provider was updated. There are times when
  you want to listen to specific changes from inside the editor.

  The `useRemirror` hook now takes an optional `onChange` argument which is called on every change
  to the editor state. With this you can react to updates in your editor and add some really cool
  effects.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/core-utils@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0

## 0.11.0

### Patch Changes

- c2237aa0: Allow empty string default value for extraAttrs

## 0.9.0

### Minor Changes

- 0300d01c: - Auto defined `isEnabled` via commands with `dispatch=undefined`.
  - `HistoryExtension` now checks that whether `dispatch=undefined`.
  - Remove `CommandStatusCheck`.
  - Add new type `ExtensionIsActiveFunction` which doesn't take the command name.
  - Remove `isEnabled` from `Extension` interface.

### Patch Changes

- Updated dependencies [c4645570]
- Updated dependencies [0300d01c]
  - @remirror/core-utils@0.8.0
  - @remirror/core-types@0.9.0
  - prosemirror-suggest@0.7.6
  - @remirror/core-helpers@0.7.6

## 0.8.1

### Patch Changes

- 2904ebfd: Fix problem with build outputting native classes which can't be extended when the build
  process converts classes to their ES% function equivalent.

## 0.8.0

### Minor Changes

- 24f83413: - Change the signature of `CommandFunction` to only accept one parameter which contains
  `dispatch`, `view`, `state`.

  - Create a new exported `ProsemirrorCommandFunction` type to describe the prosemirror commands
    which are still used in the codebase.
  - Rename `KeyboardBindings` to `KeyBindings`. Allow `CommandFunctionParams` to provide extra
    parameters like `next` in the newly named `KeyBindings`.
  - Create a new `KeyBindingCommandFunction` to describe the `Extension.keys()` return type. Update
    the name of the `ExcludeOptions.keymaps` -> `ExcludeOptions.keys`.

  **BREAKING CHANGE**

- 24f83413: Improve the way `ExtensionManager` calls `Extension.keys` methods. Keys now use the new
  api for CommandFunctions which provides a `next` method. This method allows for better control
  when deciding whether or not to defer to the next keybinding in the chain.

  To override, create a new keybinding with another extension. Make sure the extension is created
  with a higher priority. The keybinding you create can either return true or false. By default if
  it returns true, no other keybindings will run. However if it returns `false` all other
  keybindings will be run until one returns `true`

  `next` basically calls the every lower priority keybinding in the extensions list. It gives you
  full control of how the bindings are called.

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5
  - @remirror/core-utils@0.7.5
  - prosemirror-suggest@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4
  - @remirror/core-utils@0.7.4
  - @remirror/react-portals@0.7.4
  - prosemirror-suggest@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
  - @remirror/core-utils@0.7.3
  - @remirror/react-portals@0.7.3
  - prosemirror-suggest@0.7.3
