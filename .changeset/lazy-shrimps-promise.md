---
'@remirror/react': patch
---

- Prevent `createReactManager` being called on every render.
- Accept a `manager` as a parameter for ``createReactManager`
- Improve internal performance of components by caching the `ReactEditorWrapper` after the first render.
