---
hide_title: true
title: Creating Extensions
---

# Creating Extensions

There are three extension types.

- `PlainExtension` - An extension which has no representation in the editable document but adds commands and other functionality that make working with documents manageable. All the `builtin` extensions are plain extensions. The `SchemaExtension` is used to create the `Schema` and add extra attributes to the nodes and marks in your editor.
- `NodeExtension` - A node extension add the ProseMirror representation of the core [`ProsemirrorNode`](https://prosemirror.net/docs/ref/#model.Node) to you editor. Examples including the `ImageExtension` and the `ParagraphExtension`. Nodes can both by inline and block.
- `MarkExtension` - A mark extensions adds the definition for a ProseMirror [Mark](https://prosemirror.net/docs/ref/#model.Mark) to the editor. A mark is like persistent meta data that can be attached to a node. It is used to add formatting and examples of this include the `BoldExtension` and the `ItalicExtension`.

The node and mark extensions get their name from the underlying prosemirror implementation. If you have time it's not a bad idea to peruse though the [prosemirror documentation](https://prosemirror.net/docs/guide/).

Naming conventions for npm packages:

- remirror-preset-<%NAME> For composing extensions together.
- remirror-extension-<%NAME> For adding behaviour.
