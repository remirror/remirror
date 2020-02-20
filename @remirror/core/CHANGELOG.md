# @remirror/core

## 0.8.0

### Minor Changes

- 24f83413: - Change the signature of `CommandFunction` to only accept one parameter which contains
  `dispatch`, `view`, `state`.

  - Create a new exported `ProsemirrorCommandFunction` type to describe the prosemirror commands which are
    still used in the codebase.
  - Rename `KeyboardBindings` to `KeyBindings`. Allow `CommandFunctionParams` to provide extra parameters like
    `next` in the newly named `KeyBindings`.
  - Create a new `KeyBindingCommandFunction` to describe the `Extension.keys()` return type. Update the name
    of the `ExcludeOptions.keymaps` -> `ExcludeOptions.keys`.

  **BREAKING CHANGE**

- 24f83413: Improve the way `ExtensionManager` calls `Extension.keys` methods. Keys now use the new api for
  CommandFunctions which provides a `next` method. This method allows for better control when deciding whether
  or not to defer to the next keybinding in the chain.

  To override, create a new keybinding with another extension. Make sure the extension is created with a
  higher priority. The keybinding you create can either return true or false. By default if it returns true,
  no other keybindings will run. However if it returns `false` all other keybindings will be run until one
  returns `true`

  `next` basically calls the every lower priority keybinding in the extensions list. It gives you full control
  of how the bindings are called.

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
