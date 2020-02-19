---
'@remirror/core-types': minor
'@remirror/core': minor
---

- Change the signature of `CommandFunction` to only accept one parameter which contains `dispatch`, `view`,
  `state`.
- Create a new exported `ProsemirrorCommandFunction` type to describe the prosemirror commands which are still
  used in the codebase.
- Rename `KeyboardBindings` to `KeyBindings`. Allow `CommandFunctionParams` to provide extra parameters like
  `next` in the newly named `KeyBindings`.
- Create a new `KeyBindingCommandFunction` to describe the `Extension.keys()` return type. Update the name of
  the `ExcludeOptions.keymaps` -> `ExcludeOptions.keys`.

**BREAKING CHANGE**
