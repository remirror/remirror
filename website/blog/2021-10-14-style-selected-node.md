---
slug: style-selected-node
title: Styling selected nodes in Remirror
author: Ronny Roeller
author_title: Remirror Maintainer
author_url: https://github.com/ronnyroeller
author_image_url: https://avatars.githubusercontent.com/u/9339055?v=4
tags: [remirror, tip, styling]
---

_TLDR: Use shadow-box to tune the look of selected nodes in Remirror editor_

<!-- truncate -->

A core concept of Remirror are `ReactNodeViews`, which allow developers to add custom nodes into a document. For example, a Remirror document might embed a user card with the user's photo, name, and so on. The Remirror document would store that a specific user was referenced. The `ReactNodeView` would be in charge of rendering the referenced user as a beautiful card. When the user selects such a node, Remirror will show by default a thin blue border around the node. Remirror does that by adding the CSS style `ProseMirror-selectednode`, which sets the `outline` property for the node.

Unfortunately, the CSS property `outline` has a couple of limitations like not allowing for a radius. The obvious alternative would be the CSS property `border`. Unfortunately, this won't work either because borders are part of the element whereas we want the selection to be visualized outside the element. Simply put, `border` would require to always block the space required for the border - thereby misaligning the node when it's not selected.

Luckily, `shadow-box` is rendered outside the element and respects the border radius of the element. This means we can actually get both via:

```css
.remirror-editor .ProseMirror-selectednode: {
  // Hide default outline
  outline: 0,
  boxShadow: 0 0 0 2px red,
  borderRadius: 4px,
  overflow: hidden,
 },
```

Note the final `overflow: hidden`. This ensure that the content of the selected node doesn't run over our border.

Happy coding!

_This post was originally published on [Medium](https://medium.com/collaborne-engineering/styling-selected-nodes-in-remirror-57ef274206c6)._
