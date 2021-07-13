---
'prosemirror-paste-rules': major
---

Update the API:

- For `type: "node"`: removed the `transformMatch` parameter and added a new optional `getContent` parameter, which is a function that transforms the match into content when creating the node. By using `getContent`, users can set content as not only a text node, but also `undefined` or something more complex.
