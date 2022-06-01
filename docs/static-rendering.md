---
hide_title: true
title: Read only/Static rendering
---

# Read only/Static rendering

In most cases, users view the Remirror document directly in the editor. Yet, there are use cases where creating and viewing the document are distinct, e.g.:

- **Different users**: For example, a user writes a news article in Remirror which is then viewed by many other users. In this case, the viewer must not be allowed to edit the article.
- **Different points in time**: For example, a user captures its daily thoughts in a document and wants to view them a couple of weeks later. In this case, the user prefers a leaner experience to read the document.

## Read-only editor

The easiest option is to set the editor as read-only:

```tsx
import React from 'react';
import {Remirror} from 'packages/remirror__react/dist/remirror-react.cjs';

const Editor = () => {
  return <Remirror editable={false}/>;
};
```

On the upside, this approach leads to the identical rendering as in editable mode. On the downside, rendering is as expensive as in editable mode.

## React renderer

The react-render provides a more efficient way to visualize Remirror documents: It renders the document directly to HTML, by-passing the editor completely. This implies that the visualization can look differently from the editor and that you'll have to implement rendering for all your custom node types.

See [storybook](https://remirror.vercel.app/?path=/story/editors-react-renderer-static-html--basic) for example usage.

_Note: Today only the most widely Remirror node types are supported by the react-render. Please file a ticket (or even better PR) if you require further node types._
