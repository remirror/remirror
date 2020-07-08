---
'@remirror/extension-react-component': major
'@remirror/preset-react': minor
'@remirror/react': major
'@remirror/react-utils': minor
---

Add a new extension package `@remirror/extension-react-component` for creating ProseMirror `NodeView`'s from React components.

- Move `ReactPortal` implementation from `@remirror/react` to `@remirror/react-utils` for usage in other parts of the application.
- Move `ReactNodeView` into new package `@remirror/extension-react-component`.
- Rename `ReactNodeView.createNodeView` to `ReactNodeView.create`.

The new package adds the `ReactComponent` property to the extension interface. An extension with a component attached will use it to override the automatic DOM representation with a ProseMirror `NodeView`.
