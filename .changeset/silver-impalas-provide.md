---
'@remirror/core-types': minor
'@remirror/core': minor
'@remirror/core-extensions': patch
---

- Auto defined `isEnabled` via commands with `dispatch=undefined`.
- `HistoryExtension` now checks that whether `dispatch=undefined`.
- Remove `CommandStatusCheck`.
- Add new type `ExtensionIsActiveFunction` which doesn't take the command name.
- Remove `isEnabled` from `Extension` interface.
