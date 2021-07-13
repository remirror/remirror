---
hide_title: true
title: Frequently asked questions
---

# Frequently Asked Questions

Some of the answers outlined here may be helpful to you if you're stuck somewhere. They're questions that are asked quite frequently on GitHub and in our [discord](https://remirror.io/chat) channel.

### Is there any way to get the value of the editor already parsed to HTML

There's are methods available in `remirror/core`. `prosemirrorNodeToHtml` which converts the provided node to a HTML string, and `htmlToProsemirrorNode` which takes the html string you've provided and converts it into a value that can be used within `remirror`. Please note this does not sanitize the HTML, if you would like to sanitize your html then consider using a library like [xss](https://github.com/leizongmin/js-xss).

To get the html string from the editor the following should work well for you.

```tsx
import { prosemirrorNodeToHtml } from 'remirror';

const htmlString = prosemirrorNodeToHtml({ node: state.doc, schema: state.schema });
```

To convert a html string to a valid node, the following should work.

```tsx
import { htmlToProsemirrorNode } from 'remirror';

const doc = htmlToProsemirrorNode({ html, schema: state.schema });
```
