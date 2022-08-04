---
'@remirror/react-core': patch
'@remirror/dev': patch
'@remirror/extension-file': patch
'@remirror/extension-react-tables': patch
'@remirror/react': patch
'@remirror/react-components': patch
'@remirror/react-editors': patch
'@remirror/react-hooks': patch
---

Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.
