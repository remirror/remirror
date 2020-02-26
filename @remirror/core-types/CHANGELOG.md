# @remirror/core-types

## 0.9.0

### Minor Changes

- 0300d01c: - Auto defined `isEnabled` via commands with `dispatch=undefined`.
  - `HistoryExtension` now checks that whether `dispatch=undefined`.
  - Remove `CommandStatusCheck`.
  - Add new type `ExtensionIsActiveFunction` which doesn't take the command name.
  - Remove `isEnabled` from `Extension` interface.

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

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/react-portals@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-constants@0.7.3
  - @remirror/react-portals@0.7.3
