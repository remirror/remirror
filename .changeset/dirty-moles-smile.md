---
'@remirror/core': major
---

🎉 Add support for position tracking to `CommandsExtension`.

- New commands are available.
  - `commands.addPositionTracker`
  - `commands.removePositionTracker`.
  - `commands.clearPositionTrackers`.
- New exports from `@remirror/core` including `delayedCommand` which is a building block for creating your own delayed commands.
- **BREAKING:** 💥 Rename `clearRangeSelection` to `emptySelection` and fix a bug where it would always select the `from` rather than the `anchor`.
- Add store property `this.store.rawCommands` for access to the original command functions which can sometimes come in handy. Also add it to the manager store and export new type named `RawCommandsFromExtensions`
- Add `initialState` as a property of the `BaseFramework`.
- **BREAKING** 💥 Require the `Framework` to be attached to the manager before any calls to `getState` are allowed. If you're using `jest-remirror` this change might break some of your tests that don't recreate the editor between tests.
- `commands.insertText` now support delayed commands.
- `commands.insertText` now supports adding marks to the added text.

```ts
commands.insertText('Hello', {
  marks: {
    // The empty object `{}` represents the attributes being added.
    bold: {},
  },
});
```
