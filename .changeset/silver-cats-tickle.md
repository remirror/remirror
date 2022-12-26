---
'@remirror/core': patch
---

When updating keymap bindings (e.g. with `useKeymap(...)` React hook), `KeymapExtension` won't trigger an editor state update anymore and it also won't [reconfigure](https://prosemirror.net/docs/ref/#state.EditorState.reconfigure) all plugins. This could bring a significant performance boost because some plugins (e.g. `YjsExtension`) are expensive to reconfigure.
