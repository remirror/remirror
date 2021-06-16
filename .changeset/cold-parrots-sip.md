---
'prosemirror-paste-rules': major
---

Update the API:

- For `type: "node"`: removed the `transformMatch` parameter and added a new `getContent` parameter, which can add custom content to the created node. By using `getContent`, users can set content as not only a text node, but also `undefined` or something more complex.
