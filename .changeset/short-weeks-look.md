---
'@remirror/core': major
'@remirror/extension-react-component': major
'@remirror/extension-react-ssr': major
'@remirror/react': minor
'jest-remirror': minor
---

Add support for nested content within `ReactComponent` node views. Also support adding multiple components to the manager via the `nodeViewComponents` setting. Currently `ReactNodeView` components must be defined at initialization, and marks are not supported.

- Also enforce minimum required extensions for the manager passed to the `RemirrorProvider`.
- Some general cleanup and refactoring.
- Add support for composing refs when using `getRootProps`. Now you can add your own ref to the `getRootProps({ ref })` function call which will be populated at the same time.
- Test the names of `Extension`'s and `Preset`'s in with `extensionValidityTest`.
- **BREAKING CHANGES** 💥
  - Rename: `ReactSSRExtension` => `ReactSsrExtension`
  - Rename: `ReactComponentExtension.name` from `reactNodeView` => `reactComponent`.
  - Rename: `NodeViewsExtension` => `NodeViewExtension`
  - Rename: `NodeViewsExtension` => `NodeViewExtension`
  - Rename: `SuggestExtension.name` from `suggestions` => `suggest`
