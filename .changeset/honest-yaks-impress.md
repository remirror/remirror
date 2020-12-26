---
'@remirror/core': major
'@remirror/dom': major
'@remirror/react-social': major
'@remirror/extension-react-component': patch
'@remirror/preset-core': patch
'@remirror/react': patch
'@remirror/styles': patch
'jest-remirror': patch
---

Refactor `RemirrorManager` and rename `EditorWrapper` to `Framework`.

- New `BaseFramework` interface which is implemented by the abstract `Framework` class and used by the `RemirrorManager` to keep hold of an instance of the `Framework`.
- New `attachFramework` method on the manager.
- Update `doc` property to `document` throughout the codebase. `doc` could be confused with the `doc` node or the actual document. Now it's clearer. Any time `doc` is mentioned in the code base it refers to the `ProseMirror` node. Any time `document` is mentioned it is referring to the DOM.
- Remove `SocialEditorWrapperComponent` export from `@remirror/react-social`.
