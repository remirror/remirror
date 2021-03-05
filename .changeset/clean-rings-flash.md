---
'@remirror/react-renderer': minor
---

Make react-renderer composable. Before, it was hard to add further node renderer to RemirrorRenderer. Users couldn't use the existing node renderer like `TextHandler` and `CodeBlock` because they weren't exported. This commit simplifies composing a static renderer for the user's needs by exporting the renderers and the interface required to write custom node renderers. As part of the commit, the complex renderer file is split into smaller - easier to understand and test - units.
