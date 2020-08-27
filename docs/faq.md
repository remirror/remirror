---
title: 'Frequently asked questions'
---

Some of the answers outlined here may be helpful to you if you're stuck somewhere. They're questions that are asked quite frequently on GitHub and in our [discord](https://remirror.io/chat) channel.

### Is there any way to get the value of the editor already parsed to HTML?

There's are methods available in `remirror/core`. `toHtml` which converts the provided node to a HTML string, and `fromHtml` which takes the html string you've provided and converts it into a value that can be used within remirror.

To get the html string from the editor the following should work well for you.

```tsx
import { toHtml } from 'remirror/core';

const htmlString = toHtml({ node: state.doc, schema: state.schema });
```
